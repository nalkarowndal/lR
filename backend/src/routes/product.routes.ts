import { Router } from 'express';
import { getProducts, getProductById, getRecommendations } from '../controllers/product.controller.js';
import { getProductImages } from '../controllers/image.controller.js';

export const productRouter = Router();

productRouter.get('/', getProducts);
productRouter.get('/recommendations', getRecommendations);
productRouter.get('/:id', getProductById);
productRouter.get('/:id/images', getProductImages);
