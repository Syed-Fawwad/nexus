import express from 'express';
import {
  loginUser,
  registerUser,
  getUserProfile,
} from '../controllers/authController.js';
import { sendOTP, verifyOTPCode, disable2FA, get2FAStatus } from '../controllers/otpController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateLogin, validateRegister, validateOTP } from '../middleware/validationMiddleware.js';
import { authLimiter } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

// Authentication routes
router.post('/login', authLimiter, validateLogin, loginUser);
router.post('/register', authLimiter, validateRegister, registerUser);
router.get('/me', protect, getUserProfile);

// 2FA/OTP routes (all require authentication)
router.post('/send-otp', protect, authLimiter, sendOTP);
router.post('/verify-otp', protect, authLimiter, validateOTP, verifyOTPCode);
router.post('/disable-2fa', protect, disable2FA);
router.get('/2fa-status', protect, get2FAStatus);

export default router;
