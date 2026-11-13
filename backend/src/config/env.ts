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
  kakaoApiBaseUrl: process.env.KAKAO_API_BASE_URL || 'https://kapi.kakao.com',
  // Google OAuth 2.0 Credentials & Base URLs
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  googleRedirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:4000/api/v1/auth/google/callback',
  googleAuthBaseUrl: process.env.GOOGLE_AUTH_BASE_URL || 'https://accounts.google.com/o/oauth2/v2/auth',
  googleTokenBaseUrl: process.env.GOOGLE_TOKEN_BASE_URL || 'https://oauth2.googleapis.com/token',
  googleUserInfoUrl: process.env.GOOGLE_USERINFO_URL || 'https://www.googleapis.com/oauth2/v3/userinfo'
};
