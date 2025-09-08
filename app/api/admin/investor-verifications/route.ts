import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';
import JWTAuthService from '@/lib/jwtAuth';

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const { user, error } = await JWTAuthService.requireAuth(request);
    if (error || !user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Build query for users collection - fetch users with verification requests
    const query: any = {};
    if (status && status !== 'all') {
      query.verificationStatus = status;
    } else {
      // Show all users who have submitted verification (not 'none')
      query.verificationStatus = { $ne: 'none' };
    }

    // Get the users collection
    const usersCollection = await getCollection('users');
    
    const users = await usersCollection
      .find(query)
      .sort({ 'verificationData.submittedAt': -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await usersCollection.countDocuments(query);

    // Transform user data to match expected verification format
    const verifications = users.map(user => ({
      _id: user._id,
      verificationId: user.verificationData?.verificationId,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      address: user.verificationData?.address,
      city: user.city,
      postalCode: user.verificationData?.postalCode,
      frontIdUrl: user.verificationData?.frontIdUrl,
      backIdUrl: user.verificationData?.backIdUrl,
      status: user.verificationStatus,
      submittedAt: user.verificationData?.submittedAt,
      reviewedAt: user.verificationData?.reviewedAt,
      reviewedBy: user.verificationData?.reviewedBy,
      rejectionReason: user.verificationData?.rejectionReason,
      role: user.role
    }));

    return NextResponse.json({
      success: true,
      verifications: verifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error: any) {
    console.error('Error fetching verification requests:', error);
    
    // Return empty array for now until your colleague's backend is ready
    return NextResponse.json({
      success: true,
      verifications: [],
      pagination: {
        page: 1,
        limit: 50,
        total: 0,
        totalPages: 0
      }
    });
  }
}
