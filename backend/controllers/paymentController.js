import Transaction from '../models/Transaction.js';
import User from '../models/User.js';

// Mock payment simulation - simulates processing delay
const simulatePaymentProcessing = async (type, amount) => {
  // Simulate network delay (100-500ms)
  const delay = Math.floor(Math.random() * 400) + 100;
  await new Promise(resolve => setTimeout(resolve, delay));

  // Mock success rate (95% success for testing)
  const success = Math.random() > 0.05;

  return {
    success,
    processingTime: delay,
    mockData: {
      cardLast4: '4242',
      bankName: 'Mock Bank',
      processingTime: delay,
      simulatedDelay: delay,
    },
  };
};

// @desc    Deposit funds (Mock)
// @route   POST /api/payments/deposit
// @access  Private
export const depositFunds = async (req, res) => {
  try {
    const { amount, paymentMethod = 'mock_payment', description = '' } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
      res.status(400);
      throw new Error('Invalid amount. Amount must be greater than 0');
    }

    if (amount > 1000000) {
      res.status(400);
      throw new Error('Deposit amount cannot exceed $1,000,000');
    }

    // Get user's current balance
    const user = await User.findById(req.user._id);
    const balanceBefore = user.walletBalance || 0;

    // Simulate payment processing
    const paymentResult = await simulatePaymentProcessing('deposit', amount);

    if (!paymentResult.success) {
      // Create failed transaction record
      const failedTransaction = await Transaction.create({
        user: req.user._id,
        type: 'deposit',
        amount,
        status: 'failed',
        description: description || 'Deposit funds',
        paymentMethod,
        mockData: paymentResult.mockData,
        balanceBefore,
        balanceAfter: balanceBefore,
      });

      res.status(400);
      throw new Error('Payment processing failed. Please try again.');
    }

    // Update user balance
    const balanceAfter = balanceBefore + amount;
    user.walletBalance = balanceAfter;
    await user.save();

    // Create successful transaction record
    const transaction = await Transaction.create({
      user: req.user._id,
      type: 'deposit',
      amount,
      status: 'completed',
      description: description || 'Deposit funds',
      paymentMethod,
      mockData: paymentResult.mockData,
      balanceBefore,
      balanceAfter,
    });

    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('user', 'name email');

    res.status(201).json({
      message: 'Deposit successful',
      transaction: populatedTransaction,
      newBalance: balanceAfter,
    });
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    throw error;
  }
};

// @desc    Withdraw funds (Mock)
// @route   POST /api/payments/withdraw
// @access  Private
export const withdrawFunds = async (req, res) => {
  try {
    const { amount, paymentMethod = 'mock_bank', description = '' } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
      res.status(400);
      throw new Error('Invalid amount. Amount must be greater than 0');
    }

    // Get user's current balance
    const user = await User.findById(req.user._id);
    const balanceBefore = user.walletBalance || 0;

    // Check sufficient funds
    if (balanceBefore < amount) {
      res.status(400);
      throw new Error(`Insufficient funds. Your balance is $${balanceBefore.toFixed(2)}`);
    }

    // Simulate payment processing
    const paymentResult = await simulatePaymentProcessing('withdraw', amount);

    if (!paymentResult.success) {
      // Create failed transaction record
      const failedTransaction = await Transaction.create({
        user: req.user._id,
        type: 'withdraw',
        amount,
        status: 'failed',
        description: description || 'Withdraw funds',
        paymentMethod,
        mockData: paymentResult.mockData,
        balanceBefore,
        balanceAfter: balanceBefore,
      });

      res.status(400);
      throw new Error('Withdrawal processing failed. Please try again.');
    }

    // Update user balance
    const balanceAfter = balanceBefore - amount;
    user.walletBalance = balanceAfter;
    await user.save();

    // Create successful transaction record
    const transaction = await Transaction.create({
      user: req.user._id,
      type: 'withdraw',
      amount,
      status: 'completed',
      description: description || 'Withdraw funds',
      paymentMethod,
      mockData: paymentResult.mockData,
      balanceBefore,
      balanceAfter,
    });

    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('user', 'name email');

    res.json({
      message: 'Withdrawal successful',
      transaction: populatedTransaction,
      newBalance: balanceAfter,
    });
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    throw error;
  }
};

