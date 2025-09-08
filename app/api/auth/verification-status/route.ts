import { NextRequest, NextResponse } from 'next/server';
import JWTAuthService from '@/lib/jwtAuth';
import { getCollection } from '@/lib/db';
import { ObjectId } from 'mongodb';

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

    // Get latest user data from database
    const usersCollection = await getCollection('users');
    const dbUser = await usersCollection.findOne({ _id: new ObjectId(user._id) });

    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: dbUser._id,
        email: dbUser.email,
        role: dbUser.role,
        verificationStatus: dbUser.verificationStatus || 'none',
        verificationData: dbUser.verificationData || null,
        updatedAt: dbUser.updatedAt
      }
    });

  } catch (error: any) {
    console.error('Check verification status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
