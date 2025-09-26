// Script to check the investorverifications collection (without underscore)
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function checkOtherCollection() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('🔌 Connected to MongoDB Atlas');
    
    const db = client.db('investx');
    const collection = db.collection('investorverifications');
    const count = await collection.countDocuments();
    
    console.log(`📊 investorverifications collection contains ${count} documents`);
    
    if (count > 0) {
      const samples = await collection.find({}).limit(3).toArray();
      console.log('\n🔍 Sample documents:');
      samples.forEach((doc, index) => {
        console.log(`\n  Document ${index + 1}:`);
        console.log(`    Keys: ${Object.keys(doc).join(', ')}`);
        if (doc.email) console.log(`    Email: ${doc.email}`);
        if (doc.status) console.log(`    Status: ${doc.status}`);
        if (doc.submittedAt) console.log(`    Submitted: ${doc.submittedAt}`);
        console.log(`    ID: ${doc._id}`);
      });
      
      console.log('\n💡 If this is also old data, run:');
      console.log('   db.investorverifications.drop()');
    } else {
      console.log('✅ Collection is empty');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

checkOtherCollection();
