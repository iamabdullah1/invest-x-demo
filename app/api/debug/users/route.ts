import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/models';
import connectDB from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Get all users (without passwords)
    const users = await User.find({}).select('-password');
    
    return NextResponse.json({
      success: true,
      count: users.length,
      users: users.map(user => ({
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isActive: user.isActive,
        hasPassword: user.password ? true : false // Check if password exists
      }))
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
