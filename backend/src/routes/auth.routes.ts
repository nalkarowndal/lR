import { Router } from 'express';
import { register, login, getMe, logout, forgotPassword, resetPassword } from '../controllers/auth.controller.js';
import { getKakaoStatus, startKakaoLogin, handleKakaoCallback, unlinkKakao } from '../controllers/kakao.controller.js';
import { getGoogleStatus, startGoogleLogin, handleGoogleCallback, unlinkGoogle } from '../controllers/google.controller.js';
import { requireAuth } from '../middlewares/auth.js';

export const authRouter = Router();

// Standard Auth Endpoints
authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.get('/me', requireAuth, getMe);
authRouter.post('/logout', logout);
authRouter.post('/forgot-password', forgotPassword);
authRouter.post('/reset-password', resetPassword);

// Kakao OAuth 2.0 Endpoints
authRouter.get('/kakao/status', getKakaoStatus);
authRouter.get('/kakao', startKakaoLogin);
authRouter.get('/kakao/callback', handleKakaoCallback);
authRouter.post('/kakao/unlink', requireAuth, unlinkKakao);

// Google OAuth 2.0 Endpoints
authRouter.get('/google/status', getGoogleStatus);
authRouter.get('/google', startGoogleLogin);
authRouter.get('/google/callback', handleGoogleCallback);
authRouter.post('/google/unlink', requireAuth, unlinkGoogle);
