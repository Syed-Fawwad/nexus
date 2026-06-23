# Mock 2FA/OTP System - Testing Guide

## Overview

This document provides complete testing instructions for the Mock 2FA (Two-Factor Authentication) system implemented in Nexus Platform.

**Implementation Status:** ✅ Complete
- 6-digit OTP generation
- Mock email service (console output)
- OTP verification with expiry
- 2FA enable/disable functionality
- Secure OTP hashing

---

## API Endpoints

### 1. Send OTP
**Endpoint:** `POST /api/auth/send-otp`  
**Authentication:** Required (Bearer Token)  
**Rate Limit:** 5 requests per 15 minutes

**Description:** Generates a 6-digit OTP and sends it to the user's email (mock - logs to console).

**Request Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Request Body:** None required

**Success Response (200):**
```json
{
  "success": true,
  "message": "OTP sent successfully. Check your email or console logs.",
  "email": "user@example.com",
  "expiresIn": "10 minutes",
  "_testOTP": "123456",
  "_note": "OTP included for testing only - will not appear in production"
}
```

**Error Responses:**
- `401`: Not authenticated
- `404`: User not found
- `429`: Too many requests (rate limit exceeded)
- `500`: Server error

---

### 2. Verify OTP
**Endpoint:** `POST /api/auth/verify-otp`  
**Authentication:** Required (Bearer Token)  
**Rate Limit:** 5 requests per 15 minutes

**Description:** Verifies the OTP code and enables 2FA for the user.

**Request Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "otp": "123456"
}
```

**Validation Rules:**
- `otp` is required
- Must be exactly 6 digits
- Must contain only numbers

**Success Response (200):**
```json
{
  "success": true,
  "message": "OTP verified successfully. Two-factor authentication is now enabled.",
  "twoFactorEnabled": true
}
```

**Error Responses:**
- `400`: Invalid OTP, expired OTP, or validation error
- `401`: Not authenticated
- `404`: User not found
- `429`: Too many requests

---

### 3. Disable 2FA
**Endpoint:** `POST /api/auth/disable-2fa`  
**Authentication:** Required (Bearer Token)

**Description:** Disables two-factor authentication for the user.

**Request Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Request Body:** None required

**Success Response (200):**
```json
{
  "success": true,
  "message": "Two-factor authentication has been disabled.",
  "twoFactorEnabled": false
}
```

---

### 4. Get 2FA Status
**Endpoint:** `GET /api/auth/2fa-status`  
**Authentication:** Required (Bearer Token)

**Description:** Check if 2FA is enabled for the authenticated user.

**Request Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "twoFactorEnabled": false,
  "email": "user@example.com"
}
```

---

## Testing Instructions

### Prerequisites

1. **Backend server running:**
   ```bash
   cd backend
   npm run dev
   ```

2. **User account registered and logged in**
   - You need a valid JWT token
   - Register or login to get a token

### Test Scenario 1: Enable 2FA (Happy Path)

#### Step 1: Check Initial 2FA Status
```bash
curl -X GET http://localhost:5000/api/auth/2fa-status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Result:**
```json
{
  "success": true,
  "twoFactorEnabled": false,
  "email": "user@example.com"
}
```

#### Step 2: Request OTP
```bash
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Result:**
- API returns success with email and expiry info
- **Check your terminal/console** where backend is running
- You'll see a mock email output with the 6-digit OTP code

**Console Output Example:**
```
========================================
📧 MOCK EMAIL SERVICE
========================================
To: user@example.com
Subject: Your Nexus Verification Code

Message:
Your verification code is: 123456
This code will expire in 10 minutes.

If you didn't request this code, please ignore this email.
========================================
```

#### Step 3: Copy OTP from Console

From the console output, copy the 6-digit code (e.g., `123456`)

#### Step 4: Verify OTP
```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"otp": "123456"}'
```

**Expected Result:**
```json
{
  "success": true,
  "message": "OTP verified successfully. Two-factor authentication is now enabled.",
  "twoFactorEnabled": true
}
```

#### Step 5: Verify 2FA is Enabled
```bash
curl -X GET http://localhost:5000/api/auth/2fa-status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Result:**
```json
{
  "success": true,
  "twoFactorEnabled": true,
  "email": "user@example.com"
}
```

---

### Test Scenario 2: Invalid OTP

#### Step 1: Request OTP
```bash
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

#### Step 2: Try Wrong OTP
```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"otp": "999999"}'
```

**Expected Result:**
```json
{
  "message": "Invalid OTP code"
}
```

---

### Test Scenario 3: Expired OTP

#### Step 1: Request OTP
```bash
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

#### Step 2: Wait 10+ Minutes

#### Step 3: Try to Verify Expired OTP
```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"otp": "123456"}'
```

**Expected Result:**
```json
{
  "message": "OTP has expired. Please request a new one."
}
```

---

### Test Scenario 4: Validation Errors

#### Invalid Format (Not 6 digits)
```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"otp": "123"}'
```

**Expected Result:**
```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "otp",
      "message": "OTP must be exactly 6 digits"
    }
  ]
}
```

#### Non-numeric OTP
```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"otp": "abc123"}'
```

**Expected Result:**
```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "otp",
      "message": "OTP must contain only numbers"
    }
  ]
}
```

---

### Test Scenario 5: Disable 2FA

#### Step 1: Disable 2FA
```bash
curl -X POST http://localhost:5000/api/auth/disable-2fa \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Result:**
```json
{
  "success": true,
  "message": "Two-factor authentication has been disabled.",
  "twoFactorEnabled": false
}
```

