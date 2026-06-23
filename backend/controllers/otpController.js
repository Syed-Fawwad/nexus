import User from '../models/User.js';
import { generateOTP, generateOTPExpiry, hashOTP, verifyOTP, isOTPExpired } from '../utils/otpUtils.js';
import { sendOTPEmail } from '../utils/emailService.js';

// @desc    Send OTP to user's email
// @route   POST /api/auth/send-otp
// @access  Private (requires authentication)
const sendOTP = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find user (include OTP fields that are normally excluded)
    const user = await User.findById(userId).select('+otpCode +otpExpires');

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Generate 6-digit OTP
    const otp = generateOTP();
    console.log(`[OTP] Generated OTP for ${user.email}: ${otp}`); // For testing purposes

    // Hash OTP before storing
    const hashedOTP = hashOTP(otp);

    // Set OTP expiry (10 minutes from now)
    const otpExpiry = generateOTPExpiry(10);

    // Save OTP to user record
    user.otpCode = hashedOTP;
    user.otpExpires = otpExpiry;
    await user.save();

    // Send OTP via email (mock implementation - logs to console)
    const emailResult = await sendOTPEmail(user.email, otp);

    if (!emailResult.success) {
      res.status(500);
      throw new Error('Failed to send OTP email');
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully. Check your email or console logs.',
      email: user.email,
      expiresIn: '10 minutes',
      // For testing purposes in development
      ...(process.env.NODE_ENV === 'development' && {
        _testOTP: otp,
        _note: 'OTP included for testing only - will not appear in production'
      }),
    });
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    throw error;
  }
};

// @desc    Verify OTP code
// @route   POST /api/auth/verify-otp
// @access  Private (requires authentication)
const verifyOTPCode = async (req, res) => {
  try {
    const { otp } = req.body;
    const userId = req.user._id;

    // Validate OTP input
    if (!otp) {
      res.status(400);
      throw new Error('OTP code is required');
    }

    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(otp)) {
      res.status(400);
      throw new Error('OTP must be a 6-digit number');
    }

    // Find user with OTP fields
    const user = await User.findById(userId).select('+otpCode +otpExpires');

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Check if OTP exists
    if (!user.otpCode || !user.otpExpires) {
      res.status(400);
      throw new Error('No OTP found. Please request a new one.');
    }

    // Check if OTP has expired
    if (isOTPExpired(user.otpExpires)) {
      // Clear expired OTP
      user.otpCode = undefined;
      user.otpExpires = undefined;
      await user.save();

      res.status(400);
      throw new Error('OTP has expired. Please request a new one.');
    }

    // Verify OTP
    const isValid = verifyOTP(otp, user.otpCode);

    if (!isValid) {
      res.status(400);
      throw new Error('Invalid OTP code');
    }

    // OTP is valid - enable 2FA and clear OTP
    user.twoFactorEnabled = true;
    user.otpCode = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully. Two-factor authentication is now enabled.',
      twoFactorEnabled: true,
    });
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    throw error;
  }
};

// @desc    Disable 2FA
// @route   POST /api/auth/disable-2fa
// @access  Private (requires authentication)
const disable2FA = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select('+otpCode +otpExpires');

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Disable 2FA and clear OTP data
    user.twoFactorEnabled = false;
    user.otpCode = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Two-factor authentication has been disabled.',
      twoFactorEnabled: false,
    });
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    throw error;
  }
};

// @desc    Get 2FA status
// @route   GET /api/auth/2fa-status
// @access  Private (requires authentication)
const get2FAStatus = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    res.status(200).json({
      success: true,
      twoFactorEnabled: user.twoFactorEnabled || false,
      email: user.email,
    });
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    throw error;
  }
};

export { sendOTP, verifyOTPCode, disable2FA, get2FAStatus };