// @desc    Transfer funds to another user (Mock)
// @route   POST /api/payments/transfer
// @access  Private
export const transferFunds = async (req, res) => {
  try {
    const { amount, receiverId, description = '' } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
      res.status(400);
      throw new Error('Invalid amount. Amount must be greater than 0');
    }

    // Validate receiver
    if (!receiverId) {
      res.status(400);
      throw new Error('Receiver ID is required');
    }

    // Cannot transfer to self
    if (receiverId === req.user._id.toString()) {
      res.status(400);
      throw new Error('Cannot transfer funds to yourself');
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      res.status(404);
      throw new Error('Receiver not found');
    }

    // Get sender's current balance
    const sender = await User.findById(req.user._id);
    const senderBalanceBefore = sender.walletBalance || 0;

    // Check sufficient funds
    if (senderBalanceBefore < amount) {
      res.status(400);
      throw new Error(`Insufficient funds. Your balance is $${senderBalanceBefore.toFixed(2)}`);
    }

    // Simulate payment processing
    const paymentResult = await simulatePaymentProcessing('transfer', amount);

    if (!paymentResult.success) {
      // Create failed transaction record for sender
      const failedTransaction = await Transaction.create({
        user: req.user._id,
        type: 'transfer',
        amount,
        status: 'failed',
        receiver: receiverId,
        description: description || `Transfer to ${receiver.name}`,
        paymentMethod: 'wallet',
        mockData: paymentResult.mockData,
        balanceBefore: senderBalanceBefore,
        balanceAfter: senderBalanceBefore,
      });

      res.status(400);
      throw new Error('Transfer processing failed. Please try again.');
    }

    // Update sender balance
    const senderBalanceAfter = senderBalanceBefore - amount;
    sender.walletBalance = senderBalanceAfter;
    await sender.save();

    // Update receiver balance
    const receiverBalanceBefore = receiver.walletBalance || 0;
    const receiverBalanceAfter = receiverBalanceBefore + amount;
    receiver.walletBalance = receiverBalanceAfter;
    await receiver.save();

    // Create transaction record for sender (outgoing)
    const senderTransaction = await Transaction.create({
      user: req.user._id,
      type: 'transfer',
      amount,
      status: 'completed',
      receiver: receiverId,
      description: description || `Transfer to ${receiver.name}`,
      paymentMethod: 'wallet',
      mockData: paymentResult.mockData,
      balanceBefore: senderBalanceBefore,
      balanceAfter: senderBalanceAfter,
    });

    // Create transaction record for receiver (incoming)
    const receiverTransaction = await Transaction.create({
      user: receiverId,
      type: 'deposit', // Receiver sees it as a deposit
      amount,
      status: 'completed',
      description: description || `Transfer from ${sender.name}`,
      paymentMethod: 'wallet',
      mockData: paymentResult.mockData,
      balanceBefore: receiverBalanceBefore,
      balanceAfter: receiverBalanceAfter,
    });

    const populatedTransaction = await Transaction.findById(senderTransaction._id)
      .populate('user', 'name email')
      .populate('receiver', 'name email');

    res.json({
      message: 'Transfer successful',
      transaction: populatedTransaction,
      newBalance: senderBalanceAfter,
      receiver: {
        name: receiver.name,
        email: receiver.email,
      },
    });
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    throw error;
  }
};

// @desc    Get transaction history
// @route   GET /api/payments/history
// @access  Private
export const getTransactionHistory = async (req, res) => {
  try {
    const { type, status, limit = 50, offset = 0 } = req.query;

    // Build query
    const query = { user: req.user._id };

    if (type && ['deposit', 'withdraw', 'transfer'].includes(type)) {
      query.type = type;
    }

    if (status && ['pending', 'completed', 'failed', 'cancelled'].includes(status)) {
      query.status = status;
    }

    // Get transactions with pagination
    const transactions = await Transaction.find(query)
      .populate('user', 'name email')
      .populate('receiver', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    // Get total count for pagination
    const totalCount = await Transaction.countDocuments(query);

    // Get user's current balance
    const user = await User.findById(req.user._id).select('walletBalance');

    res.json({
      transactions,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: totalCount > parseInt(offset) + parseInt(limit),
      },
      currentBalance: user.walletBalance || 0,
    });
  } catch (error) {
    res.status(500);
    throw error;
  }
};

// @desc    Get wallet balance
// @route   GET /api/payments/balance
// @access  Private
export const getWalletBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('walletBalance');

    // Get transaction statistics
    const stats = await Transaction.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const statsMap = stats.reduce((acc, stat) => {
      acc[stat._id] = {
        total: stat.total,
        count: stat.count,
      };
      return acc;
    }, {});

    res.json({
      balance: user.walletBalance || 0,
      statistics: {
        totalDeposits: statsMap.deposit?.total || 0,
        totalWithdrawals: statsMap.withdraw?.total || 0,
        totalTransfers: statsMap.transfer?.total || 0,
        transactionCount: stats.reduce((acc, s) => acc + s.count, 0),
      },
    });
  } catch (error) {
    res.status(500);
    throw error;
  }
};
