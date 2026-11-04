import { Router } from 'express';
import { createSellRequest, getSellRequests } from '../controllers/sell.controller.js';
import { validateBody } from '../middlewares/validate.js';
import { CreateSellRequestSchema } from '../schemas/api.schemas.js';

export const sellRouter = Router();

sellRouter.get('/', getSellRequests);
sellRouter.post('/', validateBody(CreateSellRequestSchema), createSellRequest);
