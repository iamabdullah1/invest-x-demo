import { NextRequest, NextResponse } from 'next/server';
import DatabaseSeeder from '@/lib/seeder';

export async function POST(request: NextRequest) {
  try {
    // Only allow seeding in development mode
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Database seeding is not allowed in production' },
        { status: 403 }
      );
    }

    console.log('🚀 Starting database seeding...');
    const result = await DatabaseSeeder.seedAll();

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      data: {
        users: result.users.length,
        projects: result.projects.length,
        investments: result.investments.length,
        transactions: result.transactions.length
      }
    });
  } catch (error: any) {
    console.error('❌ Database seeding failed:', error);
    return NextResponse.json(
      { 
        error: 'Database seeding failed',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
