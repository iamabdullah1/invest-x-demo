import { NextRequest, NextResponse } from 'next/server';
import JWTAuthService from '@/lib/jwtAuth';

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const { user, error } = await JWTAuthService.requireAuth(request);

    if (error || !user) {
      return NextResponse.json(
        { error: error || 'Not authenticated' },
        { status: 401 }
      );
    }

    // Return user data (password already excluded from model)
    const userData = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      avatar: user.avatar,
      city: user.city,
      phone: user.phone,
      cnicNumber: user.cnicNumber,
      totalInvested: user.totalInvested,
      portfolioValue: user.portfolioValue,
      joinDate: user.joinDate,
      lastLogin: user.lastLogin,
      notifications: user.notifications
    };

    return NextResponse.json({
      success: true,
      user: userData
    });

  } catch (error: any) {
    console.error('Get current user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
