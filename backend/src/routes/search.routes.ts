import { Router } from 'express';
import { search, getTrendingKeywords } from '../controllers/search.controller.js';

export const searchRouter = Router();

searchRouter.get('/', search);
searchRouter.get('/trending', getTrendingKeywords);
