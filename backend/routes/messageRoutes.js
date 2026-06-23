import express from 'express';
import {
  getMessages,
  sendMessage,
  markMessagesAsRead,
  getUnreadCount,
} from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateMessage } from '../middleware/validationMiddleware.js';

const router = express.Router();

// Get unread message count
router.get('/unread/count', protect, getUnreadCount);

// Get conversation with specific user
router.get('/:userId', protect, getMessages);

// Send a new message
router.post('/', protect, validateMessage, sendMessage);

// Mark messages as read
router.put('/read/:userId', protect, markMessagesAsRead);

export default router;
