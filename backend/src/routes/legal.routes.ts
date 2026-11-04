import { Router } from 'express';
import { 
  getLegalDocuments, 
  getLegalDocumentByType, 
  getUserConsents, 
  updateUserConsent 
} from '../controllers/legal.controller.js';
import { requireAuth } from '../middlewares/auth.js';

export const legalRouter = Router();

// Public legal documents
legalRouter.get('/', getLegalDocuments);
legalRouter.get('/:docType', getLegalDocumentByType);

// Authenticated user consent audit history & management
legalRouter.get('/user/consents', requireAuth, getUserConsents);
legalRouter.put('/user/consents', requireAuth, updateUserConsent);

