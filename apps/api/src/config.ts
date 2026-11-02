import {z} from 'zod';
const envSchema=z.object({
  NODE_ENV:z.enum(['development','test','production']).default('development'),
  APP_MODE:z.enum(['demo','disabled']).default('demo'),
  API_HOST:z.string().default('127.0.0.1'),
  API_PORT:z.coerce.number().int().min(1).max(65535).default(4000),
  API_CORS_ORIGINS:z.string().default(''),
  DB_HOST:z.string().min(1),
  DB_PORT:z.coerce.number().int().min(1).max(65535).default(3306),
  DB_USER:z.string().min(1),
  DB_PASSWORD:z.string(),
  DB_NAME:z.string().regex(/^[a-zA-Z][a-zA-Z0-9_]*$/)
});
export function readConfig(env:NodeJS.ProcessEnv=process.env){
  const p=envSchema.safeParse(env);
  if(!p.success)throw new Error('API configuration invalid: '+p.error.issues.map(x=>x.path.join('.')).join(', '));
  if(p.data.NODE_ENV==='production'&&p.data.APP_MODE==='demo')throw new Error('demo mode cannot be used in production');
  return p.data;
}
