import mongoose from 'mongoose';

// MongoDB connection configuration for InvestX
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/investx';

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
declare global {
  var mongoose: {
    conn: mongoose.Mongoose | null;
    promise: Promise<mongoose.Mongoose> | null;
  };
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn && mongoose.connection.readyState === 1) {
    console.log('🔄 Using existing MongoDB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 30000, // 30 seconds
      socketTimeoutMS: 60000, // 60 seconds
      connectTimeoutMS: 60000, // 60 seconds
      maxPoolSize: 50, // Increase pool size
      minPoolSize: 5, // Increase minimum connections
      heartbeatFrequencyMS: 10000, // Check connection every 10 seconds
      retryWrites: true,
      authSource: 'admin', // Specify auth source
      ssl: true, // Ensure SSL
    };

    console.log('🔄 Attempting to connect to MongoDB Atlas...');
    console.log('🔗 Connection URI:', MONGODB_URI ? 'Set' : 'Missing');
    
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ Connected to MongoDB successfully');
      console.log('📊 Database:', mongoose.connection.db?.databaseName);
      console.log('🔗 Connection state:', mongoose.connection.readyState);
      
      // Set up connection event listeners
      mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB connection error:', err);
      });
      
      mongoose.connection.on('disconnected', () => {
        console.log('🔌 MongoDB disconnected');
        cached.conn = null;
        cached.promise = null;
      });
      
      return mongoose;
    }).catch((error) => {
      console.error('❌ MongoDB connection failed:', error.message);
      console.error('🔍 Error details:', error);
      cached.promise = null; // Reset promise so it can be retried
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('❌ MongoDB connection error:', e);
    throw e;
  }

  return cached.conn;
}

/**
 * Test MongoDB connection health
 */
export async function testConnection(): Promise<boolean> {
  try {
    await connectDB();
    
    // Test with a simple ping
    const adminDb = mongoose.connection.db?.admin();
    if (adminDb) {
      await adminDb.ping();
      console.log('🏓 MongoDB ping successful');
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ MongoDB connection test failed:', error);
    return false;
  }
}

export default connectDB;
