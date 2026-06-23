/**
 * Mock Email Service
 *
 * This is a mock implementation that logs emails to console instead of sending real emails.
 * In production, replace this with actual email service (Nodemailer with SMTP, SendGrid, AWS SES, etc.)
 */

/**
 * Send OTP email (Mock Implementation)
 * @param {string} email - Recipient email address
 * @param {string} otpCode - 6-digit OTP code
 * @returns {Promise<object>} - Result object
 */
export const sendOTPEmail = async (email, otpCode) => {
  try {
    // Mock email sending - just log to console
    console.log('\n========================================');
    console.log('📧 MOCK EMAIL SERVICE');
    console.log('========================================');
    console.log(`To: ${email}`);
    console.log(`Subject: Your Nexus Verification Code`);
    console.log(`\nMessage:`);
    console.log(`Your verification code is: ${otpCode}`);
    console.log(`This code will expire in 10 minutes.`);
    console.log(`\nIf you didn't request this code, please ignore this email.`);
    console.log('========================================\n');

    // Simulate successful email delivery
    return {
      success: true,
      message: 'OTP sent successfully (mock)',
      email,
    };
  } catch (error) {
    console.error('Error in mock email service:', error);
    return {
      success: false,
      message: 'Failed to send OTP',
      error: error.message,
    };
  }
};

/**
 * Send welcome email (Mock Implementation)
 * @param {string} email - Recipient email address
 * @param {string} name - User's name
 * @returns {Promise<object>} - Result object
 */
export const sendWelcomeEmail = async (email, name) => {
  try {
    console.log('\n========================================');
    console.log('📧 MOCK EMAIL SERVICE');
    console.log('========================================');
    console.log(`To: ${email}`);
    console.log(`Subject: Welcome to Nexus Platform`);
    console.log(`\nMessage:`);
    console.log(`Hi ${name},`);
    console.log(`Welcome to Nexus! Your account has been created successfully.`);
    console.log('========================================\n');

    return {
      success: true,
      message: 'Welcome email sent successfully (mock)',
      email,
    };
  } catch (error) {
    console.error('Error in mock email service:', error);
    return {
      success: false,
      message: 'Failed to send welcome email',
      error: error.message,
    };
  }
};

/**
 * For production use, uncomment and configure this Nodemailer implementation:
 */

/*
import nodemailer from 'nodemailer';

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendOTPEmail = async (email, otpCode) => {
  try {
    const mailOptions = {
      from: `"Nexus Platform" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Nexus Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Your Verification Code</h2>
          <p>Your verification code is:</p>
          <div style="background-color: #F3F4F6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${otpCode}
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
          <hr style="margin-top: 30px; border: none; border-top: 1px solid #E5E7EB;">
          <p style="color: #6B7280; font-size: 12px;">Nexus Platform - Connecting Entrepreneurs & Investors</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);

    return {
      success: true,
      message: 'OTP sent successfully',
      email,
    };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send OTP email');
  }
};
*/
