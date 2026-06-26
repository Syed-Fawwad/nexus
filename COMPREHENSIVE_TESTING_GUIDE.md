# NEXUS PLATFORM - COMPREHENSIVE TESTING GUIDE

**Version:** 1.0  
**Purpose:** Manual testing checklist for all features  
**Status:** Production Testing Ready

---

## TESTING OVERVIEW

This guide provides step-by-step instructions to manually test every feature of the Nexus platform.

**Estimated Testing Time:** 2-3 hours for complete testing

---

## SETUP FOR TESTING

### Prerequisites
- [ ] Backend server running (local or deployed)
- [ ] Frontend running (local or deployed)
- [ ] MongoDB connected
- [ ] 2 browsers ready (for real-time testing)
- [ ] Camera and microphone available (for video testing)

### Test Users Required
- **Entrepreneur:** test-entrepreneur@example.com / Test123!
- **Investor:** test-investor@example.com / Test123!

---

## TEST SUITE 1: AUTHENTICATION & AUTHORIZATION

### Test 1.1: User Registration (Entrepreneur)

**Steps:**
1. Navigate to `/register`
2. Fill form:
   - Name: "Test Entrepreneur"
   - Email: "test-entrepreneur@example.com"
   - Password: "Test123!"
   - Role: Select "Entrepreneur"
3. Click "Register"

**Expected Results:**
- ✅ Redirect to entrepreneur dashboard
- ✅ JWT token saved in localStorage
- ✅ Dashboard displays user name
- ✅ No console errors

**Verification:**
```javascript
// Open browser console (F12)
localStorage.getItem('business_nexus_token') // Should return JWT
```

**Status:** [ ] PASS [ ] FAIL

**Notes:** _______________

---

### Test 1.2: User Registration (Investor)

**Steps:**
1. Open incognito/private window
2. Navigate to `/register`
3. Fill form:
   - Name: "Test Investor"
   - Email: "test-investor@example.com"
   - Password: "Test123!"
   - Role: Select "Investor"
4. Click "Register"

**Expected Results:**
- ✅ Redirect to investor dashboard
- ✅ Different dashboard layout than entrepreneur
- ✅ JWT token saved

**Status:** [ ] PASS [ ] FAIL

---

### Test 1.3: Login with Valid Credentials

**Steps:**
1. Logout if logged in
2. Navigate to `/login`
3. Enter: test-entrepreneur@example.com / Test123!
4. Click "Login"

**Expected Results:**
- ✅ Redirect to dashboard
- ✅ User authenticated
- ✅ Dashboard loads without errors

**Status:** [ ] PASS [ ] FAIL

---

### Test 1.4: Login with Invalid Credentials

**Steps:**
1. Navigate to `/login`
2. Enter: test@test.com / WrongPassword
3. Click "Login"

**Expected Results:**
- ❌ Login fails
- ✅ Error message displayed
- ✅ User not authenticated
- ✅ Stays on login page

**Status:** [ ] PASS [ ] FAIL

---

### Test 1.5: Protected Route Access

**Steps:**
1. Logout completely
2. Clear localStorage
3. Try to access: `/dashboard/entrepreneur`

**Expected Results:**
- ✅ Redirect to `/login`
- ✅ Cannot access without authentication

**Status:** [ ] PASS [ ] FAIL

---

### Test 1.6: Role-Based Authorization

**Steps:**
1. Login as Entrepreneur
2. Manually navigate to `/dashboard/investor`

**Expected Results:**
- ✅ Either redirected or shown "Access Denied"
- ✅ Cannot access investor-only routes

**Status:** [ ] PASS [ ] FAIL

---

## TEST SUITE 2: DASHBOARD & STATISTICS

### Test 2.1: Entrepreneur Dashboard Statistics

**Steps:**
1. Login as entrepreneur
2. View dashboard at `/dashboard/entrepreneur`
3. Observe statistics cards

**Expected Results:**
- ✅ "Pending Invitations" shows number (may be 0)
- ✅ "Total Connections" shows number
- ✅ "Upcoming Meetings" shows number
- ✅ "Total Meetings" shows number
- ✅ Statistics loaded from API (not hardcoded)
- ✅ Loading state shows "..." before data loads
- ✅ No "undefined" or "NaN" values

**Verification:**
Check Network tab → `/api/dashboard/entrepreneur` returns JSON

**Status:** [ ] PASS [ ] FAIL

---

### Test 2.2: Investor Dashboard Statistics

**Steps:**
1. Login as investor
2. View dashboard
3. Check statistics

