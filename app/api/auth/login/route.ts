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

    console.log('=== LOGIN DEBUG INFO ===');
    console.log('Login attempt for:', email);
    console.log('Normalized email:', email.toLowerCase());
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (user) {
      console.log('User details:');
      console.log('- ID:', user._id);
      console.log('- Email in DB:', user.email);
      console.log('- First Name:', user.firstName);
      console.log('- Role:', user.role);
      console.log('- Is Active:', user.isActive);
      console.log('- Has Password:', user.password ? 'Yes (' + user.password.length + ' chars)' : 'No');
      console.log('- Password starts with:', user.password ? user.password.substring(0, 10) + '...' : 'N/A');
    }
    console.log('========================');

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
    console.log('Provided password:', password);
    console.log('Stored password hash:', user.password);
    console.log('Password length provided:', password.length);
    console.log('Hash length stored:', user.password.length);
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password comparison result:', isPasswordValid);
    
    // Additional debug: Try comparing with different variations
    if (!isPasswordValid) {
      console.log('=== ADDITIONAL PASSWORD DEBUG ===');
      console.log('Trying to compare again...');
      const secondTry = await bcrypt.compare(password, user.password);
      console.log('Second comparison:', secondTry);
      
      // Check if it's a bcrypt hash
      const isBcryptHash = user.password.startsWith('$2a$') || user.password.startsWith('$2b$') || user.password.startsWith('$2y$');
      console.log('Is valid bcrypt hash format:', isBcryptHash);
      
      console.log('================================');
    }
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Log role assignment
    console.log(`🎯 Role Assignment - User: ${user.email}, Role: ${user.role} (${user.role === 'guest' ? 'Guest' : user.role === 'investor' ? 'Investor' : 'Admin'})`);

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

    console.log(`📦 User Data Created - Role: ${userData.role}, Name: ${userData.firstName} ${userData.lastName}`);

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
