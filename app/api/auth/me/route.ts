import { NextRequest, NextResponse } from 'next/server';
import JWTAuthService from '@/lib/jwtAuth';
import { findUserById, sanitizeUser } from '@/lib/mockAuthData';

export async function GET(request: NextRequest) {
  try {
    // Try JWT-based authentication first
    try {
      const { user, error } = await JWTAuthService.requireAuth(request);

      if (!error && user) {
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
      }
    } catch (dbError) {
      console.warn('Database authentication failed, trying fallback:', dbError);
    }

    // Fallback to mock authentication
    // Check for a simple auth cookie or localStorage-based session
    const cookies = request.cookies;
    const mockSession = cookies.get('mock-auth-session');
    
    if (mockSession) {
      try {
        const sessionData = JSON.parse(mockSession.value);
        const user = findUserById(sessionData.userId);
        
        if (user) {
          return NextResponse.json({
            success: true,
            user: sanitizeUser(user)
          });
        }
      } catch (parseError) {
        console.warn('Mock session parse error:', parseError);
      }
    }

    // No valid authentication found
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    );

  } catch (error: any) {
    console.error('Get current user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
