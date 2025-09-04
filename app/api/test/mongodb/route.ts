import { NextRequest, NextResponse } from 'next/server';
import connectDB, { testConnection } from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET() {
  try {
    console.log('🔍 Starting MongoDB health check...');
    
    // Test 1: Basic connection
    console.log('Test 1: Basic connection');
    const isConnected = await testConnection();
    
    // Test 2: Connection state
    console.log('Test 2: Connection state');
    await connectDB();
    const connectionState = mongoose.connection.readyState;
    const stateNames = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    
    // Test 3: Database info
    console.log('Test 3: Database info');
    const dbName = mongoose.connection.db?.databaseName;
    
    // Test 4: Simple query
    console.log('Test 4: Simple query test');
    let queryTest = false;
    try {
      const collections = await mongoose.connection.db?.listCollections().toArray();
      queryTest = true;
      console.log('Available collections:', collections?.map(c => c.name));
    } catch (queryError) {
      console.error('Query test failed:', queryError);
    }
    
    const results = {
      success: true,
      timestamp: new Date().toISOString(),
      tests: {
        connectionTest: isConnected,
        connectionState: stateNames[connectionState] || 'unknown',
        databaseName: dbName || 'unknown',
        queryTest: queryTest
      },
      mongooseVersion: mongoose.version,
      nodeVersion: process.version
    };
    
    console.log('✅ MongoDB health check results:', results);
    
    return NextResponse.json(results);
    
  } catch (error: any) {
    console.error('❌ MongoDB health check failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
