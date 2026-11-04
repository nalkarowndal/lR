import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import {
  getMyProfile,
  updateMyProfile,
  changeMyPassword,
  getMySettings,
  updateMySettings,
  getMyFavorites,
  addFavorite,
  removeFavorite,
  getMySellRequests,
  uploadMyAvatar,
  deleteMyAvatar
} from '../controllers/user.controller.js';

const router = Router();

// All user routes require authenticated session
router.use(requireAuth);

router.get('/me', getMyProfile);
router.patch('/me', updateMyProfile);
router.patch('/me/password', changeMyPassword);
router.get('/me/settings', getMySettings);
router.patch('/me/settings', updateMySettings);
router.get('/me/favorites', getMyFavorites);
router.post('/me/favorites/:productId', addFavorite);
router.delete('/me/favorites/:productId', removeFavorite);
router.get('/me/sell-requests', getMySellRequests);
router.post('/me/avatar', uploadMyAvatar);
router.delete('/me/avatar', deleteMyAvatar);

export default router;

