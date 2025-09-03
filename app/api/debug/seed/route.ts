import { NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';

export async function POST() {
  try {
    // Connect to database once
    await DatabaseService.connect();
    console.log('Connected to MongoDB');

    // Create admin user
    const adminUser = await DatabaseService.createUser({
      firstName: 'Sarah',
      lastName: 'Khan',
      email: 'sarah@investx.com',
      password: 'admin123',
      role: 'admin' as const,
      isEmailVerified: true,
      avatar: '/professional-pakistani-woman.png'
    });
    console.log('Created admin user:', adminUser.email);

    // Create investor user
    const investorUser = await DatabaseService.createUser({
      firstName: 'Ahmed',
      lastName: 'Ali',
      email: 'ahmed@example.com',
      password: 'investor123',
      role: 'investor' as const,
      isEmailVerified: true,
      avatar: '/professional-pakistani-man.png'
    });
    console.log('Created investor user:', investorUser.email);

    return NextResponse.json({
      message: 'Database seeding completed successfully!',
      users: [
        { email: adminUser.email, role: adminUser.role },
        { email: investorUser.email, role: investorUser.role }
      ],
      testCredentials: {
        admin: 'sarah@investx.com / admin123',
        investor: 'ahmed@example.com / investor123'
      }
    });

  } catch (error) {
    console.error('Seeding error:', error);
    return NextResponse.json(
      { error: 'Seeding failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
