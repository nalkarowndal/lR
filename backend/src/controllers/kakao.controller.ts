import { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';
import { getDatabase } from '../db/database.js';
import { config } from '../config/env.js';
import { generateSessionToken, hashPassword } from '../utils/crypto.js';
import { parseCookies } from '../middlewares/auth.js';

/**
 * GET /api/v1/auth/kakao/status
 * Check whether Kakao OAuth 2.0 is configured on the server.
 */
export function getKakaoStatus(_req: Request, res: Response) {
  const isConfigured = Boolean(config.kakaoRestApiKey && config.kakaoRestApiKey.trim() !== '');
  return res.json({
    success: true,
    configured: isConfigured,
    redirectUri: config.kakaoRedirectUri,
    hasClientSecret: Boolean(config.kakaoClientSecret && config.kakaoClientSecret.trim() !== ''),
    authBaseUrl: config.kakaoAuthBaseUrl
  });
}

/**
 * GET /api/v1/auth/kakao
 * Initiates the Kakao OAuth 2.0 authorization request.
 * Generates single-use CSRF state, stores in SQLite + HttpOnly cookie, and redirects to Kakao.
 */
export function startKakaoLogin(req: Request, res: Response) {
  try {
    // 1. Verify that Kakao REST API Key is configured
    if (!config.kakaoRestApiKey || config.kakaoRestApiKey.trim() === '') {
      const acceptsJson = req.xhr || req.headers.accept?.includes('application/json');
      if (acceptsJson) {
        return res.status(400).json({
          success: false,
          error: 'KAKAO_NOT_CONFIGURED',
          message: '카카오 REST API 키가 서버 환경변수(KAKAO_REST_API_KEY)에 설정되어 있지 않습니다.'
        });
      }
      return res.redirect(`${config.frontendUrl}/?oauth=config_required&provider=kakao`);
    }

    // 2. Generate cryptographically strong random state (32 bytes = 64 hex chars)
    const state = crypto.randomBytes(32).toString('hex');

    // 3. Optional return_to query parameter with strict whitelist validation
    let returnTo = '/';
    if (typeof req.query.return_to === 'string' && req.query.return_to.startsWith('/')) {
      // Prevent open redirect: only allow relative paths
      returnTo = req.query.return_to;
    }

    // 4. Save state into SQLite oauth_states table with 10-minute expiry
    const db = getDatabase();
    // Clean up expired states first
    try {
      db.prepare(`DELETE FROM oauth_states WHERE expires_at <= datetime('now')`).run();
    } catch {}

    db.prepare(`
      INSERT INTO oauth_states (state, provider, redirect_uri, return_to, expires_at)
      VALUES (?, 'kakao', ?, ?, datetime('now', '+10 minutes'))
    `).run(state, config.kakaoRedirectUri, returnTo);

    // 5. Store state in HttpOnly Cookie for double-submit / CSRF defense
    res.cookie('kakao_oauth_state', state, {
      httpOnly: true,
      sameSite: 'lax',
      secure: config.nodeEnv === 'production',
      maxAge: 10 * 60 * 1000,
      path: '/'
    });

    // 6. Build Kakao Authorization URL
    const params = new URLSearchParams({
      client_id: config.kakaoRestApiKey,
      redirect_uri: config.kakaoRedirectUri,
      response_type: 'code',
      state: state
    });

    const authorizeUrl = `${config.kakaoAuthBaseUrl}/oauth/authorize?${params.toString()}`;

    // If client requested JSON (e.g. AJAX pre-check)
    if (req.xhr || (req.query.format === 'json')) {
      return res.json({
        success: true,
        redirectUrl: authorizeUrl,
        state
      });
    }

    // Direct browser redirect
    return res.redirect(authorizeUrl);
  } catch (err) {
    console.error('[KakaoOAuth] Failed to initiate login:', err);
    return res.redirect(`${config.frontendUrl}/?oauth=error&provider=kakao&reason=initiation_failed`);
  }
}

/**
 * GET /api/v1/auth/kakao/callback
 * Handles the authorization code response from Kakao.
 */
export async function handleKakaoCallback(req: Request, res: Response) {
  try {
    const db = getDatabase();

    // 1. Check for error response from Kakao (e.g., user clicked cancel / access_denied)
    if (req.query.error) {
      const errCode = String(req.query.error);
      const errDesc = String(req.query.error_description || '');
      console.warn(`[KakaoOAuth] Authorization error returned: ${errCode} (${errDesc})`);

      if (errCode === 'access_denied') {
        return res.redirect(`${config.frontendUrl}/?oauth=cancelled&provider=kakao`);
      }
      return res.redirect(
        `${config.frontendUrl}/?oauth=error&provider=kakao&reason=${encodeURIComponent(errDesc || errCode)}`
      );
    }

    // 2. Validate state parameter
    const queryState = typeof req.query.state === 'string' ? req.query.state : '';
    if (!queryState) {
      console.warn('[KakaoOAuth] Callback missing state parameter');
      return res.redirect(`${config.frontendUrl}/?oauth=invalid_state&provider=kakao`);
    }

    // Atomic lookup & consume (delete) from SQLite to prevent state replay attacks
    const stateRecord = db.prepare(`
      SELECT state, return_to, redirect_uri 
      FROM oauth_states 
      WHERE state = ? AND provider = 'kakao' AND expires_at > datetime('now')
    `).get(queryState) as { state: string; return_to: string; redirect_uri: string } | undefined;

    // Immediately consume and invalidate the state
    db.prepare('DELETE FROM oauth_states WHERE state = ?').run(queryState);

    if (!stateRecord) {
      console.warn('[KakaoOAuth] State invalid, expired, or already consumed:', queryState);
      return res.redirect(`${config.frontendUrl}/?oauth=invalid_state&provider=kakao`);
    }

    // Also check double-submit cookie if present
    const cookieState = req.headers.cookie ? parseCookies(req.headers.cookie).kakao_oauth_state : undefined;
    if (cookieState && cookieState !== queryState) {
      console.warn('[KakaoOAuth] CSRF Cookie mismatch with query state');
      return res.redirect(`${config.frontendUrl}/?oauth=csrf_mismatch&provider=kakao`);
    }

    // Clear state cookie
    res.clearCookie('kakao_oauth_state', { path: '/' });

    // 3. Validate authorization code
    const code = typeof req.query.code === 'string' ? req.query.code : '';
    if (!code) {
      console.warn('[KakaoOAuth] Missing authorization code');
      return res.redirect(`${config.frontendUrl}/?oauth=missing_code&provider=kakao`);
    }

    // 4. Exchange authorization code for tokens with Kakao
    const tokenRequestBody = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: config.kakaoRestApiKey,
      redirect_uri: config.kakaoRedirectUri,
      code: code
    });

    if (config.kakaoClientSecret && config.kakaoClientSecret.trim() !== '') {
      tokenRequestBody.append('client_secret', config.kakaoClientSecret);
    }

    const tokenRes = await fetch(`${config.kakaoAuthBaseUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
      },
      body: tokenRequestBody.toString()
    });

    if (!tokenRes.ok) {
      const errorBody = await tokenRes.text().catch(() => '');
      console.error('[KakaoOAuth] Token exchange failed with status', tokenRes.status, errorBody);
      return res.redirect(`${config.frontendUrl}/?oauth=token_exchange_failed&provider=kakao`);
    }

    const tokenData = await tokenRes.json() as { access_token?: string; token_type?: string };
    const accessToken = tokenData.access_token;
    if (!accessToken) {
      console.error('[KakaoOAuth] No access_token found in token response');
      return res.redirect(`${config.frontendUrl}/?oauth=token_exchange_failed&provider=kakao`);
    }

    // 5. Fetch user profile from Kakao
    const userRes = await fetch(`${config.kakaoApiBaseUrl}/v2/user/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
      }
    });

    if (!userRes.ok) {
      const errorBody = await userRes.text().catch(() => '');
      console.error('[KakaoOAuth] User info fetch failed with status', userRes.status, errorBody);
      return res.redirect(`${config.frontendUrl}/?oauth=profile_fetch_failed&provider=kakao`);
    }

    const kakaoProfile = await userRes.json() as {
      id: number | string;
      connected_at?: string;
      properties?: { nickname?: string; profile_image?: string; thumbnail_image?: string };
      kakao_account?: {
        profile?: { nickname?: string; profile_image_url?: string; thumbnail_image_url?: string };
        email?: string;
        is_email_valid?: boolean;
        is_email_verified?: boolean;
      };
    };

    const kakaoUserId = String(kakaoProfile.id);
    if (!kakaoUserId || kakaoUserId === 'undefined') {
      console.error('[KakaoOAuth] Invalid Kakao user ID received');
      return res.redirect(`${config.frontendUrl}/?oauth=invalid_user_id&provider=kakao`);
    }

    // Extract profile fields
    const nickname =
      kakaoProfile.kakao_account?.profile?.nickname ||
      kakaoProfile.properties?.nickname ||
      '카카오 회원';
    const avatarUrl =
      kakaoProfile.kakao_account?.profile?.profile_image_url ||
      kakaoProfile.properties?.profile_image ||
      '';
    const rawEmail = kakaoProfile.kakao_account?.email?.trim();

    // 6. User Mapping & Persistence
    // Check if user is already linked with this kakaoUserId
    const existingOAuth = db.prepare(`
      SELECT oa.user_id, u.id, u.email, u.name, u.role
      FROM user_oauth_accounts oa
      JOIN users u ON u.id = oa.user_id
      WHERE oa.provider = 'kakao' AND oa.provider_user_id = ?
    `).get(kakaoUserId) as { user_id: number; id: number; email: string; name: string; role: string } | undefined;

    let targetUserId: number;

    if (existingOAuth) {
      // Existing Kakao user login
      targetUserId = existingOAuth.id;

      // Update OAuth record timestamp
      db.prepare(`
        UPDATE user_oauth_accounts
        SET updated_at = datetime('now'), profile_data = ?
        WHERE provider = 'kakao' AND provider_user_id = ?
      `).run(JSON.stringify({ nickname, avatarUrl, kakao_id: kakaoUserId }), kakaoUserId);

      // If user had no avatar, update with Kakao profile image
      if (avatarUrl) {
        db.prepare(`
          UPDATE users 
          SET avatar_url = ? 
          WHERE id = ? AND (avatar_url IS NULL OR avatar_url = '')
        `).run(avatarUrl, targetUserId);
      }
    } else {
      // New Kakao user registration
      // If user provided email, check if an existing luxuryRental email user already exists
      if (rawEmail) {
        const existingEmailUser = db.prepare('SELECT id, email FROM users WHERE email = ?').get(rawEmail) as { id: number; email: string } | undefined;
        if (existingEmailUser) {
          // Prevent automatic silent linking without explicit verification
          console.warn(`[KakaoOAuth] Account conflict: Email ${rawEmail} already exists in DB.`);
          return res.redirect(`${config.frontendUrl}/?oauth=email_conflict&email=${encodeURIComponent(rawEmail)}`);
        }
      }

      // Safe fallback email if user didn't consent to email or email not provided
      const accountEmail = rawEmail || `kakao_${kakaoUserId}@oauth.luxuryrental.com`;
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
        VALUES (?, 'kakao', ?, ?)
      `).run(targetUserId, kakaoUserId, JSON.stringify({ nickname, avatarUrl, kakao_id: kakaoUserId }));

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

    // 9. Redirect to frontend with success indicator (NO TOKEN, CODE, OR SECRET IN URL)
    return res.redirect(`${config.frontendUrl}/?oauth=success&provider=kakao`);
  } catch (err) {
    console.error('[KakaoOAuth] Callback processing error:', err);
    return res.redirect(`${config.frontendUrl}/?oauth=error&provider=kakao&reason=internal_server_error`);
  }
}

/**
 * POST /api/v1/auth/kakao/unlink
 * Unlinks the user's Kakao account. Requires authenticated user.
 */
export async function unlinkKakao(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: '로그인이 필요합니다.' });
    }

    const db = getDatabase();
    const oauthRow = db.prepare(`
      SELECT id, provider_user_id FROM user_oauth_accounts
      WHERE user_id = ? AND provider = 'kakao'
    `).get(req.user.id) as { id: number; provider_user_id: string } | undefined;

    if (!oauthRow) {
      return res.status(404).json({ success: false, error: '연동된 카카오 계정이 없습니다.' });
    }

    // Safety check: verify if the user has an email and password to prevent locking out
    const userRow = db.prepare('SELECT email, password_hash FROM users WHERE id = ?').get(req.user.id) as { email: string; password_hash: string } | undefined;
    if (userRow?.email?.endsWith('@oauth.luxuryrental.com')) {
      return res.status(400).json({
        success: false,
        error: '카카오 계정으로만 가입된 회원입니다. 계정 연동을 해제하려면 먼저 이메일과 비밀번호를 설정해주세요.'
      });
    }

    // Delete OAuth record
    db.prepare('DELETE FROM user_oauth_accounts WHERE id = ?').run(oauthRow.id);

    return res.json({
      success: true,
      message: '카카오 계정 연동이 성공적으로 해제되었습니다.'
    });
  } catch (err) {
    next(err);
  }
}