#### Step 2: Verify 2FA is Disabled
```bash
curl -X GET http://localhost:5000/api/auth/2fa-status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Result:**
```json
{
  "success": true,
  "twoFactorEnabled": false,
  "email": "user@example.com"
}
```

---

### Test Scenario 6: Rate Limiting

#### Attempt to send OTP 6 times in rapid succession

**First 5 requests:** Should succeed  
**6th request:** Should be rate limited

**Expected Result:**
```json
{
  "message": "Too many authentication attempts from this IP. Please try again after 15 minutes"
}
```

---

## Testing with Postman

### Import Collection

Create a new Postman collection with the following requests:

1. **Login** - `POST /api/auth/login`
2. **Check 2FA Status** - `GET /api/auth/2fa-status`
3. **Send OTP** - `POST /api/auth/send-otp`
4. **Verify OTP** - `POST /api/auth/verify-otp`
5. **Disable 2FA** - `POST /api/auth/disable-2fa`

### Environment Variables

Create environment variables in Postman:
- `baseUrl`: `http://localhost:5000`
- `token`: (Will be set after login)

### Collection Variables

Set authorization for all requests:
- Type: Bearer Token
- Token: `{{token}}`

---

## Testing with Frontend Integration

### Settings/Security Page Integration

The 2FA system is designed to integrate with a frontend settings page:

**UI Flow:**

1. **Display 2FA Status**
   - Call `GET /api/auth/2fa-status` on page load
   - Show "2FA Enabled" or "2FA Disabled" badge

2. **Enable 2FA Button**
   - User clicks "Enable 2FA"
   - Call `POST /api/auth/send-otp`
   - Show modal: "OTP sent to your email"
   - Display input field for 6-digit code

3. **Enter OTP**
   - User enters 6-digit code
   - Call `POST /api/auth/verify-otp` with the code
   - Show success message
   - Update 2FA status badge

4. **Disable 2FA Button**
   - User clicks "Disable 2FA"
   - Show confirmation dialog
   - Call `POST /api/auth/disable-2fa`
   - Update 2FA status badge

---

## Security Features

### Implemented Security Measures

1. **OTP Hashing**
   - OTP codes are hashed using SHA-256 before storage
   - Plain OTP never stored in database

2. **Expiration**
   - OTP expires after 10 minutes
   - Expired OTPs are automatically cleared

3. **Rate Limiting**
   - Maximum 5 OTP requests per 15 minutes per IP
   - Prevents brute force attacks

4. **Validation**
   - Strict validation: exactly 6 numeric digits
   - Input sanitization applied

5. **Authentication Required**
   - All OTP endpoints require valid JWT token
   - User must be logged in

---

## Troubleshooting

### Issue: OTP not appearing in console

**Solution:**
- Check that backend server is running
- Look for the mock email output in the terminal where you ran `npm run dev`
- The OTP appears between the email header lines

### Issue: 401 Unauthorized

**Solution:**
- Ensure you're including the Authorization header
- Check that your JWT token is valid (not expired)
- Token format: `Bearer YOUR_TOKEN_HERE`

### Issue: OTP verification fails

**Solution:**
- Check that OTP hasn't expired (10 minutes)
- Ensure you're entering the exact 6-digit code
- Request a new OTP if needed

### Issue: Rate limit exceeded

**Solution:**
- Wait 15 minutes before trying again
- Rate limits are per IP address
- In development, restart the server to reset (not recommended for testing rate limits)

---

## Future Production Setup

To enable real email delivery in production:

1. **Install Nodemailer** (already in dependencies)

2. **Update .env file:**
   ```
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   ```

3. **Uncomment production code in `emailService.js`**
   - The file includes commented Nodemailer implementation
   - Uncomment the production version
   - Comment out the mock version

4. **Configure email provider:**
   - Gmail: Use App Password (not regular password)
   - SendGrid: Get API key and configure
   - AWS SES: Set up credentials

---

## Testing Checklist

- [ ] Send OTP successfully
- [ ] Receive OTP in console
- [ ] Verify OTP successfully
- [ ] 2FA enabled after verification
- [ ] Check 2FA status shows enabled
- [ ] Test invalid OTP rejection
- [ ] Test expired OTP rejection
- [ ] Test validation errors (wrong format)
- [ ] Disable 2FA successfully
- [ ] Test rate limiting (6 requests)
- [ ] Test without authentication (should fail)

---

## API Response Examples

All responses follow consistent format:

**Success:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

**Error:**
```json
{
  "message": "Error description"
}
```

**Validation Error:**
```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "fieldName",
      "message": "Error message"
    }
  ]
}
```

---

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Check server console logs for detailed error messages
4. Verify all prerequisites are met

**System Requirements:**
- Node.js 16+
- MongoDB connection
- Backend server running on port 5000
- Valid user account and JWT token
