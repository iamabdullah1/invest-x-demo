import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User } from '@/models';

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    await connectDB();
    
    // Test a simple query
    const userCount = await User.countDocuments();
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: {
        connected: true,
        userCount: userCount,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error('❌ Database connection failed:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Database connection failed',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
