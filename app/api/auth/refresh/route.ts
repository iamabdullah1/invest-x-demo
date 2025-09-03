import { NextRequest, NextResponse } from 'next/server';
import JWTAuthService from '@/lib/jwtAuth';

export async function POST(request: NextRequest) {
  try {
    // Get current token
    const token = JWTAuthService.extractTokenFromRequest(request);
    
    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    // Verify current token
    const payload = JWTAuthService.verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get user from database to ensure they still exist and are active
    const user = await JWTAuthService.getUserFromToken(token);
    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: 'User not found or inactive' },
        { status: 401 }
      );
    }

    // Generate new token
    const newToken = JWTAuthService.generateToken(user);

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Token refreshed successfully'
    });

    // Set new token as HTTP-only cookie
    response.cookies.set('auth-token', newToken, JWTAuthService.getCookieOptions());

    return response;

  } catch (error: any) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
