// Create Admin User Script
import bcrypt from 'bcryptjs';
import connectDB from '../lib/mongodb.js';
import { User } from '../models/index.js';

async function createAdminUser() {
  try {
    console.log('🔐 Creating admin user...');
    
    // Connect to database
    await connectDB();
    console.log('✅ Connected to MongoDB');
    
    // Admin user details - customize these as needed
    const adminData = {
      firstName: 'Abdullah',
      lastName: 'Admin',
      email: 'abdullah@investx.com', // Change this to your preferred admin email
      phone: '+923001234567',
      password: await bcrypt.hash('AdminPass123!', 12), // Strong password
      role: 'admin',
      isEmailVerified: true,
      isActive: true,
      city: 'Karachi',
      avatar: '/professional-pakistani-man.png',
      totalInvested: 0,
      portfolioValue: 0
    };
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists with email:', adminData.email);
      console.log('👤 Existing admin details:');
      console.log('   Name:', existingAdmin.firstName, existingAdmin.lastName);
      console.log('   Email:', existingAdmin.email);
      console.log('   Role:', existingAdmin.role);
      return;
    }
    
    // Create admin user
    const adminUser = new User(adminData);
    await adminUser.save();
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', adminData.email);
    console.log('🔑 Password:', 'AdminPass123!');
    console.log('👑 Role:', adminData.role);
    console.log('');
    console.log('🎯 You can now login with these credentials at:');
    console.log('   http://localhost:3002/auth/login');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    process.exit(0);
  }
}

createAdminUser();
