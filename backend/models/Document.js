import mongoose from 'mongoose';

const documentSchema = mongoose.Schema(
  {
    uploader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    version: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ['active', 'archived', 'deleted'],
      default: 'active',
    },
    shared: {
      type: Boolean,
      default: false,
    },
    sharedWith: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    // E-signature fields
    signature: {
      signatureImage: {
        type: String, // Path to signature image
      },
      signedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      signedAt: {
        type: Date,
      },
      signatureFilename: {
        type: String,
      },
    },
    requiresSignature: {
      type: Boolean,
      default: false,
    },
    isSigned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Virtual field for uploadDate (using createdAt)
documentSchema.virtual('uploadDate').get(function () {
  return this.createdAt;
});

// Ensure virtuals are included in JSON
documentSchema.set('toJSON', { virtuals: true });
documentSchema.set('toObject', { virtuals: true });

const Document = mongoose.model('Document', documentSchema);

export default Document;
