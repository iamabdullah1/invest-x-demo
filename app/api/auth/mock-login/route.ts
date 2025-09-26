import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail, sanitizeUser } from '@/lib/mockAuthData';

export async function POST(request: NextRequest) {
  console.log('=== MOCK LOGIN API CALLED ===');
  
  try {
    const { email, password } = await request.json();
    console.log('Mock login attempt for:', email);

    // Validate input
    if (!email || !password) {
      console.log('Missing email or password');
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user in mock data
    const user = findUserByEmail(email);
    
    if (!user) {
      console.log('User not found in mock data');
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check password (plain text for mock)
    if (user.password !== password) {
      console.log('Invalid password for user:', email);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create mock session
    const sessionData = {
      userId: user.id,
      email: user.email,
      loginTime: new Date().toISOString()
    };

    // Create response with session cookie
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: sanitizeUser(user)
    });

    // Set mock auth cookie
    response.cookies.set('mock-auth-session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    console.log('Mock login successful for:', email);
    return response;

  } catch (error: any) {
    console.error('Mock login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
