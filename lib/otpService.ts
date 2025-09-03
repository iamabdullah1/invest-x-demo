import nodemailer from 'nodemailer';
import crypto from 'crypto';

// In-memory storage for OTPs (in production, use Redis or database)
interface OTPData {
  otp: string;
  email: string;
  expiresAt: Date;
  attempts: number;
}

// Use globalThis to persist storage across hot reloads in development
const globalForOTP = globalThis as unknown as {
  otpStorage: Map<string, OTPData> | undefined
}

const otpStorage = globalForOTP.otpStorage ?? new Map<string, OTPData>()

if (process.env.NODE_ENV !== 'production') {
  globalForOTP.otpStorage = otpStorage
}

// Generate 6-digit OTP
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate unique session ID for OTP
const generateSessionId = (): string => {
  return crypto.randomUUID();
};

// Send OTP via email (with development mode support)
export const sendOTPEmail = async (email: string): Promise<{ success: boolean; sessionId?: string; message: string }> => {
  try {
    const otp = generateOTP();
    const sessionId = generateSessionId();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

    // Store OTP in memory
    otpStorage.set(sessionId, {
      otp,
      email,
      expiresAt,
      attempts: 0,
    });

    console.log('\n💾 OTP SESSION STORED 💾');
    console.log('====================================');
    console.log(`Session ID: ${sessionId}`);
    console.log(`Storage now has ${otpStorage.size} entries`);
    console.log('====================================\n');

    // For development - just log the OTP to console
    if (process.env.DEV_MODE_OTP === 'true' || (!process.env.AUTH_EMAIL || !process.env.AUTH_PASSWORD)) {
      console.log('\n🚀 OTP EMAIL (Development Mode) 🚀');
      console.log('====================================');
      console.log(`To: ${email}`);
      console.log(`OTP Code: ${otp}`);
      console.log(`Session ID: ${sessionId}`);
      console.log(`Expires at: ${expiresAt.toLocaleString()}`);
      console.log('====================================\n');
      
      return {
        success: true,
        sessionId,
        message: 'OTP sent successfully (check console for development OTP)',
      };
    }

    // Create email transporter for production (following your Gmail approach)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASSWORD,
      },
    } as any);

    // Email content (improved HTML template based on your approach)
    const mailOptions = {
      from: process.env.AUTH_EMAIL,
      to: email,
      subject: 'InvestX - OTP Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin: 0; font-size: 28px;">InvestX</h1>
              <p style="color: #6b7280; margin: 5px 0;">Real Estate Investment Platform</p>
            </div>
            
            <h2 style="color: #1f2937; margin-bottom: 20px; text-align: center;">OTP Verification</h2>
            <p style="color: #374151; font-size: 16px; line-height: 1.5;">
              Hi there,<br><br>
              Your OTP verification code is: <strong style="font-size: 24px; color: #2563eb; letter-spacing: 2px;">${otp}</strong>
            </p>
            
            <div style="background: #f3f4f6; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="color: #ef4444; margin: 0; font-weight: bold;">
                ⏰ This code expires in 5 minutes
              </p>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              If you didn't request this code, please ignore this email.
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 12px;">
              <p>© 2025 InvestX. All rights reserved.</p>
            </div>
          </div>
        </div>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return {
      success: true,
      sessionId,
      message: 'OTP sent successfully',
    };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return {
      success: false,
      message: 'Failed to send OTP. Please try again.',
    };
  }
};

// Verify OTP
export const verifyOTP = (sessionId: string, inputOTP: string): { success: boolean; message: string } => {
  console.log('\n🔍 OTP VERIFICATION DEBUG 🔍');
  console.log('====================================');
  console.log(`Received Session ID: ${sessionId}`);
  console.log(`Received OTP: ${inputOTP}`);
  console.log(`Storage has ${otpStorage.size} entries`);
  console.log('All stored sessions:', Array.from(otpStorage.keys()));
  console.log('====================================\n');

  const otpData = otpStorage.get(sessionId);

  if (!otpData) {
    return {
      success: false,
      message: 'Invalid session. Please request a new OTP.',
    };
  }

  // Check if OTP has expired
  if (new Date() > otpData.expiresAt) {
    otpStorage.delete(sessionId);
    return {
      success: false,
      message: 'OTP has expired. Please request a new one.',
    };
  }

  // Check attempts limit
  if (otpData.attempts >= 3) {
    otpStorage.delete(sessionId);
    return {
      success: false,
      message: 'Too many failed attempts. Please request a new OTP.',
    };
  }

  // Verify OTP
  if (otpData.otp === inputOTP) {
    otpStorage.delete(sessionId); // Clean up after successful verification
    return {
      success: true,
      message: 'OTP verified successfully',
    };
  } else {
    // Increment attempts
    otpData.attempts += 1;
    otpStorage.set(sessionId, otpData);
    
    return {
      success: false,
      message: `Invalid OTP. ${3 - otpData.attempts} attempts remaining.`,
    };
  }
};

// Resend OTP (invalidate old one and send new)
export const resendOTP = async (sessionId: string): Promise<{ success: boolean; sessionId?: string; message: string }> => {
  const otpData = otpStorage.get(sessionId);

  if (!otpData) {
    return {
      success: false,
      message: 'Invalid session. Please start the process again.',
    };
  }

  // Delete old OTP
  otpStorage.delete(sessionId);

  // Send new OTP
  return await sendOTPEmail(otpData.email);
};

// Clean expired OTPs (should be called periodically)
export const cleanExpiredOTPs = () => {
  const now = new Date();
  for (const [sessionId, otpData] of otpStorage.entries()) {
    if (now > otpData.expiresAt) {
      otpStorage.delete(sessionId);
    }
  }
};
