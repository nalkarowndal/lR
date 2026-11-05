import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  port: Number(process.env.PORT) || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientOrigins: (process.env.CLIENT_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173')
    .split(',')
    .map(s => s.trim()),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  databasePath: process.env.DATABASE_PATH || path.resolve(process.cwd(), 'data', 'luxuryrental.sqlite'),
  // Dedicated server-to-server admin API key (empty if not configured, preventing default key exploits)
  adminApiKey: process.env.ADMIN_API_KEY || '',
  // Kakao OAuth 2.0 Credentials & Base URLs
  kakaoRestApiKey: process.env.KAKAO_REST_API_KEY || '',
  kakaoClientSecret: process.env.KAKAO_CLIENT_SECRET || '',
  kakaoRedirectUri: process.env.KAKAO_REDIRECT_URI || 'http://localhost:4000/api/v1/auth/kakao/callback',
  kakaoAuthBaseUrl: process.env.KAKAO_AUTH_BASE_URL || 'https://kauth.kakao.com',
  kakaoApiBaseUrl: process.env.KAKAO_API_BASE_URL || 'https://kapi.kakao.com'
};
