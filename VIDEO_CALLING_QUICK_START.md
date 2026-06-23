# WebRTC Video Calling - Quick Start Guide

## 🚀 Start the Application

### 1. Start Backend
```bash
cd backend
npm install  # If first time
npm run dev
```

**Expected Output:**
```
Server running in development mode on port 5000
[MongoDB] Connected successfully
[Socket.IO] Socket handler initialized
[Socket.IO] Real-time chat server ready
```

### 2. Start Frontend
```bash
cd Nexus
npm install  # If first time
npm run dev
```

**Expected Output:**
```
VITE v5.4.8  ready in 500 ms
➜  Local:   http://localhost:3000/
```

---

## 🎥 Test Video Calling in 5 Minutes

### Quick Test (2 Users, 1 Computer)

**Step 1: Create Two Users**
1. Open `http://localhost:3000` in Chrome
2. Register as:
   - Name: Alice
   - Email: alice@test.com
   - Password: password123
   - Role: Entrepreneur

3. Logout, then register as:
   - Name: Bob
   - Email: bob@test.com
   - Password: password123
   - Role: Investor

**Step 2: Open Two Browser Sessions**
1. **Chrome Normal:** Login as Alice
2. **Chrome Incognito (Ctrl+Shift+N):** Login as Bob

**Step 3: Start Chatting**
1. **Alice's browser:** Click "Browse Investors" → Click Bob's profile → Click "Send Message"
2. **Bob's browser:** Click "Messages" → Click Alice's conversation

**Step 4: Start Video Call**
1. **Alice's browser:** 
   - Click the video camera icon (top right of chat)
   - Allow camera/microphone when prompted
   - See "Calling Bob..." indicator

2. **Bob's browser:**
   - Incoming call modal appears automatically
   - Shows Alice's name and avatar
   - Click "Accept" button
   - Allow camera/microphone when prompted

**Step 5: Test Features**

✅ **Verify Video:**
- Alice sees Bob's video (fullscreen)
- Bob sees Alice's video (fullscreen)
- Both see their own video in small corner (PIP)

✅ **Test Audio Toggle:**
- Click microphone button (turns red when muted)
- Partner sees "mic off" indicator
- Click again to unmute

✅ **Test Video Toggle:**
- Click camera button (turns red when off)
- Partner sees your avatar instead of video
- Partner sees "camera off" indicator
- Click again to turn camera back on

✅ **End Call:**
- Click red phone button
- Both return to chat
- Chat still works normally

---

## 🐛 Troubleshooting

### Issue: "Failed to access camera/microphone"
**Solution:** 
- Click padlock icon in browser address bar
- Allow camera and microphone permissions
- Refresh page and try again

### Issue: "User is offline" when trying to call
**Solution:**
- Verify both users are logged in
- Check if partner shows green "Online" indicator
- Wait 5 seconds for online status to update

### Issue: Video freezes or no connection
**Solution:**
- Check your firewall settings
- Ensure WebRTC is enabled in browser
- Try a different browser (Chrome recommended)
- Check console for errors (F12)

### Issue: Can't hear audio
**Solution:**
- Check computer volume
- Verify microphone not muted in OS
- Check browser didn't block audio
- Look for muted indicator in call

### Issue: "Call was declined" when both want to connect
**Solution:**
- Ensure you clicked "Accept" not "Decline"
- Try calling again
- Check browser console for errors

---

## 📋 Feature Checklist

Use this checklist to verify all features work:

### Pre-Call:
- [ ] Video call button appears in chat header
- [ ] Button disabled when user offline
- [ ] Button enabled when user online
- [ ] Green online status indicator visible

### Initiating Call:
- [ ] Click video call button starts call
- [ ] "Calling..." indicator appears
- [ ] Camera permission prompt appears
- [ ] Can cancel call before acceptance

### Receiving Call:
- [ ] Incoming call modal appears automatically
- [ ] Shows caller's name and avatar
- [ ] Animated ringing effect visible
- [ ] Can accept or decline
- [ ] Modal closes after decision

