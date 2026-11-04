import { Router } from 'express';
import { getCategories, getBrands } from '../controllers/category.controller.js';

export const categoryRouter = Router();

categoryRouter.get('/', getCategories);
categoryRouter.get('/brands', getBrands);
