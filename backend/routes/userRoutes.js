import express from 'express';
import { updateUserProfile, getAllUsers, getUserById } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateProfileUpdate } from '../middleware/validationMiddleware.js';

const router = express.Router();

// Get all users (with optional filters)
router.get('/', protect, getAllUsers);

// Update own profile
router.put('/profile', protect, validateProfileUpdate, updateUserProfile);

// Get specific user by ID
router.get('/:id', protect, getUserById);

export default router;
