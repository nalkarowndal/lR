import { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';
import { getDatabase } from '../db/database.js';
import { config } from '../config/env.js';
import { generateSessionToken, hashPassword } from '../utils/crypto.js';
import { parseCookies } from '../middlewares/auth.js';

/**
 * GET /api/v1/auth/google/status
 * Check whether Google OAuth 2.0 is configured on the server.
 */
export function getGoogleStatus(_req: Request, res: Response) {
  const isConfigured = Boolean(config.googleClientId && config.googleClientId.trim() !== '');
  return res.json({
    success: true,
    configured: isConfigured,
    redirectUri: config.googleRedirectUri,
    hasClientSecret: Boolean(config.googleClientSecret && config.googleClientSecret.trim() !== ''),
    authBaseUrl: config.googleAuthBaseUrl
  });
}

/**
 * GET /api/v1/auth/google
 * Initiates the Google OAuth 2.0 authorization request.
 * Generates single-use CSRF state, stores in SQLite + HttpOnly cookie, and redirects to Google.
 */
export function startGoogleLogin(req: Request, res: Response) {
  try {
    // 1. Verify that Google Client ID is configured
    if (!config.googleClientId || config.googleClientId.trim() === '') {
      const acceptsJson = req.xhr || req.headers.accept?.includes('application/json');
      if (acceptsJson) {
        return res.status(400).json({
          success: false,
          error: 'GOOGLE_NOT_CONFIGURED',
          message: 'Google Client ID가 서버 환경변수(GOOGLE_CLIENT_ID)에 설정되어 있지 않습니다.'
        });
      }
      return res.redirect(`${config.frontendUrl}/?oauth=config_required&provider=google`);
    }

    // 2. Generate cryptographically strong random state (32 bytes = 64 hex chars)
    const state = crypto.randomBytes(32).toString('hex');

    // 3. Optional return_to query parameter with strict whitelist validation
    let returnTo = '/';
    if (typeof req.query.return_to === 'string' && req.query.return_to.startsWith('/')) {
      returnTo = req.query.return_to;
    }

    // 4. Save state into SQLite oauth_states table with 10-minute expiry
    const db = getDatabase();
    try {
      db.prepare(`DELETE FROM oauth_states WHERE expires_at <= datetime('now')`).run();
    } catch {}

    db.prepare(`
      INSERT INTO oauth_states (state, provider, redirect_uri, return_to, expires_at)
      VALUES (?, 'google', ?, ?, datetime('now', '+10 minutes'))
    `).run(state, config.googleRedirectUri, returnTo);

    // 5. Store state in HttpOnly Cookie for double-submit / CSRF defense
    res.cookie('google_oauth_state', state, {
      httpOnly: true,
      sameSite: 'lax',
      secure: config.nodeEnv === 'production',
      maxAge: 10 * 60 * 1000,
      path: '/'
    });

    // 6. Build Google Authorization URL
    const params = new URLSearchParams({
      client_id: config.googleClientId,
      redirect_uri: config.googleRedirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      state: state,
      access_type: 'offline',
      prompt: 'select_account'
    });

    const authorizeUrl = `${config.googleAuthBaseUrl}?${params.toString()}`;

    if (req.xhr || (req.query.format === 'json')) {
      return res.json({
        success: true,
        redirectUrl: authorizeUrl,
        state
      });
    }

    return res.redirect(authorizeUrl);
  } catch (err) {
    console.error('[GoogleOAuth] Failed to initiate login:', err);
    return res.redirect(`${config.frontendUrl}/?oauth=error&provider=google&reason=initiation_failed`);
  }
}

/**
 * GET /api/v1/auth/google/callback
 * Handles the authorization code response from Google.
 */
export async function handleGoogleCallback(req: Request, res: Response) {
  try {
    const db = getDatabase();

    // 1. Check for error response from Google
    if (req.query.error) {
      const errCode = String(req.query.error);
      const errDesc = String(req.query.error_description || '');
      console.warn(`[GoogleOAuth] Authorization error returned: ${errCode} (${errDesc})`);

      if (errCode === 'access_denied') {
        return res.redirect(`${config.frontendUrl}/?oauth=cancelled&provider=google`);
      }
      return res.redirect(
        `${config.frontendUrl}/?oauth=error&provider=google&reason=${encodeURIComponent(errDesc || errCode)}`
      );
    }

    // 2. Validate state parameter
    const queryState = typeof req.query.state === 'string' ? req.query.state : '';
    if (!queryState) {
      console.warn('[GoogleOAuth] Callback missing state parameter');
      return res.redirect(`${config.frontendUrl}/?oauth=invalid_state&provider=google`);
    }

    // Atomic lookup & consume from SQLite to prevent replay attacks
    const stateRecord = db.prepare(`
      SELECT state, return_to, redirect_uri 
      FROM oauth_states 
      WHERE state = ? AND provider = 'google' AND expires_at > datetime('now')
    `).get(queryState) as { state: string; return_to: string; redirect_uri: string } | undefined;

    db.prepare('DELETE FROM oauth_states WHERE state = ?').run(queryState);

    if (!stateRecord) {
      console.warn('[GoogleOAuth] State invalid, expired, or already consumed:', queryState);
      return res.redirect(`${config.frontendUrl}/?oauth=invalid_state&provider=google`);
    }

    // Verify double-submit cookie if present
    const cookieState = req.headers.cookie ? parseCookies(req.headers.cookie).google_oauth_state : undefined;
    if (cookieState && cookieState !== queryState) {
      console.warn('[GoogleOAuth] CSRF Cookie mismatch with query state');
      return res.redirect(`${config.frontendUrl}/?oauth=csrf_mismatch&provider=google`);
    }

    res.clearCookie('google_oauth_state', { path: '/' });

    // 3. Validate authorization code
    const code = typeof req.query.code === 'string' ? req.query.code : '';
    if (!code) {
      console.warn('[GoogleOAuth] Missing authorization code');
      return res.redirect(`${config.frontendUrl}/?oauth=missing_code&provider=google`);
    }

    // 4. Exchange authorization code for tokens with Google
    const tokenRequestBody = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: config.googleClientId,
      client_secret: config.googleClientSecret,
      redirect_uri: stateRecord.redirect_uri || config.googleRedirectUri,
      code: code
    });

    const tokenRes = await fetch(config.googleTokenBaseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: tokenRequestBody.toString()
    });

    if (!tokenRes.ok) {
      const errorBody = await tokenRes.text().catch(() => '');
      console.error('[GoogleOAuth] Token exchange failed with status', tokenRes.status, errorBody);
      return res.redirect(`${config.frontendUrl}/?oauth=token_exchange_failed&provider=google`);
    }

    const tokenData = await tokenRes.json() as { access_token?: string; token_type?: string };
    const accessToken = tokenData.access_token;
    if (!accessToken) {
      console.error('[GoogleOAuth] No access_token found in token response');
      return res.redirect(`${config.frontendUrl}/?oauth=token_exchange_failed&provider=google`);
    }

    // 5. Fetch user profile from Google UserInfo endpoint
    const userRes = await fetch(config.googleUserInfoUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });

    if (!userRes.ok) {
      const errorBody = await userRes.text().catch(() => '');
      console.error('[GoogleOAuth] User info fetch failed with status', userRes.status, errorBody);
      return res.redirect(`${config.frontendUrl}/?oauth=profile_fetch_failed&provider=google`);
    }

    const googleProfile = await userRes.json() as {
      sub: string;
      name?: string;
      email?: string;
      picture?: string;
      email_verified?: boolean;
    };

    const googleUserId = String(googleProfile.sub || '');
    if (!googleUserId || googleUserId === 'undefined') {
      console.error('[GoogleOAuth] Invalid Google user ID (sub) received');
      return res.redirect(`${config.frontendUrl}/?oauth=invalid_user_id&provider=google`);
    }

    const nickname = googleProfile.name?.trim() || 'Google 회원';
    const avatarUrl = googleProfile.picture || '';
    const rawEmail = googleProfile.email?.trim();

    // 6. User Mapping & Persistence
    const existingOAuth = db.prepare(`
      SELECT oa.user_id, u.id, u.email, u.name, u.role
      FROM user_oauth_accounts oa
      JOIN users u ON u.id = oa.user_id
      WHERE oa.provider = 'google' AND oa.provider_user_id = ?
    `).get(googleUserId) as { user_id: number; id: number; email: string; name: string; role: string } | undefined;

    let targetUserId: number;

    if (existingOAuth) {
      // Existing Google user login
      targetUserId = existingOAuth.id;

      db.prepare(`
        UPDATE user_oauth_accounts
        SET updated_at = datetime('now'), profile_data = ?
        WHERE provider = 'google' AND provider_user_id = ?
      `).run(JSON.stringify({ nickname, avatarUrl, google_id: googleUserId }), googleUserId);

      if (avatarUrl) {
        db.prepare(`
          UPDATE users 
          SET avatar_url = ? 
          WHERE id = ? AND (avatar_url IS NULL OR avatar_url = '')
        `).run(avatarUrl, targetUserId);
      }
    } else {
      // New Google user registration
      if (rawEmail) {
        const existingEmailUser = db.prepare('SELECT id, email FROM users WHERE email = ?').get(rawEmail) as { id: number; email: string } | undefined;
        if (existingEmailUser) {
          console.warn(`[GoogleOAuth] Account conflict: Email ${rawEmail} already exists in DB.`);
          return res.redirect(`${config.frontendUrl}/?oauth=email_conflict&email=${encodeURIComponent(rawEmail)}`);
        }
      }

      const accountEmail = rawEmail || `google_${googleUserId}@oauth.luxuryrental.com`;
      const randomPassword = crypto.randomBytes(32).toString('hex');
      const passwordHash = hashPassword(randomPassword);

      // Insert new user strictly with role = 'USER'
      const insertUser = db.prepare(`
        INSERT INTO users (email, password_hash, name, phone, avatar_url, role, marketing_consent)
        VALUES (?, ?, ?, '', ?, 'USER', 0)
      `);
      const insertResult = insertUser.run(accountEmail, passwordHash, nickname, avatarUrl);
      targetUserId = Number(insertResult.lastInsertRowid);

      // Insert OAuth account link
      db.prepare(`
        INSERT INTO user_oauth_accounts (user_id, provider, provider_user_id, profile_data)
        VALUES (?, 'google', ?, ?)
      `).run(targetUserId, googleUserId, JSON.stringify({ nickname, avatarUrl, google_id: googleUserId }));

      // Initialize default user settings
      db.prepare(`
        INSERT OR IGNORE INTO user_settings (user_id, service_notifications, marketing_notifications, product_notifications, reduce_animations, theme)
        VALUES (?, 1, 0, 1, 0, 'light')
      `).run(targetUserId);

      // Record legal consents audit trail
      try {
        const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || '';
        const userAgent = (req.headers['user-agent'] as string) || '';
        const insertConsent = db.prepare(`
          INSERT INTO user_consents (user_id, doc_type, version, agreed, ip_address, user_agent)
          VALUES (?, ?, 'v2.1', 1, ?, ?)
        `);
        insertConsent.run(targetUserId, 'TERMS_OF_SERVICE', ip, userAgent);
        insertConsent.run(targetUserId, 'PRIVACY_COLLECTION', ip, userAgent);
      } catch (auditErr) {
        console.warn('[Audit] Failed to log OAuth consent:', auditErr);
      }
    }

    // 7. Issue Session Token
    const sessionToken = generateSessionToken();
    db.prepare(`
      INSERT INTO sessions (token, user_id, expires_at)
      VALUES (?, ?, datetime('now', '+7 days'))
    `).run(sessionToken, targetUserId);

    // 8. Set secure HttpOnly session cookie
    res.cookie('lr_session', sessionToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: config.nodeEnv === 'production',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // 9. Redirect to frontend with success indicator
    return res.redirect(`${config.frontendUrl}/?oauth=success&provider=구글`);
  } catch (err) {
    console.error('[GoogleOAuth] Callback processing error:', err);
    return res.redirect(`${config.frontendUrl}/?oauth=error&provider=google&reason=internal_server_error`);
  }
}

