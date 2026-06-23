import express from 'express';
import {
  createMeeting,
  getMeetings,
  getMeetingById,
  updateMeeting,
  deleteMeeting,
} from '../controllers/meetingController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateMeeting } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, validateMeeting, createMeeting)
  .get(protect, getMeetings);

router.route('/:id')
  .get(protect, getMeetingById)
  .put(protect, validateMeeting, updateMeeting)
  .delete(protect, deleteMeeting);

export default router;
