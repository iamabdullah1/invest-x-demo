// Simple script to test database seeding
import { DatabaseService } from './database';
import InventoryCategory from './models/InventoryCategory';

async function seedUsers() {
  try {
    console.log('🚀 Starting database seeding...');
    
    // Create admin user
    const adminUser = {
      firstName: 'Sarah',
      lastName: 'Ali',
      email: 'sarah@investx.com',
      phone: '+923009876543',
      password: 'admin123', // Plain text - let the model hash it
      role: 'admin' as const,
      isEmailVerified: true,
      city: 'Lahore',
      cnicNumber: '35202-7654321-2',
      avatar: '/professional-pakistani-woman.png',
      isActive: true
    };

    // Create investor users
    const investorUsers = [
      {
        firstName: 'Ahmed',
        lastName: 'Khan',
        email: 'ahmed@example.com',
        phone: '+923001234567',
        password: 'investor123', // Plain text - let the model hash it
        role: 'investor' as const,
        isEmailVerified: true,
        city: 'Karachi',
        cnicNumber: '42101-1234567-1',
        totalInvested: 2500000,
        portfolioValue: 2750000,
        avatar: '/professional-pakistani-man.png',
        isActive: true
      },
      {
        firstName: 'Hassan',
        lastName: 'Sheikh',
        email: 'hassan@example.com',
        phone: '+923001111111',
        password: 'investor456', // Plain text - let the model hash it
        role: 'investor' as const,
        isEmailVerified: true,
        city: 'Islamabad',
        totalInvested: 1500000,
        portfolioValue: 1680000,
        isActive: true
      },
      {
        firstName: 'Fatima',
        lastName: 'Malik',
        email: 'fatima@example.com',
        phone: '+923002222222',
        password: 'investor789', // Plain text - let the model hash it
        role: 'investor' as const,
        isEmailVerified: true,
        city: 'Rawalpindi',
        totalInvested: 3200000,
        portfolioValue: 3520000,
        isActive: true
      }
    ];

    const allUsers = [adminUser, ...investorUsers];
    const createdUsers = [];

    for (const userData of allUsers) {
      try {
        // Check if user already exists
        const existingUser = await DatabaseService.findUserByEmail(userData.email);
        if (!existingUser) {
          const user = await DatabaseService.createUser(userData);
          createdUsers.push(user);
          console.log(`✅ Created user: ${user.email} (${user.role})`);
        } else {
          console.log(`⏭️  User already exists: ${userData.email}`);
          createdUsers.push(existingUser);
        }
      } catch (error) {
        console.error(`❌ Error creating user ${userData.email}:`, error);
      }
    }

    console.log('\n✅ Database seeding completed!');
    console.log(`📊 Created ${createdUsers.length} users:`);
    console.log(`   👤 Admin: sarah@investx.com / admin123`);
    console.log(`   👤 Investor: ahmed@example.com / investor123`);
    console.log(`   👤 Investor: hassan@example.com / investor456`);
    console.log(`   👤 Investor: fatima@example.com / investor789`);

    return createdUsers;
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
}

// Export for use in API route
export { seedUsers };
