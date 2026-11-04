import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env.js';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error('[ServerError]', err);

  const status = typeof err.status === 'number' ? err.status : 500;
  let message = err.message || '서버 내부 오류가 발생했습니다.';

  // Security hardening: Mask internal SQL/driver details or unhandled exceptions
  if (status >= 500 || /sql|sqlite|syntax error|constraint|foreign_key/i.test(message)) {
    message = config.nodeEnv === 'production'
      ? '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
      : '요청 처리 중 서버 오류가 발생했습니다.';
  }

  res.status(status).json({
    success: false,
    error: message,
    status
  });
}
