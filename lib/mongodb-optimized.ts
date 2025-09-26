import mongoose from 'mongoose';

/**
 * Optimized Database Connection Manager
 * Implements singleton pattern with connection pooling for better performance
 */
class DatabaseConnectionManager {
  private static instance: DatabaseConnectionManager;
  private isConnected: boolean = false;
  private connectionPromise: Promise<typeof mongoose> | null = null;

  private constructor() {}

  static getInstance(): DatabaseConnectionManager {
    if (!DatabaseConnectionManager.instance) {
      DatabaseConnectionManager.instance = new DatabaseConnectionManager();
    }
    return DatabaseConnectionManager.instance;
  }

  /**
   * Get optimized database connection with pooling
   * Eliminates repeated connection attempts
   */
  async getConnection(): Promise<typeof mongoose> {
    // Return existing connection if already connected
    if (this.isConnected && mongoose.connection.readyState === 1) {
      return mongoose;
    }

    // Return existing connection promise if in progress
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    // Create new connection with optimized settings
    this.connectionPromise = this.createConnection();
    
    try {
      const connection = await this.connectionPromise;
      this.isConnected = true;
      return connection;
    } catch (error) {
      this.connectionPromise = null;
      throw error;
    }
  }

  private async createConnection(): Promise<typeof mongoose> {
    const MONGODB_URI = process.env.MONGODB_URI;
    
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }

    // Optimized connection options for performance
    const options = {
      bufferCommands: false,
      maxPoolSize: 10, // Maximum number of connections
      serverSelectionTimeoutMS: 5000, // How long to try selecting a server
      socketTimeoutMS: 45000, // How long a send or receive on a socket can take
      family: 4, // Use IPv4
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      retryWrites: true,
    };

    console.log('🔌 Establishing optimized database connection...');
    
    try {
      await mongoose.connect(MONGODB_URI, options);
      console.log('✅ Database connected successfully with connection pooling');
      
      // Set up connection event listeners
      mongoose.connection.on('error', (error) => {
        console.error('❌ Database connection error:', error);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        console.log('🔌 Database disconnected');
        this.isConnected = false;
      });

      return mongoose;
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      this.isConnected = false;
      throw error;
    }
  }

  /**
   * Check if database is connected
   */
  isConnectionActive(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }

  /**
   * Get connection status for debugging
   */
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      name: mongoose.connection.name,
    };
  }
}

// Export singleton instance
export const dbManager = DatabaseConnectionManager.getInstance();

/**
 * Optimized connect function - replaces the old connectDB
 * Uses connection pooling and eliminates repeated connections
 */
export default async function connectDB() {
  return await dbManager.getConnection();
}
