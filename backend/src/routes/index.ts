import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { authRouter } from './auth.routes.js';
import userRouter from './user.routes.js';
import { productRouter } from './product.routes.js';
import { categoryRouter } from './category.routes.js';
import { searchRouter } from './search.routes.js';
import { sellRouter } from './sell.routes.js';
import { adminRouter } from './admin.routes.js';
import { legalRouter } from './legal.routes.js';

export const apiRouter = Router();

// 1. Session token extraction on all API routes
apiRouter.use(authenticate);

// 2. Health check
apiRouter.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'LuxuryRental API', version: '1.0.0', timestamp: new Date().toISOString() });
});

// 3. Domain routes
apiRouter.use('/auth', authRouter);
apiRouter.use('/users', userRouter);
apiRouter.use('/legal', legalRouter);
apiRouter.use('/products', productRouter);
apiRouter.use('/categories', categoryRouter);
apiRouter.use('/search', searchRouter);
apiRouter.use('/sell-requests', sellRouter);
apiRouter.use('/admin', adminRouter);
