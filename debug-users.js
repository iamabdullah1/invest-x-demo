// Debug script to check user data in database
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  role: String,
  isActive: Boolean,
  isEmailVerified: Boolean
});

const User = mongoose.model('User', UserSchema);

async function checkUsers() {
  try {
    const MONGODB_URI = 'mongodb+srv://abdullah:8Av4h0A2KjL1WGpD@cluster0.a8knb.mongodb.net/?retryWrites=true&w=majority';
    
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const users = await User.find({}).select('+password');
    console.log('Found', users.length, 'users in database:');
    
    users.forEach((user, index) => {
      console.log(`\n--- User ${index + 1} ---`);
      console.log('Email:', user.email);
      console.log('Name:', user.firstName, user.lastName);
      console.log('Role:', user.role);
      console.log('Active:', user.isActive);
      console.log('Email Verified:', user.isEmailVerified);
      console.log('Has Password:', user.password ? 'Yes' : 'No');
      if (user.password) {
        console.log('Password Length:', user.password.length);
        console.log('Password Hash Preview:', user.password.substring(0, 20) + '...');
        console.log('Is BCrypt Hash:', user.password.startsWith('$2'));
      }
    });
    
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkUsers();
