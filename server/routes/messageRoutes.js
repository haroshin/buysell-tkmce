import express from 'express';
import {
  sendMessage,
  getConversations,
  getMessages,
  getUnreadCount
} from '../controllers/messageController.js';
import { protect } from '../middleware/auth.js';
import { checkPendingFees } from '../middleware/enforcement.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.post('/send', checkPendingFees, sendMessage);
router.get('/conversations', getConversations);
router.get('/unread-count', getUnreadCount);
router.get('/:userId/:listingId', getMessages);

export default router;
