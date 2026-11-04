import { Router } from 'express';
import { productRouter } from './product.routes.js';
import { categoryRouter } from './category.routes.js';
import { searchRouter } from './search.routes.js';
import { sellRouter } from './sell.routes.js';
import { adminRouter } from './admin.routes.js';

export const apiRouter = Router();

apiRouter.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'LuxuryRental API', version: '1.0.0', timestamp: new Date().toISOString() });
});

apiRouter.use('/products', productRouter);
apiRouter.use('/categories', categoryRouter);
apiRouter.use('/search', searchRouter);
apiRouter.use('/sell-requests', sellRouter);
apiRouter.use('/admin', adminRouter);
