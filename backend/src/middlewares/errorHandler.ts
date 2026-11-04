import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error('[ServerError]', err);

  const status = err.status || 500;
  const message = err.message || '서버 내부 오류가 발생했습니다.';

  res.status(status).json({
    success: false,
    error: message,
    status
  });
}
