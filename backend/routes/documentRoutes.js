import express from 'express';
import {
  uploadDocument,
  getDocuments,
  getDocumentById,
  downloadDocument,
  updateDocument,
  deleteDocument,
  signDocument,
} from '../controllers/documentController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import { uploadLimiter } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

// Upload document (with multer middleware)
router.post('/upload', protect, uploadLimiter, upload.single('file'), uploadDocument);

// Get all documents for logged-in user
router.get('/', protect, getDocuments);

// Get specific document by ID
router.get('/:id', protect, getDocumentById);

// Download document
router.get('/:id/download', protect, downloadDocument);

// Sign document (upload signature image)
router.post('/:id/sign', protect, upload.single('signature'), signDocument);

// Update document
router.put('/:id', protect, updateDocument);

// Delete document
router.delete('/:id', protect, deleteDocument);

export default router;