**Expected Results:**
- ✅ "Total Startups" displays count
- ✅ "Total Meetings" displays count
- ✅ "Your Connections" displays count
- ✅ Featured startups section loads
- ✅ Search and filter work

**Status:** [ ] PASS [ ] FAIL

---

### Test 2.3: Collaboration Requests (Entrepreneur)

**Steps:**
1. Login as entrepreneur
2. Check "Collaboration Requests" section
3. If requests exist, test Accept/Decline buttons

**Expected Results:**
- ✅ Requests load from backend API
- ✅ Shows investor details (name, avatar)
- ✅ Accept button works
- ✅ Decline button works
- ✅ Status updates in real-time
- ✅ Toast notification appears

**Status:** [ ] PASS [ ] FAIL

---

## TEST SUITE 3: PROFILE MANAGEMENT

### Test 3.1: View Own Profile

**Steps:**
1. Login as entrepreneur
2. Navigate to Settings or Profile
3. View profile details

**Expected Results:**
- ✅ All fields display correctly
- ✅ Extended profile data shows (startup name, industry, etc.)
- ✅ Avatar displays

**Status:** [ ] PASS [ ] FAIL

---

### Test 3.2: Edit Profile

**Steps:**
1. Click "Edit Profile"
2. Update:
   - Bio: "This is my updated bio"
   - Startup Name: "TechVenture Inc"
   - Industry: "Technology"
3. Click "Save"

**Expected Results:**
- ✅ Success message displayed
- ✅ Changes saved to database
- ✅ Refresh page → changes persist

**Verification:**
```
Network → PUT /api/users/profile → Status 200
```

**Status:** [ ] PASS [ ] FAIL

---

### Test 3.3: View Other User Profile

**Steps:**
1. Navigate to `/investors` or `/entrepreneurs`
2. Click on any user card
3. View their profile

**Expected Results:**
- ✅ Profile page loads
- ✅ Shows user details
- ✅ Shows "Message" button
- ✅ Shows profile data

**Status:** [ ] PASS [ ] FAIL

---

## TEST SUITE 4: REAL-TIME MESSAGING

### Test 4.1: Send Message

**Setup:**
- Browser 1: Login as Entrepreneur
- Browser 2: Login as Investor (incognito)

**Steps (Browser 1):**
1. Navigate to `/messages` or `/chat`
2. Select Investor user from list
3. Type message: "Hello from entrepreneur"
4. Press Send

**Expected Results (Browser 1):**
- ✅ Message appears in chat window immediately
- ✅ Timestamp shows
- ✅ Message aligned to right (sent by me)

**Expected Results (Browser 2):**
- ✅ Message appears instantly (no refresh needed)
- ✅ Message aligned to left (received)
- ✅ Notification sound/badge (if implemented)

**Status:** [ ] PASS [ ] FAIL

---

### Test 4.2: Typing Indicator

**Steps:**
1. Browser 1: Start typing in message box
2. Browser 2: Watch for typing indicator

**Expected Results:**
- ✅ "User is typing..." appears in Browser 2
- ✅ Disappears when typing stops

**Status:** [ ] PASS [ ] FAIL

---

### Test 4.3: Online/Offline Status

**Steps:**
1. Browser 2: Close tab or logout
2. Browser 1: Check user status indicator

**Expected Results:**
- ✅ User shows as "offline"
- ✅ Status updates without page refresh

**Status:** [ ] PASS [ ] FAIL

---

### Test 4.4: Message Persistence

**Steps:**
1. Send several messages
2. Logout
3. Login again
4. Navigate to chat

**Expected Results:**
- ✅ Previous messages still visible
- ✅ Messages loaded from database
- ✅ Conversation history preserved

**Status:** [ ] PASS [ ] FAIL

---

## TEST SUITE 5: MEETING SCHEDULING

### Test 5.1: Create Meeting

**Steps:**
1. Navigate to `/meetings`
2. Click "Schedule Meeting"
3. Fill form:
   - Guest: Select an investor
   - Title: "Pitch Discussion"
   - Description: "Discuss funding opportunities"
   - Start: Tomorrow at 2:00 PM
   - End: Tomorrow at 3:00 PM
4. Click "Create Meeting"

**Expected Results:**
- ✅ Meeting created successfully
- ✅ Appears in meeting list
- ✅ Status shows "Pending"
- ✅ Guest receives invitation

**Verification:**
```
Network → POST /api/meetings → Status 201
```

**Status:** [ ] PASS [ ] FAIL

---

### Test 5.2: Meeting Conflict Detection

**Steps:**
1. Try to create another meeting
2. Use same time slot as previous meeting
3. Submit

