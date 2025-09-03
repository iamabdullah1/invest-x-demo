import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { User } from '@/models';
import connectDB from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const { email, testPassword } = await request.json();
    
    console.log('Test password API called with:', email);
    
    await connectDB();
    
    // Find user with password
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    console.log('User found:', {
      email: user.email,
      hasPassword: !!user.password,
      passwordLength: user.password?.length,
      role: user.role
    });
    
    if (!user.password) {
      return NextResponse.json({ error: 'No password set' }, { status: 400 });
    }
    
    // Test multiple passwords
    const testPasswords = ['investor123', 'admin123', testPassword];
    const results: Record<string, boolean> = {};
    
    for (const pwd of testPasswords) {
      if (pwd) {
        const isValid = await bcrypt.compare(pwd, user.password);
        results[pwd] = isValid;
        console.log(`Password test: "${pwd}" -> ${isValid}`);
      }
    }
    
    return NextResponse.json({
      success: true,
      user: {
        email: user.email,
        role: user.role,
        hasPassword: !!user.password
      },
      passwordTests: results
    });
    
  } catch (error) {
    console.error('Test password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