/**
 * POST /api/v1/auth/google/unlink
 * Unlinks the user's Google account. Requires authenticated user.
 */
export async function unlinkGoogle(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: '로그인이 필요합니다.' });
    }

    const db = getDatabase();
    const oauthRow = db.prepare(`
      SELECT id, provider_user_id FROM user_oauth_accounts
      WHERE user_id = ? AND provider = 'google'
    `).get(req.user.id) as { id: number; provider_user_id: string } | undefined;

    if (!oauthRow) {
      return res.status(404).json({ success: false, error: '연동된 구글 계정이 없습니다.' });
    }

    // Safety check: verify if the user has an email and password to prevent locking out
    const userRow = db.prepare('SELECT email, password_hash FROM users WHERE id = ?').get(req.user.id) as { email: string; password_hash: string } | undefined;
    if (userRow?.email?.endsWith('@oauth.luxuryrental.com')) {
      return res.status(400).json({
        success: false,
        error: '구글 계정으로만 가입된 회원입니다. 계정 연동을 해제하려면 먼저 이메일과 비밀번호를 설정해주세요.'
      });
    }

    // Delete OAuth record
    db.prepare('DELETE FROM user_oauth_accounts WHERE id = ?').run(oauthRow.id);

    return res.json({
      success: true,
      message: '구글 계정 연동이 성공적으로 해제되었습니다.'
    });
  } catch (err) {
    next(err);
  }
}

