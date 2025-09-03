import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { User } from '@/models';
import connectDB from '@/lib/mongodb';
import JWTAuthService from '@/lib/jwtAuth';

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, phone, password, confirmPassword, role = 'investor', isEmailVerified = false } = await request.json();

    // Validate input
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'First name, last name, email, and password are required' },
        { status: 400 }
      );
    }

    // Only validate confirmPassword if it's provided (for direct signup)
    if (confirmPassword !== undefined && password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Validate role
    if (!['guest', 'investor'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be guest or investor' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone?.trim(),
      password: hashedPassword,
      role: role, // Use the selected role (guest or investor)
      isEmailVerified: isEmailVerified, // Set verification status
      isActive: true
    });

    const savedUser = await newUser.save();

    // Generate JWT token
    const token = JWTAuthService.generateToken(savedUser);

    // Create response with user data (excluding password)
    const userData = {
      id: savedUser._id,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      email: savedUser.email,
      role: savedUser.role,
      isEmailVerified: savedUser.isEmailVerified,
      avatar: savedUser.avatar,
      city: savedUser.city,
      totalInvested: savedUser.totalInvested,
      portfolioValue: savedUser.portfolioValue,
      joinDate: savedUser.joinDate
    };

    // Set HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: userData
    });

    // Set auth token as HTTP-only cookie
    response.cookies.set('auth-token', token, JWTAuthService.getCookieOptions());

    return response;

  } catch (error: any) {
    console.error('Registration error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
