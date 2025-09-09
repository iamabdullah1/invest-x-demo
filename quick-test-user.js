// Quick script to create a test user with rejection reason
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

async function createTestRejectedUser() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('investx');
    const usersCollection = db.collection('users');
    
    const hashedPassword = await bcrypt.hash('test123', 12);
    
    const testUser = {
      firstName: 'Test',
      lastName: 'Rejected',
      email: 'test.rejection@example.com',
      password: hashedPassword,
      role: 'guest',
      verificationStatus: 'rejected',
      verificationData: {
        rejectionReason: 'ID card image is blurry and signature is not clear.',
        reviewedBy: 'admin',
        reviewedAt: new Date().toISOString()
      },
      isEmailVerified: true,
      totalInvested: 0,
      portfolioValue: 0,
      joinDate: new Date().toISOString(),
      notifications: { email: true, sms: false, push: true },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await usersCollection.replaceOne(
      { email: testUser.email },
      testUser,
      { upsert: true }
    );
    
    console.log('✅ Test user created!');
    console.log('📧 Email: test.rejection@example.com');
    console.log('🔑 Password: test123');
    console.log('❌ Status: rejected');
    console.log('💬 Reason: ID card image is blurry and signature is not clear.');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

createTestRejectedUser();
