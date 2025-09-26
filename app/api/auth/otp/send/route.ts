import { NextRequest, NextResponse } from 'next/server';
import { sendOTPEmail } from '@/lib/otpService';
import { DatabaseService } from '@/lib/database';
import connectDB, { testConnection } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const { email, type = 'signup' } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Test MongoDB connection before proceeding
    console.log('🔍 Testing MongoDB connection...');
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('❌ MongoDB connection test failed');
      return NextResponse.json(
        { error: 'Database connection unavailable. Please try again.' },
        { status: 503 }
      );
    }

    console.log('✅ MongoDB connection test passed');

    // Ensure database connection
    await connectDB();

    // Check if user exists - only for signup now
    console.log(`🔍 Checking if user exists: ${email}`);
    const existingUser = await DatabaseService.findUserByEmail(email);
    
    if (type === 'signup') {
      // For signup, email should NOT already exist
      if (existingUser) {
        return NextResponse.json(
          { error: 'An account with this email already exists. Please try logging in instead.' },
          { status: 409 }
        );
      }
    }

    const result = await sendOTPEmail(email);

    if (result.success) {
      return NextResponse.json({
        success: true,
        sessionId: result.sessionId,
        message: result.message,
      });
    } else {
      return NextResponse.json(
        { error: result.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in send OTP API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
