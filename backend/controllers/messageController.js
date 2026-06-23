import Message from '../models/Message.js';
import User from '../models/User.js';

// @desc    Get conversation history between logged-in user and target user
// @route   GET /api/messages/:userId
// @access  Private
const getMessages = async (req, res) => {
  const { userId } = req.params;

  // Validate target user exists
  const targetUser = await User.findById(userId);
  if (!targetUser) {
    res.status(404);
    throw new Error('User not found');
  }

  // Find all messages between the two users
  const messages = await Message.find({
    $or: [
      { sender: req.user._id, receiver: userId },
      { sender: userId, receiver: req.user._id },
    ],
  })
    .populate('sender', 'name email avatarUrl')
    .populate('receiver', 'name email avatarUrl')
    .sort({ createdAt: 1 });

  res.json(messages);
};

// @desc    Send a new message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
  const { receiverId, content } = req.body;

  if (!receiverId || !content) {
    res.status(400);
    throw new Error('Please provide receiver and message content');
  }

  // Validate receiver exists
  const receiver = await User.findById(receiverId);
  if (!receiver) {
    res.status(404);
    throw new Error('Receiver not found');
  }

  // Prevent sending messages to self
  if (receiverId === req.user._id.toString()) {
    res.status(400);
    throw new Error('Cannot send message to yourself');
  }

  const message = await Message.create({
    sender: req.user._id,
    receiver: receiverId,
    content: content.trim(),
  });

  const populatedMessage = await Message.findById(message._id)
    .populate('sender', 'name email avatarUrl')
    .populate('receiver', 'name email avatarUrl');

  res.status(201).json(populatedMessage);
};

// @desc    Mark messages as read
// @route   PUT /api/messages/read/:userId
// @access  Private
const markMessagesAsRead = async (req, res) => {
  const { userId } = req.params;

  // Mark all unread messages from userId to the logged-in user as read
  const result = await Message.updateMany(
    {
      sender: userId,
      receiver: req.user._id,
      read: false,
    },
    {
      read: true,
    }
  );

  res.json({
    message: 'Messages marked as read',
    modifiedCount: result.modifiedCount,
  });
};

// @desc    Get unread message count
// @route   GET /api/messages/unread/count
// @access  Private
const getUnreadCount = async (req, res) => {
  const count = await Message.countDocuments({
    receiver: req.user._id,
    read: false,
  });

  res.json({ unreadCount: count });
};

export { getMessages, sendMessage, markMessagesAsRead, getUnreadCount };
