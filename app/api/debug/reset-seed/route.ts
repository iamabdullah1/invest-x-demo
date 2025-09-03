import { NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';
import User from '@/models/User';

export async function POST() {
  try {
    // Connect to database once
    await DatabaseService.connect();
    console.log('Connected to MongoDB');

    // Delete all existing users
    const deleteResult = await User.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} existing users`);

    // Create admin user with plain text password
    const adminUser = await DatabaseService.createUser({
      firstName: 'Sarah',
      lastName: 'Khan',
      email: 'sarah@investx.com',
      password: 'admin123', // This will be hashed by the User model pre-save hook
      role: 'admin' as const,
      isEmailVerified: true,
      avatar: '/professional-pakistani-woman.png'
    });
    console.log('Created admin user:', adminUser.email);

    // Create investor user with plain text password
    const investorUser = await DatabaseService.createUser({
      firstName: 'Ahmed',
      lastName: 'Ali',
      email: 'ahmed@example.com',
      password: 'investor123', // This will be hashed by the User model pre-save hook
      role: 'investor' as const,
      isEmailVerified: true,
      avatar: '/professional-pakistani-man.png'
    });
    console.log('Created investor user:', investorUser.email);

    return NextResponse.json({
      message: 'Database reset and seeded successfully!',
      deletedCount: deleteResult.deletedCount,
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
    console.error('Reset and seeding error:', error);
    return NextResponse.json(
      { error: 'Reset and seeding failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
