# Chat System Testing Guide

## Overview
This document provides complete testing instructions for the real-time chat system implemented in Nexus.

## Prerequisites
- Server running on http://localhost:5000
- MongoDB connected
- Valid JWT tokens from authentication

---

## API Testing with cURL

### 1. Register Test Users

**Register Alice (Entrepreneur):**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice",
    "email": "alice@test.com",
    "password": "password123",
    "role": "entrepreneur"
  }'
```

**Register Bob (Investor):**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bob",
    "email": "bob@test.com",
    "password": "password123",
    "role": "investor"
  }'
```

**Save the tokens and user IDs from the response for subsequent requests.**

---

### 2. Send Messages

**Alice sends message to Bob:**
```bash
curl -X POST http://localhost:5000/api/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ALICE_TOKEN" \
  -d '{
    "receiverId": "BOB_USER_ID",
    "content": "Hi Bob, interested in discussing investment opportunities?"
  }'
```

**Bob replies to Alice:**
```bash
curl -X POST http://localhost:5000/api/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_BOB_TOKEN" \
  -d '{
    "receiverId": "ALICE_USER_ID",
    "content": "Hi Alice! Yes, I would love to hear about your startup."
  }'
```

**Expected Response:**
```json
{
  "_id": "...",
  "sender": {
    "_id": "...",
    "name": "Alice",
    "email": "alice@test.com",
    "avatarUrl": "..."
  },
  "receiver": {
    "_id": "...",
    "name": "Bob",
    "email": "bob@test.com",
    "avatarUrl": "..."
  },
  "content": "Message content here",
  "read": false,
  "createdAt": "2026-06-19T...",
  "updatedAt": "2026-06-19T..."
}
```

---

### 3. Get Conversation History

**Alice retrieves conversation with Bob:**
```bash
curl -X GET http://localhost:5000/api/messages/BOB_USER_ID \
  -H "Authorization: Bearer YOUR_ALICE_TOKEN"
```

**Expected Response:**
Array of messages sorted by creation time (oldest first).

---

### 4. Check Unread Message Count

**Alice checks unread messages:**
```bash
curl -X GET http://localhost:5000/api/messages/unread/count \
  -H "Authorization: Bearer YOUR_ALICE_TOKEN"
```

**Expected Response:**
```json
{
  "unreadCount": 1
}
```

---

### 5. Mark Messages as Read

**Alice marks messages from Bob as read:**
```bash
curl -X PUT http://localhost:5000/api/messages/read/BOB_USER_ID \
  -H "Authorization: Bearer YOUR_ALICE_TOKEN"
```

**Expected Response:**
```json
{
  "message": "Messages marked as read",
  "modifiedCount": 1
}
```

---

## Socket.IO Real-Time Testing

### Connection

**JavaScript Client Example:**
```javascript
import { io } from 'socket.io-client';

// Connect with authentication
const socket = io('http://localhost:5000', {
  auth: {
    token: 'YOUR_JWT_TOKEN'
  }
});

// Connection events
socket.on('connect', () => {
  console.log('Connected to chat server');
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error.message);
});
```

---

### Send Real-Time Message

```javascript
socket.emit('sendMessage', {
  receiverId: 'RECEIVER_USER_ID',
  content: 'Hello from real-time chat!'
});

// Confirmation
socket.on('messageSent', (message) => {
  console.log('Message sent successfully:', message);
});

// Error handling
socket.on('messageError', (error) => {
  console.error('Error sending message:', error);
});
```

---

### Receive Real-Time Messages

```javascript
socket.on('receiveMessage', (message) => {
  console.log('New message received:', message);
  // Update UI with new message
});
```

---

### Online Users Tracking

```javascript
socket.on('onlineUsers', (userIds) => {
  console.log('Currently online users:', userIds);
  // Update UI to show online status
});
```

---

### Typing Indicators

**Send typing status:**
```javascript
// User started typing
socket.emit('typing', {
  receiverId: 'RECEIVER_USER_ID'
});

// User stopped typing
socket.emit('stopTyping', {
  receiverId: 'RECEIVER_USER_ID'
});
```

**Receive typing status:**
```javascript
socket.on('userTyping', (data) => {
  console.log(`${data.userName} is typing...`);
});

socket.on('userStoppedTyping', (data) => {
  console.log('User stopped typing');
});
```

---

### Mark Messages as Read (Real-Time)

```javascript
socket.emit('markAsRead', {
  senderId: 'SENDER_USER_ID'
});

// Sender receives confirmation
socket.on('messagesRead', (data) => {
  console.log('Messages read by:', data.readBy);
  // Update UI to show read receipts
});
```

---

## Security Features

### Authentication
- All Socket.IO connections require valid JWT token
- Tokens verified using the same JWT_SECRET as REST APIs
- Unauthorized connections are rejected

### Authorization
- Users can only send messages as themselves
- Users can only retrieve their own conversations
- Message ownership validated on both API and Socket.IO

### Input Validation
- Content trimmed to prevent empty messages
- Receiver existence validated
- Users cannot send messages to themselves

---

## MongoDB Verification

**Connect to MongoDB:**
```bash
mongosh "YOUR_MONGODB_CONNECTION_STRING"
```

**Check messages collection:**
```javascript
use nexus
db.messages.find().pretty()
```

**Verify indexes:**
```javascript
db.messages.getIndexes()
```

**Expected indexes:**
- `{ sender: 1, receiver: 1, createdAt: -1 }`
- `{ receiver: 1, read: 1 }`

---

## Error Cases to Test

### 1. Missing Content
```bash
curl -X POST http://localhost:5000/api/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"receiverId": "USER_ID"}'
```
**Expected:** 400 error with message about missing fields

### 2. Invalid Receiver
```bash
curl -X POST http://localhost:5000/api/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"receiverId": "invalid_id", "content": "test"}'
```
**Expected:** 404 error - Receiver not found

### 3. No Authentication
```bash
curl -X GET http://localhost:5000/api/messages/USER_ID
```
**Expected:** 401 error - Not authorized

### 4. Send Message to Self
```bash
curl -X POST http://localhost:5000/api/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"receiverId": "YOUR_OWN_USER_ID", "content": "test"}'
```
**Expected:** 400 error - Cannot send message to yourself

---

## Performance Considerations

- Messages indexed for efficient conversation queries
- Online users stored in memory (Map) for fast lookups
- Socket.IO rooms used for efficient message routing
- Database queries use populate() to minimize round trips

---

## Next Steps

1. **Frontend Integration:**
   - Install socket.io-client in frontend
   - Create chat components
   - Implement real-time message display
   - Add typing indicators UI

2. **Additional Features:**
   - Message attachments (files, images)
   - Group chat functionality
   - Message reactions
   - Push notifications for offline users
   - Message encryption

3. **Production Considerations:**
   - Add rate limiting
   - Implement message pagination
   - Add Redis adapter for Socket.IO clustering
   - Set up monitoring and logging
   - Add message moderation
