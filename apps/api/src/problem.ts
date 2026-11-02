import type {Request,Response} from 'express';
export type ProblemCode='VALIDATION_ERROR'|'NOT_FOUND'|'DATABASE_UNAVAILABLE'|'NOT_IMPLEMENTED'|'INVENTORY_CONFLICT'|'SERVER_ERROR'|'UNAUTHENTICATED'|'FORBIDDEN'|'RATE_LIMITED'|'IDEMPOTENCY_KEY_REUSED'|'INVALID_HOLD_REQUEST';
export function problem(req:Request,res:Response,status:number,code:ProblemCode,title:string,detail?:string){
  res.status(status).type('application/problem+json').json({
    type:'about:blank',title,status,detail,instance:req.originalUrl,code,requestId:res.locals.requestId
  });
}
