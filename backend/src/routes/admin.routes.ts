import { Router } from 'express';
import { 
  getAdminProducts, createAdminProduct, deleteAdminProduct,
  getRecruitRequests, createRecruitRequest, updateRecruitRequest,
  getWorkers, createWorker,
  getMessages, createMessage,
  getAdminSellRequests, updateAdminSellRequest
} from '../controllers/admin.controller.js';
import { addProductImage, updateProductImage, deleteProductImage } from '../controllers/image.controller.js';
import { validateBody } from '../middlewares/validate.js';
import { requireAdmin } from '../middlewares/auth.js';
import { 
  CreateProductSchema, CreateRecruitRequestSchema, 
  UpdateRecruitStatusSchema, CreateWorkerSchema, CreateMessageSchema 
} from '../schemas/api.schemas.js';

export const adminRouter = Router();

// Apply admin check middleware
adminRouter.use(requireAdmin);

// Products CRUD
adminRouter.get('/products', getAdminProducts);
adminRouter.post('/products', validateBody(CreateProductSchema), createAdminProduct);
adminRouter.delete('/products/:id', deleteAdminProduct);

// Product Images Gallery Management
adminRouter.post('/products/:id/images', addProductImage);
adminRouter.patch('/products/:id/images/:imageId', updateProductImage);
adminRouter.delete('/products/:id/images/:imageId', deleteProductImage);

// Recruit Requests
adminRouter.get('/recruit/requests', getRecruitRequests);
adminRouter.post('/recruit/requests', validateBody(CreateRecruitRequestSchema), createRecruitRequest);
adminRouter.patch('/recruit/requests/:id', validateBody(UpdateRecruitStatusSchema), updateRecruitRequest);

// Workers
adminRouter.get('/workers', getWorkers);
adminRouter.post('/workers', validateBody(CreateWorkerSchema), createWorker);

// Messages
adminRouter.get('/messages', getMessages);
adminRouter.post('/messages', validateBody(CreateMessageSchema), createMessage);

// Sell Requests Management
adminRouter.get('/sell-requests', getAdminSellRequests);
adminRouter.patch('/sell-requests/:id', updateAdminSellRequest);
