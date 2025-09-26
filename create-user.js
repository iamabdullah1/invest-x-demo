const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

// User Schema
const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['guest', 'investor', 'admin'], default: 'guest' },
  isEmailVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  avatar: { type: String, default: '' },
  city: { type: String, default: '' },
  totalInvested: { type: Number, default: 0 },
  portfolioValue: { type: Number, default: 0 },
  joinDate: { type: Date, default: Date.now },
  lastLogin: { type: Date },
}, {
  timestamps: true
});

const User = mongoose.model('User', UserSchema);

async function createUser() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    console.log('📊 Database:', mongoose.connection.db?.databaseName);

    const email = 'mirza.abdullah.baig.15@gmail.com';
    const password = '123456789';

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log('❌ User already exists:', email);
      console.log('User details:');
      console.log('- Name:', existingUser.firstName, existingUser.lastName);
      console.log('- Role:', existingUser.role);
      console.log('- Active:', existingUser.isActive);
      console.log('- Email Verified:', existingUser.isEmailVerified);
      await mongoose.disconnect();
      return;
    }

    // Hash password
    console.log('🔒 Hashing password...');
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('✅ Password hashed successfully');

    // Create user
    console.log('👤 Creating user...');
    const newUser = new User({
      firstName: 'Mirza Abdullah',
      lastName: 'Baig',
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'guest',
      isEmailVerified: true,
      isActive: true
    });

    const savedUser = await newUser.save();
    console.log('✅ User created successfully!');
    console.log('User details:');
    console.log('- ID:', savedUser._id);
    console.log('- Email:', savedUser.email);
    console.log('- Name:', savedUser.firstName, savedUser.lastName);
    console.log('- Role:', savedUser.role);
    console.log('- Active:', savedUser.isActive);
    console.log('- Email Verified:', savedUser.isEmailVerified);

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    console.log('🎉 You can now login with:');
    console.log('   Email:', email);
    console.log('   Password:', password);

  } catch (error) {
    console.error('❌ Error creating user:', error.message);
    if (error.code === 11000) {
      console.log('User with this email already exists');
    }
  }
}

createUser();
