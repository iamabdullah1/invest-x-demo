// Database index optimization script
// Run this to ensure all performance indexes are created

import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI!;

interface IndexDefinition {
  collection: string;
  index: any;
  options?: any;
}

const PERFORMANCE_INDEXES: IndexDefinition[] = [
  // User collection indexes
  {
    collection: 'users',
    index: { email: 1 },
    options: { unique: true, background: true }
  },
  {
    collection: 'users',
    index: { role: 1, isActive: 1 },
    options: { background: true }
  },
  {
    collection: 'users',
    index: { verificationStatus: 1, 'verificationData.submittedAt': -1 },
    options: { background: true }
  },
  {
    collection: 'users',
    index: { 'refreshTokens.token': 1 },
    options: { background: true, sparse: true }
  },

  // Project collection compound indexes
  {
    collection: 'projects',
    index: { status: 1, featured: 1, createdAt: -1 },
    options: { background: true }
  },
  {
    collection: 'projects',
    index: { status: 1, city: 1, type: 1 },
    options: { background: true }
  },
  {
    collection: 'projects',
    index: { status: 1, fundingDeadline: 1 },
    options: { background: true }
  },
  {
    collection: 'projects',
    index: { slug: 1 },
    options: { unique: true, background: true }
  },
  
  // Text search index for projects
  {
    collection: 'projects',
    index: { 
      title: 'text', 
      location: 'text', 
      'developer.name': 'text',
      description: 'text'
    },
    options: { background: true }
  },

  // Transaction collection indexes
  {
    collection: 'transactions',
    index: { userId: 1, status: 1, createdAt: -1 },
    options: { background: true }
  },
  {
    collection: 'transactions',
    index: { projectId: 1, status: 1 },
    options: { background: true }
  },
  {
    collection: 'transactions',
    index: { type: 1, category: 1, createdAt: -1 },
    options: { background: true }
  },

  // Investment collection indexes (if exists)
  {
    collection: 'investments',
    index: { userId: 1, projectId: 1 },
    options: { background: true }
  },
  {
    collection: 'investments',
    index: { projectId: 1, status: 1, createdAt: -1 },
    options: { background: true }
  },

  // Notification collection indexes (if exists)
  {
    collection: 'notifications',
    index: { userId: 1, read: 1, createdAt: -1 },
    options: { background: true }
  }
];

export async function createPerformanceIndexes(): Promise<void> {
  let client: MongoClient | null = null;

  try {
    console.log('🚀 Starting database index optimization...');
    
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db();
    
    for (const indexDef of PERFORMANCE_INDEXES) {
      try {
        const collection = db.collection(indexDef.collection);
        
        // Check if collection exists
        const collections = await db.listCollections({ name: indexDef.collection }).toArray();
        if (collections.length === 0) {
          console.log(`⚠️  Collection '${indexDef.collection}' does not exist, skipping...`);
          continue;
        }

        // Create index
        console.log(`📈 Creating index on ${indexDef.collection}:`, indexDef.index);
        await collection.createIndex(indexDef.index, indexDef.options || {});
        console.log(`✅ Index created successfully`);
        
      } catch (error: any) {
        if (error.code === 11000 || error.message.includes('already exists')) {
          console.log(`ℹ️  Index already exists on ${indexDef.collection}`);
        } else {
          console.error(`❌ Error creating index on ${indexDef.collection}:`, error.message);
        }
      }
    }

    console.log('🎉 Database index optimization completed!');
    
  } catch (error) {
    console.error('❌ Database index optimization failed:', error);
    throw error;
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Analysis function to check existing indexes
export async function analyzeIndexes(): Promise<any> {
  let client: MongoClient | null = null;

  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db();
    const analysis: any = {};

    const collections = ['users', 'projects', 'transactions'];
    
    for (const collectionName of collections) {
      try {
        const collection = db.collection(collectionName);
        const indexes = await collection.listIndexes().toArray();
        
        analysis[collectionName] = {
          indexCount: indexes.length,
          indexes: indexes.map(idx => ({
            name: idx.name,
            keys: idx.key,
            unique: idx.unique || false,
            sparse: idx.sparse || false
          }))
        };
        
        // Get collection stats
        const stats = await db.command({ collStats: collectionName });
        analysis[collectionName].stats = {
          count: stats.count,
          size: stats.size,
          avgObjSize: stats.avgObjSize,
          indexSizes: stats.indexSizes
        };
        
      } catch (error) {
        analysis[collectionName] = { error: 'Collection does not exist or access denied' };
      }
    }

    return analysis;
    
  } catch (error) {
    console.error('Error analyzing indexes:', error);
    throw error;
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Query performance testing
export async function testQueryPerformance(): Promise<any> {
  let client: MongoClient | null = null;

  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db();
    const results: any = {};

    // Test common queries
    const queries = [
      {
        name: 'User by email',
        collection: 'users',
        query: { email: 'test@example.com' }
      },
      {
        name: 'Active projects',
        collection: 'projects',
        query: { status: 'active' }
      },
      {
        name: 'Featured projects in city',
        collection: 'projects',
        query: { status: 'active', featured: true, city: 'karachi' }
      },
      {
        name: 'Pending verifications',
        collection: 'users',
        query: { verificationStatus: 'pending' }
      }
    ];

    for (const queryTest of queries) {
      try {
        const collection = db.collection(queryTest.collection);
        
        const startTime = Date.now();
        const result = await collection.find(queryTest.query).limit(10).toArray();
        const endTime = Date.now();
        
        results[queryTest.name] = {
          executionTime: endTime - startTime,
          resultCount: result.length,
          query: queryTest.query
        };
        
      } catch (error) {
        results[queryTest.name] = { error: error.message };
      }
    }

    return results;
    
  } catch (error) {
    console.error('Error testing query performance:', error);
    throw error;
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Self-executing function for script usage
if (require.main === module) {
  createPerformanceIndexes()
    .then(() => {
      console.log('Index optimization script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Index optimization script failed:', error);
      process.exit(1);
    });
}
