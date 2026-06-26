import express from 'express';
import { getEntrepreneurStats, getInvestorStats } from '../controllers/dashboardController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All dashboard routes require authentication
router.use(protect);

// Entrepreneur dashboard statistics
router.get('/entrepreneur', authorize('entrepreneur'), getEntrepreneurStats);

// Investor dashboard statistics
router.get('/investor', authorize('investor'), getInvestorStats);

export default router;
