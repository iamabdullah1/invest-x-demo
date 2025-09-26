// Script to safely remove the old investor_verifications collection
// Run this with: node scripts/cleanup-verification-collection.js

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function cleanupVerificationCollection() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas');
    
    const db = client.db('investx');
    
    // First, let's see what collections exist
    const collections = await db.listCollections().toArray();
    console.log('\n📋 Current collections:');
    collections.forEach(col => console.log(`  - ${col.name}`));
    
    // Check if investor_verifications collection exists
    const verificationCollection = db.collection('investor_verifications');
    const count = await verificationCollection.countDocuments();
    
    console.log(`\n📊 investor_verifications collection contains ${count} documents`);
    
    if (count > 0) {
      console.log('\n⚠️  Found data in investor_verifications collection');
      console.log('🔍 Sample documents:');
      
      // Show first few documents
      const samples = await verificationCollection.find({}).limit(3).toArray();
      samples.forEach((doc, index) => {
        console.log(`\n  Document ${index + 1}:`);
        console.log(`    Email: ${doc.email}`);
        console.log(`    Status: ${doc.status}`);
        console.log(`    Submitted: ${doc.submittedAt}`);
        console.log(`    ID: ${doc._id}`);
      });
      
      console.log('\n❓ Do you want to proceed with deletion? (This script will NOT auto-delete)');
      console.log('💡 To delete manually, run:');
      console.log('   db.investor_verifications.drop()');
    } else {
      console.log('\n✅ Collection is empty, safe to delete');
      console.log('💡 To delete, run:');
      console.log('   db.investor_verifications.drop()');
    }
    
    // Also check if there are any references to this collection in the codebase
    console.log('\n🔍 Note: Make sure to also remove any remaining references in code files');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

cleanupVerificationCollection();
