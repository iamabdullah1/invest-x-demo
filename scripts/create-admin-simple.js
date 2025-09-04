// Create Admin User Script (CommonJS)
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// User Schema (simplified for this script)
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: String,
  password: String,
  role: { type: String, enum: ['guest', 'investor', 'admin'], default: 'guest' },
  isEmailVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  city: String,
  avatar: String,
  totalInvested: { type: Number, default: 0 },
  portfolioValue: { type: Number, default: 0 },
  joinDate: { type: Date, default: Date.now }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function createAdminUser() {
  try {
    console.log('🔐 Creating admin user...');
    
    // Connect to MongoDB
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
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
      console.log('   Created:', existingAdmin.createdAt);
      await mongoose.disconnect();
      return;
    }
    
    // Create admin user
    const adminUser = new User(adminData);
    await adminUser.save();
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', adminData.email);
    console.log('🔑 Password:', 'AdminPass123!');
    console.log('👑 Role:', adminData.role);
    console.log('🆔 User ID:', adminUser._id);
    console.log('');
    console.log('🎯 You can now login with these credentials at:');
    console.log('   http://localhost:3002/auth/login');
    console.log('');
    console.log('🔍 To view in MongoDB Atlas:');
    console.log('   1. Go to https://cloud.mongodb.com/');
    console.log('   2. Browse Collections → investx → users');
    console.log('   3. Look for the admin user with role: "admin"');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
createAdminUser();
