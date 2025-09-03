import { NextRequest, NextResponse } from 'next/server';
import { resendOTP } from '@/lib/otpService';

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const result = await resendOTP(sessionId);

    if (result.success) {
      return NextResponse.json({
        success: true,
        sessionId: result.sessionId,
        message: result.message,
      });
    } else {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in resend OTP API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
