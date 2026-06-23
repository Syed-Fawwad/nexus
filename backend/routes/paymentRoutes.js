import express from 'express';
import {
  depositFunds,
  withdrawFunds,
  transferFunds,
  getTransactionHistory,
  getWalletBalance,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validatePayment, validateTransfer } from '../middleware/validationMiddleware.js';
import { paymentLimiter } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Deposit funds
router.post('/deposit', paymentLimiter, validatePayment, depositFunds);

// Withdraw funds
router.post('/withdraw', paymentLimiter, validatePayment, withdrawFunds);

// Transfer funds to another user
router.post('/transfer', paymentLimiter, validateTransfer, transferFunds);

// Get transaction history
router.get('/history', getTransactionHistory);

// Get wallet balance
router.get('/balance', getWalletBalance);

export default router;
