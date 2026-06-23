import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Message from '../models/Message.js';
import videoHandler from './videoHandler.js';

// Store online users: Map of userId -> socketId
const onlineUsers = new Map();

const socketHandler = (io) => {
  // Socket.IO authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] User connected: ${socket.user.name} (${socket.userId})`);

    // Add user to online users
    onlineUsers.set(socket.userId, socket.id);

    // Update user online status in database
    User.findByIdAndUpdate(socket.userId, { isOnline: true }).catch((err) => {
      console.error('[Socket.IO] Error updating online status:', err);
    });

    // Broadcast online users list to all connected clients
    io.emit('onlineUsers', Array.from(onlineUsers.keys()));

    // Join user to their personal room for private messaging
    socket.join(socket.userId);

    // Initialize video call handlers
    videoHandler(socket, io, onlineUsers);

    // Handle private message
    socket.on('sendMessage', async (data) => {
      try {
        const { receiverId, content } = data;

        if (!receiverId || !content) {
          socket.emit('messageError', { error: 'Receiver and content are required' });
          return;
        }

        // Create and save message to database
        const message = await Message.create({
          sender: socket.userId,
          receiver: receiverId,
          content: content.trim(),
        });

        const populatedMessage = await Message.findById(message._id)
          .populate('sender', 'name email avatarUrl')
          .populate('receiver', 'name email avatarUrl');

        // Send to receiver if online
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('receiveMessage', populatedMessage);
        }

        // Send confirmation back to sender
        socket.emit('messageSent', populatedMessage);

        console.log(`[Socket.IO] Message sent from ${socket.userId} to ${receiverId}`);
      } catch (error) {
        console.error('[Socket.IO] Error sending message:', error);
        socket.emit('messageError', { error: 'Failed to send message' });
      }
    });

    // Handle typing indicator
    socket.on('typing', (data) => {
      const { receiverId } = data;
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('userTyping', {
          userId: socket.userId,
          userName: socket.user.name,
        });
      }
    });

    // Handle stop typing indicator
    socket.on('stopTyping', (data) => {
      const { receiverId } = data;
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('userStoppedTyping', {
          userId: socket.userId,
        });
      }
    });

    // Handle mark messages as read
    socket.on('markAsRead', async (data) => {
      try {
        const { senderId } = data;

        await Message.updateMany(
          {
            sender: senderId,
            receiver: socket.userId,
            read: false,
          },
          {
            read: true,
          }
        );

        // Notify sender that messages were read
        const senderSocketId = onlineUsers.get(senderId);
        if (senderSocketId) {
          io.to(senderSocketId).emit('messagesRead', {
            readBy: socket.userId,
          });
        }
      } catch (error) {
        console.error('[Socket.IO] Error marking messages as read:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`[Socket.IO] User disconnected: ${socket.user.name} (${socket.userId})`);

      // Remove user from online users
      onlineUsers.delete(socket.userId);

      // Update user online status in database
      User.findByIdAndUpdate(socket.userId, { isOnline: false }).catch((err) => {
        console.error('[Socket.IO] Error updating offline status:', err);
      });

      // Broadcast updated online users list
      io.emit('onlineUsers', Array.from(onlineUsers.keys()));
    });
  });

  console.log('[Socket.IO] Socket handler initialized');
};

export default socketHandler;
