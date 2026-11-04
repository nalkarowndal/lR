import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env.js';

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  // Allow if development or header matches or local origin
  const apiKey = req.headers['x-admin-key'];
  if (apiKey && apiKey === config.adminApiKey) {
    return next();
  }
  // In dev / demo mode, allow with role header check
  const roleHeader = req.headers['x-user-role'];
  if (roleHeader === 'ADMIN' || config.nodeEnv === 'development') {
    return next();
  }

  return res.status(403).json({
    success: false,
    error: '관리자 권한이 필요합니다.'
  });
}
