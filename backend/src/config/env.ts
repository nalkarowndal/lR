import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  port: Number(process.env.PORT) || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientOrigins: (process.env.CLIENT_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173')
    .split(',')
    .map(s => s.trim()),
  databasePath: process.env.DATABASE_PATH || path.resolve(process.cwd(), 'data', 'luxuryrental.sqlite'),
  // Dedicated server-to-server admin API key (empty if not configured, preventing default key exploits)
  adminApiKey: process.env.ADMIN_API_KEY || ''
};
