import { Router } from 'express';
import { register, login, getMe, logout, forgotPassword, resetPassword } from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/auth.js';

export const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.get('/me', requireAuth, getMe);
authRouter.post('/logout', logout);
authRouter.post('/forgot-password', forgotPassword);
authRouter.post('/reset-password', resetPassword);
