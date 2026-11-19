import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const firstErrorMsg = err.errors[0]?.message;
        return res.status(400).json({
          success: false,
          error: firstErrorMsg || '입력하신 정보의 형식이 올바르지 않습니다. 내용을 확인해주세요.',
          details: err.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
        });
      }
      next(err);
    }
  };
}
