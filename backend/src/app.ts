import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/env.js';
import { apiRouter } from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';

export const app = express();

// Security Middlewares
app.use(helmet());
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

// Body Parsers
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Request logger in dev
if (config.nodeEnv === 'development') {
  app.use((req, _res, next) => {
    console.log(`[HTTP] ${req.method} ${req.url}`);
    next();
  });
}

// Routes
app.use('/api/v1', apiRouter);

// 404 Handler
app.use((_req, res) => {
  res.status(404).json({ success: false, error: '요청한 엔드포인트를 찾을 수 없습니다.' });
});

// Centralized Error Handler
app.use(errorHandler);
