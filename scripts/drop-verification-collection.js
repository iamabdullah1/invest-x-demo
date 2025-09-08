// Script to safely drop the old investor_verifications collection
// Run this with: node scripts/drop-verification-collection.js

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function dropVerificationCollection() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('🔌 Connected to MongoDB Atlas');
    
    const db = client.db('investx');
    
    // Check if the collection exists
    const collections = await db.listCollections({ name: 'investor_verifications' }).toArray();
    
    if (collections.length === 0) {
      console.log('✅ investor_verifications collection does not exist');
      return;
    }
    
    // Show current status
    const verificationCollection = db.collection('investor_verifications');
    const count = await verificationCollection.countDocuments();
    console.log(`📊 investor_verifications collection contains ${count} documents`);
    
    // Drop the collection
    console.log('🗑️  Dropping investor_verifications collection...');
    await verificationCollection.drop();
    
    console.log('✅ Successfully dropped investor_verifications collection');
    
    // Verify it's gone
    const remainingCollections = await db.listCollections().toArray();
    console.log('\n📋 Remaining collections:');
    remainingCollections.forEach(col => console.log(`  - ${col.name}`));
    
  } catch (error) {
    if (error.codeName === 'NamespaceNotFound') {
      console.log('✅ Collection was already deleted or does not exist');
    } else {
      console.error('❌ Error:', error);
    }
  } finally {
    await client.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

dropVerificationCollection();
