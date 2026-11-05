import { Request, Response, NextFunction } from 'express';
import { getDatabase } from '../db/database.js';
import { config } from '../config/env.js';

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  phone?: string;
  avatar_url?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function parseCookies(cookieHeader?: string): Record<string, string> {
  if (!cookieHeader) return {};
  const cookies: Record<string, string> = {};
  for (const part of cookieHeader.split(';')) {
    const [key, ...vals] = part.trim().split('=');
    if (key && vals.length > 0) {
      try {
        cookies[key] = decodeURIComponent(vals.join('='));
      } catch {
        cookies[key] = vals.join('=');
      }
    }
  }
  return cookies;
}

/**
 * Parses Bearer token from Authorization header or HttpOnly cookie (lr_session)
 * and attaches req.user if session is valid.
 */
export function authenticate(req: Request, res: Response, next: NextFunction) {
  let token: string | undefined;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (req.headers.cookie) {
    const cookies = parseCookies(req.headers.cookie);
    token = cookies.lr_session || cookies.lr_token;
  }

  if (!token) return next();

  try {
    const db = getDatabase();
    const row = db.prepare(`
      SELECT u.id, u.email, u.name, u.role, u.phone, u.avatar_url 
      FROM sessions s
      JOIN users u ON u.id = s.user_id
      WHERE s.token = ? AND s.expires_at > datetime('now')
    `).get(token) as AuthUser | undefined;

    if (row) {
      req.user = row;
    }
  } catch (err) {
    console.error('[AuthMiddleware] Error resolving session:', err);
  }

  next();
}

/**
 * Requires an authenticated user session.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: '로그인이 필요한 서비스입니다.'
    });
  }
  next();
}

/**
 * Requires verified ADMIN role or valid x-admin-key (if configured).
 * Insecure client header spoofing (x-user-role) has been completely removed.
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  // 1. Exact API Key match for server/cron automation (disabled if adminApiKey is empty)
  const apiKey = req.headers['x-admin-key'];
  if (apiKey && config.adminApiKey && apiKey === config.adminApiKey) {
    return next();
  }

  // 2. Strict Session Role Check (must have active session with role === 'ADMIN')
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      error: '관리자 권한이 필요합니다.'
    });
  }

  return next();
}
