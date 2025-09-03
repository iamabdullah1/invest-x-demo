import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { seedUsers } from '@/lib/quickSeed';

export async function POST(request: NextRequest) {
  try {
    console.log('🔗 Connecting to database...');
    await connectDB();
    console.log('✅ Database connected');

    console.log('🌱 Starting seed process...');
    const users = await seedUsers();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database seeded successfully',
      usersCreated: users.length,
      users: users.map(u => ({ email: u.email, role: u.role }))
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to seed database',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'Use POST method to seed the database',
    endpoints: {
      POST: '/api/seed - Seeds the database with sample users'
    }
  }, { status: 200 });
}
