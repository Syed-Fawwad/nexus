import Document from '../models/Document.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Upload a document
// @route   POST /api/documents/upload
// @access  Private
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('No file uploaded');
    }

    const document = await Document.create({
      uploader: req.user._id,
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      version: 1,
      status: 'active',
    });

    const populatedDocument = await Document.findById(document._id).populate(
      'uploader',
      'name email'
    );

    res.status(201).json(populatedDocument);
  } catch (error) {
    // If error occurs, delete the uploaded file
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    throw error;
  }
};

// @desc    Get all documents for the logged-in user
// @route   GET /api/documents
// @access  Private
const getDocuments = async (req, res) => {
  const { status, search } = req.query;

  // Build query
  const query = {
    uploader: req.user._id,
  };

  // Filter by status if provided
  if (status && status !== 'all') {
    query.status = status;
  } else {
    // Default: only show active documents
    query.status = 'active';
  }

  // Search by filename with sanitization to prevent ReDoS attacks
  if (search) {
    // Escape regex special characters and limit length
    const sanitizedSearch = search
      .substring(0, 100) // Limit search string length
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape special characters
    query.originalName = { $regex: sanitizedSearch, $options: 'i' };
  }

  const documents = await Document.find(query)
    .populate('uploader', 'name email')
    .sort({ createdAt: -1 });

  res.json(documents);
};

// @desc    Get a single document by ID
// @route   GET /api/documents/:id
// @access  Private
const getDocumentById = async (req, res) => {
  const document = await Document.findById(req.params.id).populate(
    'uploader',
    'name email avatarUrl'
  );

  if (!document) {
    res.status(404);
    throw new Error('Document not found');
  }

  // Check authorization (owner or shared with)
  if (
    document.uploader._id.toString() !== req.user._id.toString() &&
    !document.sharedWith.includes(req.user._id)
  ) {
    res.status(401);
    throw new Error('Not authorized to view this document');
  }

  res.json(document);
};

// @desc    Download a document
// @route   GET /api/documents/:id/download
// @access  Private
const downloadDocument = async (req, res) => {
  const document = await Document.findById(req.params.id);

  if (!document) {
    res.status(404);
    throw new Error('Document not found');
  }

  // Check authorization
  if (
    document.uploader.toString() !== req.user._id.toString() &&
    !document.sharedWith.includes(req.user._id)
  ) {
    res.status(401);
    throw new Error('Not authorized to download this document');
  }

  // Check if file exists
  if (!fs.existsSync(document.path)) {
    res.status(404);
    throw new Error('File not found on server');
  }

  // Set headers for download
  res.setHeader('Content-Type', document.fileType);
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${document.originalName}"`
  );

  // Stream the file
  const fileStream = fs.createReadStream(document.path);
  fileStream.pipe(res);
};

// @desc    Update document (share status, version)
// @route   PUT /api/documents/:id
// @access  Private
const updateDocument = async (req, res) => {
  const document = await Document.findById(req.params.id);

  if (!document) {
    res.status(404);
    throw new Error('Document not found');
  }

  // Check authorization
  if (document.uploader.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to update this document');
  }

  // Update fields
  if (req.body.shared !== undefined) {
    document.shared = req.body.shared;
  }

  if (req.body.status) {
    document.status = req.body.status;
  }

  if (req.body.version) {
    document.version = req.body.version;
  }

  if (req.body.sharedWith) {
    document.sharedWith = req.body.sharedWith;
  }

  const updatedDocument = await document.save();
  const populatedDocument = await Document.findById(updatedDocument._id).populate(
    'uploader',
    'name email'
  );

  res.json(populatedDocument);
};

// @desc    Delete a document
// @route   DELETE /api/documents/:id
// @access  Private
const deleteDocument = async (req, res) => {
  const document = await Document.findById(req.params.id);

  if (!document) {
    res.status(404);
    throw new Error('Document not found');
  }

  // Check authorization
  if (document.uploader.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to delete this document');
  }

  // Delete file from filesystem
  if (fs.existsSync(document.path)) {
    fs.unlink(document.path, (err) => {
      if (err) {
        console.error('Error deleting file from filesystem:', err);
      }
    });
  }

  // Delete document record from database
  await document.deleteOne();

  res.json({ message: 'Document removed successfully' });
};

// @desc    Sign a document (upload signature image)
// @route   POST /api/documents/:id/sign
// @access  Private
const signDocument = async (req, res) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('No signature image uploaded');
    }

    const document = await Document.findById(req.params.id);

    if (!document) {
      // Delete uploaded file if document not found
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(404);
      throw new Error('Document not found');
    }

    // Check authorization (only uploader or shared users can sign)
    if (
      document.uploader.toString() !== req.user._id.toString() &&
      !document.sharedWith.includes(req.user._id)
    ) {
      // Delete uploaded file if not authorized
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(401);
      throw new Error('Not authorized to sign this document');
    }

    // If document already has a signature, delete the old signature file
    if (document.signature && document.signature.signatureImage) {
      const oldSignaturePath = document.signature.signatureImage;
      if (fs.existsSync(oldSignaturePath)) {
        fs.unlinkSync(oldSignaturePath);
      }
    }

    // Update document with signature
    document.signature = {
      signatureImage: req.file.path,
      signedBy: req.user._id,
      signedAt: new Date(),
      signatureFilename: req.file.filename,
    };
    document.isSigned = true;

    await document.save();

    const populatedDocument = await Document.findById(document._id)
      .populate('uploader', 'name email')
      .populate('signature.signedBy', 'name email');

    res.json(populatedDocument);
  } catch (error) {
    // If error occurs, delete the uploaded signature file
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting signature file:', err);
      });
    }
    throw error;
  }
};

export {
  uploadDocument,
  getDocuments,
  getDocumentById,
  downloadDocument,
  updateDocument,
  deleteDocument,
  signDocument,
};
