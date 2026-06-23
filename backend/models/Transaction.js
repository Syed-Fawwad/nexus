import mongoose from 'mongoose';

const transactionSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['deposit', 'withdraw', 'transfer'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled'],
      default: 'pending',
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      // Only required for transfers
      required: function() {
        return this.type === 'transfer';
      },
    },
    // Additional transaction metadata
    description: {
      type: String,
      default: '',
    },
    paymentMethod: {
      type: String,
      enum: ['mock_card', 'mock_bank', 'wallet', 'mock_payment'],
      default: 'mock_payment',
    },
    transactionId: {
      type: String,
      unique: true,
      required: true,
    },
    // Mock payment simulation data
    mockData: {
      cardLast4: String,
      bankName: String,
      processingTime: Number, // milliseconds
      simulatedDelay: Number,
    },
    // Balance tracking
    balanceBefore: {
      type: Number,
      default: 0,
    },
    balanceAfter: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Index for faster queries
transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ transactionId: 1 });
transactionSchema.index({ type: 1, status: 1 });

// Generate unique transaction ID
transactionSchema.pre('save', function(next) {
  if (!this.transactionId) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    this.transactionId = `TXN-${timestamp}-${random}`;
  }
  next();
});

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
