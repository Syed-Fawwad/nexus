import express from 'express';
import {
  getCollaborationRequests,
  createCollaborationRequest,
  updateCollaborationRequest,
  deleteCollaborationRequest,
  getCollaborationRequestById,
} from '../controllers/collaborationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get all collaboration requests for current user
router.get('/', getCollaborationRequests);

// Create a collaboration request (investors only)
router.post('/', authorize('investor'), createCollaborationRequest);

// Get specific collaboration request by ID
router.get('/:id', getCollaborationRequestById);

// Update collaboration request status (entrepreneurs only)
router.put('/:id', authorize('entrepreneur'), updateCollaborationRequest);

// Delete collaboration request (investors only)
router.delete('/:id', authorize('investor'), deleteCollaborationRequest);

export default router;
