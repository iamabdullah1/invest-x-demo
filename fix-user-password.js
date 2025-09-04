const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

// User Schema
const UserSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: { type: String, select: false },
  role: String,
  isEmailVerified: Boolean,
  isActive: Boolean,
}, {
  timestamps: true
});

const User = mongoose.model('User', UserSchema);

async function fixUserPassword() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const email = 'mirza.abdullah.baig.15@gmail.com';
    const newPassword = '123456789';

    // Find the user
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      console.log('❌ User not found:', email);
      await mongoose.disconnect();
      return;
    }

    console.log('👤 Found user:', user.email);
    console.log('Current password hash preview:', user.password ? user.password.substring(0, 20) + '...' : 'No password');

    // Hash the new password
    console.log('🔒 Hashing new password...');
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Test the new hash immediately
    const testComparison = await bcrypt.compare(newPassword, hashedPassword);
    console.log('✅ New hash test successful:', testComparison);

    // Update the user's password
    user.password = hashedPassword;
    user.firstName = 'Mirza Abdullah';
    user.lastName = 'Baig';
    
    await user.save();
    
    console.log('✅ Password updated successfully!');
    console.log('📧 Email:', user.email);
    console.log('👤 Name updated to:', user.firstName, user.lastName);
    console.log('🔑 New password hash:', hashedPassword.substring(0, 20) + '...');

    // Final test - simulate login
    console.log('\n🧪 Testing login simulation...');
    const loginTest = await bcrypt.compare(newPassword, user.password);
    console.log('✅ Login test result:', loginTest);

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    
    if (loginTest) {
      console.log('\n🎉 SUCCESS! You should now be able to login with:');
      console.log('   Email: mirza.abdullah.baig.15@gmail.com');
      console.log('   Password: 123456789');
    } else {
      console.log('\n❌ Something is still wrong with the password');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixUserPassword();
