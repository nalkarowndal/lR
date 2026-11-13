import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import { config } from './config/env.js';
import { apiRouter } from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { handleGoogleCallback } from './controllers/google.controller.js';
import { handleKakaoCallback } from './controllers/kakao.controller.js';

export const app = express();

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || config.clientOrigins.includes(origin) || config.nodeEnv === 'development') {
      callback(null, true);
    } else {
      callback(new Error('CORS 정책에 의해 차단되었습니다.'));
    }
  },
  credentials: true
}));

// Body Parsers: Support image upload payloads up to 10MB
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static Assets Serving for product images and uploads
const possibleAssetPaths = [
  path.resolve(process.cwd(), '..', 'frontend', 'public', 'assets'),
  path.resolve(process.cwd(), 'public', 'assets'),
  path.resolve(process.cwd(), 'frontend', 'public', 'assets')
];

for (const p of possibleAssetPaths) {
  if (fs.existsSync(p)) {
    app.use('/assets', express.static(p));
    break;
  }
}

// Request logger in dev
if (config.nodeEnv === 'development') {
  app.use((req, _res, next) => {
    console.log(`[HTTP] ${req.method} ${req.url}`);
    next();
  });
}

// Routes
app.use('/api/v1', apiRouter);

// Top-level OAuth Callback Aliases (for Google & Kakao direct redirect configurations)
app.get(['/auth/google/callback', '/oauth/google/callback', '/api/auth/google/callback'], handleGoogleCallback);
app.get(['/auth/kakao/callback', '/oauth/kakao/callback', '/api/auth/kakao/callback'], handleKakaoCallback);

// 404 Handler
app.use((_req, res) => {
  res.status(404).json({ success: false, error: '요청한 엔드포인트를 찾을 수 없습니다.' });
});

// Centralized Error Handler
app.use(errorHandler);