### During Call:
- [ ] Remote video displays fullscreen
- [ ] Local video displays in corner (PIP)
- [ ] Control buttons clearly visible
- [ ] Audio toggle works (mute/unmute)
- [ ] Video toggle works (camera on/off)
- [ ] Partner's audio state visible
- [ ] Partner's video state visible
- [ ] Can end call anytime

### After Call:
- [ ] Video modal closes properly
- [ ] Returns to chat screen
- [ ] Chat functionality still works
- [ ] Can send messages immediately
- [ ] Can call again if needed

### Edge Cases:
- [ ] Call rejected shows error message
- [ ] User offline shows error
- [ ] User busy shows error
- [ ] Disconnect during call handled gracefully
- [ ] Multiple call attempts handled
- [ ] Network issues handled

---

## 🎯 Success Criteria

Your implementation is working correctly if:

1. ✅ Two users can see each other on video call
2. ✅ Audio can be toggled (muted/unmuted)
3. ✅ Video can be toggled (camera on/off)
4. ✅ Either party can end the call
5. ✅ Incoming calls show notification
6. ✅ Calls can be accepted or rejected
7. ✅ Chat functionality still works after call
8. ✅ No errors in browser console
9. ✅ No errors in backend logs
10. ✅ Clean UI with proper indicators

---

## 🔍 Debug Commands

### Check Backend Logs:
```bash
# In backend directory
npm run dev

# Look for:
[VideoCall] Call initiated: <userId> -> <userId> (Room: <roomId>)
[VideoCall] Call accepted: <userId> <-> <userId> (Room: <roomId>)
[WebRTC] Offer forwarded: <userId> -> <userId>
[WebRTC] Answer forwarded: <userId> -> <userId>
```

### Check Frontend Console:
```javascript
// Open browser console (F12) during call
// Look for:
[Socket.IO] connected
[WebRTC] Offer sent
[WebRTC] Received answer
[WebRTC] Connection state: connected
```

### Verify Socket Connection:
```javascript
// In browser console (F12):
// Type and press Enter:
socket.connected
// Should return: true
```

---

## 📱 Mobile Testing (Optional)

### Same Network:
1. Find your computer's IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Update frontend URL to use IP: `http://192.168.x.x:3000`
3. Access from mobile browser
4. Test call between mobile and desktop

### Requirements:
- Mobile browser with WebRTC support (Chrome, Safari)
- Both devices on same WiFi network
- Camera/microphone permissions granted

---

## 🎬 Demo Script

Use this script to demo the feature:

**"I'll demonstrate our new video calling feature..."**

1. "Here we have two users: Alice (entrepreneur) and Bob (investor)"
2. "Alice navigates to Bob's chat"
3. "Notice Bob is online (green indicator)"
4. "Alice clicks the video call button"
5. "Bob receives an incoming call notification with Alice's info"
6. "Bob accepts the call"
7. "Now they can see and hear each other in real-time"
8. "Alice can mute her microphone - Bob sees the indicator"
9. "Bob can turn off his camera - Alice sees his avatar"
10. "Either party can end the call with the red button"
11. "They return to chat and can continue messaging"
12. "The video calling is fully integrated with our existing chat system"

---

## ✅ Verification Complete

If you've successfully completed all tests above, **Milestone 4 is COMPLETE!**

The Nexus platform now features:
- ✅ Full authentication system
- ✅ User profiles and discovery
- ✅ Real-time text chat
- ✅ Meeting scheduling
- ✅ **WebRTC video calling** ⭐ NEW

**Total Communication Suite:** Text + Video + Meetings = Complete Platform

---

**Need Help?** 
- Check `MILESTONE_4_VIDEO_CALLING_REPORT.md` for detailed technical docs
- Review `backend/socket/videoHandler.js` for backend logic
- Review `Nexus/src/components/video/VideoCallModal.tsx` for frontend logic

**Ready for Production?**
- Add TURN server for better NAT traversal
- Implement call recording (optional)
- Add call quality monitoring (optional)
- Deploy with HTTPS (required)

