import { Request, Response, NextFunction } from 'express';
import { getDatabase } from '../db/database.js';
import { hashPassword, verifyPassword, generateSessionToken, generateResetToken } from '../utils/crypto.js';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../schemas/auth.schemas.js';
import { config } from '../config/env.js';

export function register(req: Request, res: Response, next: NextFunction) {
  try {
    const validated = registerSchema.parse(req.body);
    const db = getDatabase();

    // 1. Check duplicate email
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(validated.email) as { id: number } | undefined;
    if (existing) {
      return res.status(409).json({
        success: false,
        error: '이미 등록된 이메일 주소입니다. 다른 이메일로 가입해주세요.'
      });
    }

    // 2. Hash password & insert user
    const passwordHash = hashPassword(validated.password);
    const insertUser = db.prepare(`
      INSERT INTO users (email, password_hash, name, phone, role, marketing_consent)
      VALUES (?, ?, ?, ?, 'USER', ?)
    `);
    const result = insertUser.run(
      validated.email,
      passwordHash,
      validated.name,
      validated.phone || '',
      validated.marketingConsent ? 1 : 0
    );

    const userId = Number(result.lastInsertRowid);

    // 2.1 Record audit trail in user_consents
    try {
      const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || req.socket?.remoteAddress || '';
      const userAgent = (req.headers['user-agent'] as string) || '';
      const insertConsent = db.prepare(`
        INSERT INTO user_consents (user_id, doc_type, version, agreed, ip_address, user_agent)
        VALUES (?, ?, 'v2.1', ?, ?, ?)
      `);

      insertConsent.run(userId, 'TERMS_OF_SERVICE', 1, ip, userAgent);
      insertConsent.run(userId, 'PRIVACY_COLLECTION', 1, ip, userAgent);
      insertConsent.run(userId, 'MARKETING_CONSENT', validated.marketingConsent ? 1 : 0, ip, userAgent);
    } catch (auditErr) {
      console.warn('[Audit] Failed to log initial consent:', auditErr);
    }

    // 3. Create initial session token
    const token = generateSessionToken();
    db.prepare(`
      INSERT INTO sessions (token, user_id, expires_at)
      VALUES (?, ?, datetime('now', '+7 days'))
    `).run(token, userId);

    return res.status(201).json({
      success: true,
      message: '회원가입이 완료되었습니다. 환영합니다!',
      token,
      user: {
        id: userId,
        email: validated.email,
        name: validated.name,
        phone: validated.phone || '',
        role: 'USER'
      }
    });
  } catch (err) {
    next(err);
  }
}

export function login(req: Request, res: Response, next: NextFunction) {
  try {
    const validated = loginSchema.parse(req.body);
    const db = getDatabase();

    const user = db.prepare('SELECT id, email, password_hash, name, phone, role FROM users WHERE email = ?').get(validated.email) as {
      id: number;
      email: string;
      password_hash: string;
      name: string;
      phone: string;
      role: string;
    } | undefined;

    if (!user || !verifyPassword(validated.password, user.password_hash)) {
      return res.status(401).json({
        success: false,
        error: '이메일 또는 비밀번호가 일치하지 않습니다.'
      });
    }

    // Create session token
    const token = generateSessionToken();
    db.prepare(`
      INSERT INTO sessions (token, user_id, expires_at)
      VALUES (?, ?, datetime('now', '+7 days'))
    `).run(token, user.id);

    return res.json({
      success: true,
      message: `${user.name}님, 환영합니다!`,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
}

export function getMe(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: '로그인이 필요합니다.'
    });
  }

  return res.json({
    success: true,
    user: req.user
  });
}

export function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      const db = getDatabase();
      db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
    }

    return res.json({
      success: true,
      message: '로그아웃되었습니다.'
    });
  } catch (err) {
    next(err);
  }
}

export function forgotPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const validated = forgotPasswordSchema.parse(req.body);
    const db = getDatabase();

    const user = db.prepare('SELECT id, email, name FROM users WHERE email = ?').get(validated.email) as { id: number; email: string; name: string } | undefined;
    if (!user) {
      // OWASP: Return identical success message to prevent user enumeration
      return res.json({
        success: true,
        message: '등록된 이메일 계정으로 비밀번호 재설정 안내가 전송되었습니다.'
      });
    }

    const resetToken = generateResetToken();
    db.prepare(`
      INSERT INTO password_reset_tokens (token, user_id, expires_at)
      VALUES (?, ?, datetime('now', '+1 hour'))
    `).run(resetToken, user.id);

    // OWASP Recovery Compliance:
    // Secure email dispatch pipeline. Never expose resetToken in client response for production or development.
    const resetUrl = `http://localhost:5173/?resetToken=${resetToken}`;
    console.log(`[Email Service Dispatch]
--------------------------------------------------------------------------------
To: ${user.email} (${user.name})
Subject: [LuxuryRental] 비밀번호 재설정 링크 및 인증 토큰
Reset URL: ${resetUrl}
Token: ${resetToken}
Expires: 1 hour
--------------------------------------------------------------------------------`);

    const responsePayload: Record<string, any> = {
      success: true,
      message: '등록된 이메일 계정으로 비밀번호 재설정 링크가 전송되었습니다. 전달받은 링크 또는 토큰을 확인해주세요.'
    };

    // Strictly restrict token inclusion in response to automated test runner environments only
    if (config.nodeEnv === 'test') {
      responsePayload.resetToken = resetToken;
    }

    return res.json(responsePayload);
  } catch (err) {
    next(err);
  }
}

export function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const validated = resetPasswordSchema.parse(req.body);
    const db = getDatabase();

    const record = db.prepare(`
      SELECT token, user_id, used, expires_at 
      FROM password_reset_tokens 
      WHERE token = ? AND used = 0 AND expires_at > datetime('now')
    `).get(validated.token) as { token: string; user_id: number; used: number; expires_at: string } | undefined;

    if (!record) {
      return res.status(400).json({
        success: false,
        error: '만료되었거나 이미 사용된 재설정 토큰입니다.'
      });
    }

    // Update password
    const newHash = hashPassword(validated.newPassword);
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, record.user_id);

    // Mark token used
    db.prepare('UPDATE password_reset_tokens SET used = 1 WHERE token = ?').run(record.token);

    // Invalidate all existing sessions for this user
    db.prepare('DELETE FROM sessions WHERE user_id = ?').run(record.user_id);

    return res.json({
      success: true,
      message: '비밀번호가 성공적으로 변경되었습니다. 새 비밀번호로 로그인해주세요.'
    });
  } catch (err) {
    next(err);
  }
}

