import mongoose from 'mongoose';

const collaborationRequestSchema = mongoose.Schema(
  {
    investor: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    entrepreneur: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    message: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
collaborationRequestSchema.index({ entrepreneur: 1, status: 1 });
collaborationRequestSchema.index({ investor: 1, status: 1 });

const CollaborationRequest = mongoose.model('CollaborationRequest', collaborationRequestSchema);

export default CollaborationRequest;
