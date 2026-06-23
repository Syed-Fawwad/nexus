import crypto from 'crypto';

/**
 * Generate a 6-digit OTP code
 * @returns {string} - 6-digit numeric OTP code
 */
export const generateOTP = () => {
  // Generate a random 6-digit number
  const otp = crypto.randomInt(100000, 999999).toString();
  return otp;
};

/**
 * Generate OTP expiration time
 * @param {number} minutes - Minutes until expiration (default: 10)
 * @returns {Date} - Expiration timestamp
 */
export const generateOTPExpiry = (minutes = 10) => {
  return new Date(Date.now() + minutes * 60 * 1000);
};

/**
 * Check if OTP has expired
 * @param {Date} expiryDate - OTP expiration date
 * @returns {boolean} - True if expired, false otherwise
 */
export const isOTPExpired = (expiryDate) => {
  return new Date() > new Date(expiryDate);
};

/**
 * Hash OTP for secure storage
 * @param {string} otp - Plain OTP code
 * @returns {string} - Hashed OTP
 */
export const hashOTP = (otp) => {
  return crypto.createHash('sha256').update(otp).digest('hex');
};

/**
 * Verify OTP against hashed value
 * @param {string} plainOTP - Plain OTP code to verify
 * @param {string} hashedOTP - Hashed OTP from database
 * @returns {boolean} - True if match, false otherwise
 */
export const verifyOTP = (plainOTP, hashedOTP) => {
  const hashedInput = hashOTP(plainOTP);
  return hashedInput === hashedOTP;
};
