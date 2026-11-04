import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: '입력값 유효성 검증 실패',
          details: err.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
        });
      }
      next(err);
    }
  };
}