**Expected Results:**
- ❌ Meeting creation fails
- ✅ Error message: "You already have a meeting scheduled during this time"
- ✅ Meeting not created

**Status:** [ ] PASS [ ] FAIL

---

### Test 5.3: Accept Meeting (as Guest)

**Steps:**
1. Switch to Browser 2 (guest user)
2. Navigate to `/meetings`
3. Find pending meeting
4. Click "Accept"

**Expected Results:**
- ✅ Status changes to "Accepted"
- ✅ Both users see updated status
- ✅ Meeting appears in both calendars

**Status:** [ ] PASS [ ] FAIL

---

### Test 5.4: Reject Meeting

**Steps:**
1. Create another meeting
2. As guest, click "Reject"

**Expected Results:**
- ✅ Status changes to "Rejected"
- ✅ Meeting marked as rejected
- ✅ Both users notified

**Status:** [ ] PASS [ ] FAIL

---

### Test 5.5: Calendar View

**Steps:**
1. Navigate to `/meetings`
2. View calendar

**Expected Results:**
- ✅ Meetings displayed on calendar
- ✅ Can navigate between months
- ✅ Click on meeting shows details
- ✅ Color-coded by status

**Status:** [ ] PASS [ ] FAIL

---

## TEST SUITE 6: VIDEO CALLING

### Test 6.1: Initiate Video Call

**Prerequisites:**
- 2 browsers with camera/microphone access
- Both users logged in
- Both users online

**Steps (Browser 1):**
1. Navigate to `/chat/:userId`
2. Click "Video Call" button
3. Allow camera/microphone access

**Expected Results (Browser 1):**
- ✅ Video call modal opens
- ✅ Local video displays (yourself)
- ✅ Shows "Calling..." status

**Expected Results (Browser 2):**
- ✅ Incoming call notification appears
- ✅ Shows caller name and avatar
- ✅ "Accept" and "Decline" buttons visible

**Status:** [ ] PASS [ ] FAIL

---

### Test 6.2: Accept Video Call

**Steps (Browser 2):**
1. Click "Accept" on incoming call
2. Allow camera/microphone access

