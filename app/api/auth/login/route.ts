import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { User } from '@/models';
import { DatabaseService } from '@/lib/database';
import JWTAuthService from '@/lib/jwtAuth';

export async function POST(request: NextRequest) {
  console.log('=== LOGIN API CALLED ===');
  
  try {
    // Ensure database connection
    await DatabaseService.connect();
    
    const { email, password } = await request.json();
    console.log('Request body parsed:', { email, password: password ? '***' : 'undefined' });

    // Validate input
    if (!email || !password) {
      console.log('Missing email or password');
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email using DatabaseService
    const user = await DatabaseService.findUserByEmail(email);

    console.log('Login attempt for:', email);
    console.log('User found:', user ? 'Yes' : 'No');
    console.log('User has password:', user?.password ? 'Yes' : 'No');

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is inactive. Please contact support.' },
        { status: 401 }
      );
    }

    // Verify password
    if (!user.password) {
      console.log('Password not set for user');
      return NextResponse.json(
        { error: 'Password not set for this account' },
        { status: 401 }
      );
    }

    console.log('Comparing passwords...');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = JWTAuthService.generateToken(user);

    // Create response with user data (excluding password)
    const userData = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      avatar: user.avatar,
      city: user.city,
      totalInvested: user.totalInvested,
      portfolioValue: user.portfolioValue,
      joinDate: user.joinDate
    };

    // Set HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: userData
    });

    // Set auth token as HTTP-only cookie
    response.cookies.set('auth-token', token, JWTAuthService.getCookieOptions());

    return response;

  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
