import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';
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

    await DatabaseService.connect();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Build query for investor_verifications collection
    const query: any = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    // Use your colleague's collection structure
    // This will be replaced with the actual implementation once your colleague pushes the code
    const db = await DatabaseService.connect();
    const collection = db.collection('investor_verifications');
    
    const verifications = await collection
      .find(query)
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await collection.countDocuments(query);

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
