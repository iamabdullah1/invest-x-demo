// Test MongoDB Atlas connection
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
  try {
    console.log('🔗 Testing MongoDB Atlas connection...');
    console.log('Connection URI:', process.env.MONGODB_URI ? 'Found' : 'Missing');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Atlas connection successful!');
    
    // Test creating a simple document
    const testSchema = new mongoose.Schema({ test: String });
    const TestModel = mongoose.model('Test', testSchema);
    
    const doc = new TestModel({ test: 'Connection test' });
    await doc.save();
    console.log('✅ Document creation test successful!');
    
    await TestModel.deleteOne({ test: 'Connection test' });
    console.log('✅ Document deletion test successful!');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:');
    console.error('Error:', error.message);
    if (error.code) console.error('Error Code:', error.code);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testConnection();
