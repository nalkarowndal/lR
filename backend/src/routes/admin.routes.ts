import { Router } from 'express';
import { 
  getAdminProducts, createAdminProduct, deleteAdminProduct,
  getRecruitRequests, createRecruitRequest, updateRecruitRequest,
  getWorkers, createWorker,
  getMessages, createMessage
} from '../controllers/admin.controller.js';
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
