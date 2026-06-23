// WebRTC Video Call Handler
// Handles signaling for one-to-one video calls

const activeRooms = new Map(); // roomId -> { caller, callee, callState }
const userCallState = new Map(); // userId -> { roomId, partnerId, isCaller }

/**
 * Initialize video call handlers for a socket instance
 * @param {Socket} socket - The socket instance
 * @param {Server} io - The Socket.IO server instance
 * @param {Map} onlineUsers - Map of online users (userId -> socketId)
 */
const videoHandler = (socket, io, onlineUsers) => {
  const userId = socket.userId;

  console.log(`[VideoCall] Registering video handlers for user ${userId}`);

  // Initiate a video call
  socket.on('video:call-initiate', (data) => {
    try {
      const { calleeId } = data;

      if (!calleeId) {
        socket.emit('video:error', { error: 'Callee ID is required' });
        return;
      }

      // Check if caller is already in a call
      if (userCallState.has(userId)) {
        socket.emit('video:error', { error: 'You are already in a call' });
        return;
      }

      // Check if callee is already in a call
      if (userCallState.has(calleeId)) {
        socket.emit('video:busy', { calleeId });
        return;
      }

      // Check if callee is online
      const calleeSocketId = onlineUsers.get(calleeId);
      if (!calleeSocketId) {
        socket.emit('video:error', { error: 'User is offline' });
        return;
      }

      // Create room ID (combination of caller and callee IDs)
      const roomId = [userId, calleeId].sort().join('-');

      // Store room information
      activeRooms.set(roomId, {
        caller: userId,
        callee: calleeId,
        callState: 'ringing',
        createdAt: Date.now(),
      });

      // Update user call states
      userCallState.set(userId, { roomId, partnerId: calleeId, isCaller: true });
      userCallState.set(calleeId, { roomId, partnerId: userId, isCaller: false });

      // Join both users to the room
      socket.join(roomId);

      // Notify callee about incoming call
      io.to(calleeSocketId).emit('video:incoming-call', {
        callerId: userId,
        callerName: socket.user.name,
        callerAvatar: socket.user.avatarUrl,
        roomId,
      });

      // Confirm to caller that call is ringing
      socket.emit('video:call-ringing', { calleeId, roomId });

      console.log(`[VideoCall] Call initiated: ${userId} -> ${calleeId} (Room: ${roomId})`);
    } catch (error) {
      console.error('[VideoCall] Error initiating call:', error);
      socket.emit('video:error', { error: 'Failed to initiate call' });
    }
  });

  // Accept an incoming call
  socket.on('video:call-accept', (data) => {
    try {
      const { callerId, roomId } = data;

      // Verify call state
      const room = activeRooms.get(roomId);
      if (!room || room.callee !== userId || room.caller !== callerId) {
        socket.emit('video:error', { error: 'Invalid call state' });
        return;
      }

      // Update room state
      room.callState = 'active';
      activeRooms.set(roomId, room);

      // Join callee to room
      socket.join(roomId);

      // Notify caller that call was accepted
      const callerSocketId = onlineUsers.get(callerId);
      if (callerSocketId) {
        io.to(callerSocketId).emit('video:call-accepted', {
          calleeId: userId,
          roomId,
        });
      }

      console.log(`[VideoCall] Call accepted: ${callerId} <-> ${userId} (Room: ${roomId})`);
    } catch (error) {
      console.error('[VideoCall] Error accepting call:', error);
      socket.emit('video:error', { error: 'Failed to accept call' });
    }
  });

  // Reject an incoming call
  socket.on('video:call-reject', (data) => {
    try {
      const { callerId, roomId } = data;

      // Verify call state
      const room = activeRooms.get(roomId);
      if (!room || room.callee !== userId || room.caller !== callerId) {
        socket.emit('video:error', { error: 'Invalid call state' });
        return;
      }

      // Clean up room and user states
      activeRooms.delete(roomId);
      userCallState.delete(userId);
      userCallState.delete(callerId);

      // Notify caller that call was rejected
      const callerSocketId = onlineUsers.get(callerId);
      if (callerSocketId) {
        io.to(callerSocketId).emit('video:call-rejected', {
          calleeId: userId,
        });
      }

      console.log(`[VideoCall] Call rejected: ${callerId} X ${userId}`);
    } catch (error) {
      console.error('[VideoCall] Error rejecting call:', error);
      socket.emit('video:error', { error: 'Failed to reject call' });
    }
  });

  // End an active call
  socket.on('video:call-end', (data) => {
    try {
      const { roomId } = data;

      const room = activeRooms.get(roomId);
      if (!room) {
        return; // Room already ended
      }

      const { caller, callee } = room;

      // Determine partner
      const partnerId = userId === caller ? callee : caller;

      // Clean up room and user states
      activeRooms.delete(roomId);
      userCallState.delete(caller);
      userCallState.delete(callee);

      // Notify partner that call ended
      const partnerSocketId = onlineUsers.get(partnerId);
      if (partnerSocketId) {
        io.to(partnerSocketId).emit('video:call-ended', {
          endedBy: userId,
          roomId,
        });
      }

      console.log(`[VideoCall] Call ended: Room ${roomId} by ${userId}`);
    } catch (error) {
      console.error('[VideoCall] Error ending call:', error);
    }
  });

  // Forward WebRTC offer
  socket.on('video:offer', (data) => {
    try {
      const { roomId, offer } = data;

      const room = activeRooms.get(roomId);
      if (!room) {
        socket.emit('video:error', { error: 'Room not found' });
        return;
      }

      // Determine receiver (the other person in the call)
      const receiverId = userId === room.caller ? room.callee : room.caller;
      const receiverSocketId = onlineUsers.get(receiverId);

      if (receiverSocketId) {
        io.to(receiverSocketId).emit('video:offer', {
          offer,
          senderId: userId,
          roomId,
        });
        console.log(`[VideoCall] Offer forwarded: ${userId} -> ${receiverId}`);
      }
    } catch (error) {
      console.error('[VideoCall] Error forwarding offer:', error);
    }
  });

  // Forward WebRTC answer
  socket.on('video:answer', (data) => {
    try {
      const { roomId, answer } = data;

      const room = activeRooms.get(roomId);
      if (!room) {
        socket.emit('video:error', { error: 'Room not found' });
        return;
      }

      // Determine receiver
      const receiverId = userId === room.caller ? room.callee : room.caller;
      const receiverSocketId = onlineUsers.get(receiverId);

      if (receiverSocketId) {
        io.to(receiverSocketId).emit('video:answer', {
          answer,
          senderId: userId,
          roomId,
        });
        console.log(`[VideoCall] Answer forwarded: ${userId} -> ${receiverId}`);
      }
    } catch (error) {
      console.error('[VideoCall] Error forwarding answer:', error);
    }
  });

  // Forward ICE candidates
  socket.on('video:ice-candidate', (data) => {
    try {
      const { roomId, candidate } = data;

      const room = activeRooms.get(roomId);
      if (!room) {
        return; // Room might have ended
      }

      // Determine receiver
      const receiverId = userId === room.caller ? room.callee : room.caller;
      const receiverSocketId = onlineUsers.get(receiverId);

      if (receiverSocketId) {
        io.to(receiverSocketId).emit('video:ice-candidate', {
          candidate,
          senderId: userId,
          roomId,
        });
      }
    } catch (error) {
      console.error('[VideoCall] Error forwarding ICE candidate:', error);
    }
  });

  // Toggle audio state (inform partner)
  socket.on('video:toggle-audio', (data) => {
    try {
      const { roomId, audioEnabled } = data;

      const room = activeRooms.get(roomId);
      if (!room) return;

      const partnerId = userId === room.caller ? room.callee : room.caller;
      const partnerSocketId = onlineUsers.get(partnerId);

      if (partnerSocketId) {
        io.to(partnerSocketId).emit('video:partner-audio-toggle', {
          partnerId: userId,
          audioEnabled,
        });
      }
    } catch (error) {
      console.error('[VideoCall] Error toggling audio:', error);
    }
  });

  // Toggle video state (inform partner)
  socket.on('video:toggle-video', (data) => {
    try {
      const { roomId, videoEnabled } = data;

      const room = activeRooms.get(roomId);
      if (!room) return;

      const partnerId = userId === room.caller ? room.callee : room.caller;
      const partnerSocketId = onlineUsers.get(partnerId);

      if (partnerSocketId) {
        io.to(partnerSocketId).emit('video:partner-video-toggle', {
          partnerId: userId,
          videoEnabled,
        });
      }
    } catch (error) {
      console.error('[VideoCall] Error toggling video:', error);
    }
  });

  // Clean up on disconnect
  socket.on('disconnect', () => {
    const callState = userCallState.get(userId);
    if (callState) {
      const { roomId, partnerId } = callState;

      // Clean up room
      activeRooms.delete(roomId);
      userCallState.delete(userId);
      userCallState.delete(partnerId);

      // Notify partner
      const partnerSocketId = onlineUsers.get(partnerId);
      if (partnerSocketId) {
        io.to(partnerSocketId).emit('video:call-ended', {
          endedBy: userId,
          roomId,
          reason: 'Partner disconnected',
        });
      }

      console.log(`[VideoCall] User ${userId} disconnected during call, room ${roomId} cleaned up`);
    }
  });
};

export default videoHandler;