**Expected Results:**
- ✅ Video call connects
- ✅ Remote video displays (Browser 1's video in Browser 2)
- ✅ Local video displays (Browser 2's video in Browser 2)
- ✅ Browser 1 sees Browser 2's video
- ✅ Both users can see each other

**Verification:**
- Check console for "RTCPeerConnection" events
- Check for "connected" state

**Status:** [ ] PASS [ ] FAIL

---

### Test 6.3: Toggle Audio During Call

**Steps:**
1. During active call, click microphone button
2. Check partner's video

**Expected Results:**
- ✅ Microphone icon shows "muted" state
- ✅ Partner sees audio muted indicator
- ✅ Partner cannot hear you
- ✅ Click again to unmute

**Status:** [ ] PASS [ ] FAIL

---

### Test 6.4: Toggle Video During Call

**Steps:**
1. Click video button to turn off camera
2. Check partner's screen

**Expected Results:**
- ✅ Your video stops
- ✅ Shows avatar or "Camera off" placeholder
- ✅ Partner sees "Video off" indicator
- ✅ Click again to turn on

**Status:** [ ] PASS [ ] FAIL

---

### Test 6.5: End Video Call

**Steps:**
1. Click "End Call" button (red phone icon)

**Expected Results:**
- ✅ Call ends immediately
- ✅ Video streams stop
- ✅ Modal closes
- ✅ Partner's call also ends
- ✅ Both users return to chat

**Status:** [ ] PASS [ ] FAIL

---

### Test 6.6: Reject Video Call

**Steps:**
1. Browser 1: Initiate call
2. Browser 2: Click "Decline"

**Expected Results:**
- ✅ Call rejected
- ✅ Browser 1 sees "Call declined" message
- ✅ Browser 2 returns to chat
- ✅ No connection established

**Status:** [ ] PASS [ ] FAIL

---

## TEST SUITE 7: DOCUMENT MANAGEMENT

### Test 7.1: Upload Document

**Steps:**
1. Navigate to `/documents`
2. Click "Upload Document"
3. Select file (PDF, DOCX, or image)
4. Click "Upload"

**Expected Results:**
- ✅ Upload progress shown
- ✅ Document appears in list
- ✅ Shows filename, size, date
- ✅ Status is "Active"

**Verification:**
```
Network → POST /api/documents/upload → Status 201
```

**Status:** [ ] PASS [ ] FAIL

---

### Test 7.2: View/Preview Document

**Steps:**
1. Click on uploaded document
2. View details

**Expected Results:**
- ✅ Document details displayed
- ✅ Preview available (if supported format)
- ✅ Download button visible

**Status:** [ ] PASS [ ] FAIL

---

### Test 7.3: Download Document

**Steps:**
1. Click "Download" button

**Expected Results:**
- ✅ File downloads to computer
- ✅ Filename matches original
- ✅ File opens correctly

**Status:** [ ] PASS [ ] FAIL

---

### Test 7.4: Sign Document

**Steps:**
1. Select a document
2. Click "Sign Document"
3. Upload signature image or draw signature
4. Submit

**Expected Results:**
- ✅ Signature uploaded
- ✅ Document marked as "Signed"
- ✅ Shows signer name and date
- ✅ Cannot sign twice

**Status:** [ ] PASS [ ] FAIL

---

### Test 7.5: Delete Document

**Steps:**
1. Select a document
2. Click "Delete"
3. Confirm deletion

**Expected Results:**
- ✅ Confirmation dialog appears
- ✅ After confirm, document removed
- ✅ No longer appears in list
- ✅ File deleted from server

**Status:** [ ] PASS [ ] FAIL

---

## TEST SUITE 8: PAYMENT SYSTEM

### Test 8.1: View Wallet Balance

**Steps:**
1. Navigate to `/payments`
2. View wallet section

**Expected Results:**
- ✅ Current balance displayed
- ✅ Shows $0.00 initially (for new users)
- ✅ Transaction history visible

**Status:** [ ] PASS [ ] FAIL

---

### Test 8.2: Deposit Funds

**Steps:**
1. Click "Deposit"
2. Enter amount: 100
3. Enter description: "Test deposit"
4. Click "Confirm"

**Expected Results:**
- ✅ Processing indicator shown
- ✅ Success message appears
- ✅ Balance updates to $100.00
- ✅ Transaction appears in history
- ✅ Status: "Completed"

**Verification:**
```
Network → POST /api/payments/deposit → Status 201
```

**Status:** [ ] PASS [ ] FAIL

---

### Test 8.3: Withdraw Funds

**Prerequisites:**
- Wallet balance > 0

**Steps:**
1. Click "Withdraw"
2. Enter amount: 50
3. Submit

**Expected Results:**
- ✅ Balance decreases by $50
- ✅ New balance: $50.00
- ✅ Withdrawal in transaction history
- ✅ Type: "Withdraw"

**Status:** [ ] PASS [ ] FAIL

---

### Test 8.4: Transfer Funds

**Prerequisites:**
- 2 users
- Sender has balance > 0

**Steps:**
1. Click "Transfer"
2. Select recipient user
3. Enter amount: 25
4. Description: "Payment for services"
5. Submit

**Expected Results (Sender):**
- ✅ Balance decreases by $25
- ✅ Transaction shows: "Transfer to [Name]"
- ✅ Type: "Transfer"

**Expected Results (Recipient):**
- ✅ Balance increases by $25
- ✅ Transaction shows: "Transfer from [Name]"
- ✅ Type: "Deposit"

**Status:** [ ] PASS [ ] FAIL

---

### Test 8.5: Insufficient Funds

**Steps:**
1. Try to withdraw more than current balance
2. Enter amount: 99999
3. Submit

**Expected Results:**
- ❌ Transaction fails
- ✅ Error: "Insufficient funds"
- ✅ Balance unchanged

**Status:** [ ] PASS [ ] FAIL

---

### Test 8.6: Transaction History

**Steps:**
1. View transaction history
2. Check filters (deposit, withdraw, transfer)

**Expected Results:**
- ✅ All transactions listed
- ✅ Shows date, amount, type, status
- ✅ Pagination works (if many transactions)
- ✅ Filters work correctly

**Status:** [ ] PASS [ ] FAIL

---

## TEST SUITE 9: SECURITY & 2FA

### Test 9.1: Enable 2FA

**Steps:**
1. Navigate to `/settings`
2. Find "Two-Factor Authentication"
3. Click "Enable 2FA"
4. Click "Send OTP"

**Expected Results:**
- ✅ OTP sent to email (check console logs)
- ✅ Shows "OTP sent" message
- ✅ 6-digit code generated

**Verification:**
Check backend logs for OTP code

**Status:** [ ] PASS [ ] FAIL

---

### Test 9.2: Verify OTP

**Steps:**
1. Enter OTP code from logs/email
2. Click "Verify"

**Expected Results:**
- ✅ "OTP verified successfully"
- ✅ 2FA enabled
- ✅ Status shows "Enabled"

**Status:** [ ] PASS [ ] FAIL

---

### Test 9.3: Wrong OTP

**Steps:**
1. Send OTP again
2. Enter wrong code: "000000"
3. Submit

**Expected Results:**
- ❌ Verification fails
- ✅ Error: "Invalid OTP code"
- ✅ 2FA not enabled

**Status:** [ ] PASS [ ] FAIL

---

### Test 9.4: Expired OTP

**Steps:**
1. Send OTP
2. Wait 10+ minutes
3. Try to verify with old code

**Expected Results:**
- ❌ Verification fails
- ✅ Error: "OTP has expired"
- ✅ Must request new OTP

**Status:** [ ] PASS [ ] FAIL

---

### Test 9.5: Password Security

**Steps:**
1. Try to register with weak password: "123456"

**Expected Results:**
- ❌ Registration fails
- ✅ Error: "Password must contain uppercase, lowercase, and number"
- ✅ Validation prevents weak passwords

**Status:** [ ] PASS [ ] FAIL

---

## TEST SUITE 10: ERROR HANDLING & EDGE CASES

### Test 10.1: Network Error Handling

**Steps:**
1. Disable network (airplane mode or disconnect WiFi)
2. Try to perform any action (send message, create meeting)

**Expected Results:**
- ✅ User-friendly error message
- ✅ "Network error" or "Cannot connect to server"
- ✅ No blank screen
- ✅ App remains functional after reconnect

**Status:** [ ] PASS [ ] FAIL

---

### Test 10.2: Invalid Input Handling

**Steps:**
1. Try various invalid inputs:
   - Meeting with end time before start time
   - Transfer $0 or negative amount
   - Upload 0-byte file

**Expected Results:**
- ✅ All validated on frontend
- ✅ Clear error messages
- ✅ Prevents submission

**Status:** [ ] PASS [ ] FAIL

---

### Test 10.3: Session Expiry

**Steps:**
1. Login
2. Wait for JWT to expire (or manually expire token)
3. Try to access protected route

**Expected Results:**
- ✅ Redirect to login
- ✅ Message: "Session expired, please login again"
- ✅ Can login again successfully

**Status:** [ ] PASS [ ] FAIL

---

### Test 10.4: Concurrent Requests

**Steps:**
1. Rapidly click "Deposit" button 10 times

**Expected Results:**
- ✅ Only 1 transaction processed
- ✅ Button disabled during processing
- ✅ No duplicate transactions

**Status:** [ ] PASS [ ] FAIL

---

## TEST SUITE 11: MOBILE RESPONSIVENESS

### Test 11.1: Mobile Layout

**Steps:**
1. Open app on mobile device or use Chrome DevTools (F12 → Toggle device toolbar)
2. Test iPhone, iPad, Android sizes

**Expected Results:**
- ✅ Layout adapts to screen size
- ✅ Navigation menu accessible
- ✅ All features usable
- ✅ Text readable without zooming

**Status:** [ ] PASS [ ] FAIL

---

### Test 11.2: Touch Interactions

**Steps:**
1. On mobile, test:
   - Tap buttons
   - Scroll lists
   - Open modals
   - Fill forms

**Expected Results:**
- ✅ All touch targets large enough
- ✅ No accidental clicks
- ✅ Smooth scrolling

**Status:** [ ] PASS [ ] FAIL

---

## FINAL VERIFICATION

### Browser Compatibility

Test in multiple browsers:
- [ ] Chrome ✅
- [ ] Firefox ✅
- [ ] Safari ✅
- [ ] Edge ✅

**Status:** [ ] PASS [ ] FAIL

---

### Performance Check

**Steps:**
1. Open Chrome DevTools
2. Run Lighthouse audit
3. Check scores

**Expected:**
- Performance: >70
- Accessibility: >80
- Best Practices: >80

**Status:** [ ] PASS [ ] FAIL

---

## TEST SUMMARY

### Results
- Total Tests: 60+
- Passed: _____
- Failed: _____
- Skipped: _____

### Critical Failures
(List any critical issues found)
1. _______________
2. _______________

### Minor Issues
(List non-blocking issues)
1. _______________
2. _______________

### Overall Assessment
- [ ] Ready for Production
- [ ] Needs Minor Fixes
- [ ] Needs Major Fixes

---

## SIGN-OFF

**Tester Name:** _______________  
**Date:** _______________  
**Version Tested:** 1.0  
**Environment:** [ ] Local [ ] Staging [ ] Production  

**Signature:** _______________

---

**END OF TESTING GUIDE**

All tests should PASS for production deployment approval.
