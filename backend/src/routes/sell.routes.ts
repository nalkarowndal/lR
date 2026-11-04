import { Router } from 'express';
import { createSellRequest, getSellRequests } from '../controllers/sell.controller.js';
import { validateBody } from '../middlewares/validate.js';
import { CreateSellRequestSchema } from '../schemas/api.schemas.js';
import { authenticate } from '../middlewares/auth.js';

export const sellRouter = Router();

// Populate req.user if session token is provided
sellRouter.use(authenticate);

sellRouter.get('/', getSellRequests);
sellRouter.post('/', validateBody(CreateSellRequestSchema), createSellRequest);
