// Simple script to test database seeding
const { DatabaseService } = require('./database');

async function quickSeed() {
  try {
    // Connect to database
    await DatabaseService.connect();
    console.log('Connected to MongoDB');

    // Create admin user
    const adminUser = await DatabaseService.createUser({
      name: 'Sarah Khan',
      email: 'sarah@investx.com',
      password: 'admin123',
      role: 'admin',
      isVerified: true,
      profileImage: '/professional-pakistani-woman.png'
    });
    console.log('Created admin user:', adminUser.email);

    // Create investor user
    const investorUser = await DatabaseService.createUser({
      name: 'Ahmed Ali',
      email: 'ahmed@example.com',
      password: 'investor123',
      role: 'investor',
      isVerified: true,
      profileImage: '/professional-pakistani-man.png'
    });
    console.log('Created investor user:', investorUser.email);

    console.log('Database seeding completed successfully!');
    console.log('Test credentials:');
    console.log('- Admin: sarah@investx.com / admin123');
    console.log('- Investor: ahmed@example.com / investor123');

  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    process.exit(0);
  }
}

module.exports = { quickSeed };

// Run if called directly
if (require.main === module) {
  quickSeed();
}
