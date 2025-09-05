import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { User } from '@/models';
import connectDB from '@/lib/mongodb';
import JWTAuthService from '@/lib/jwtAuth';

export async function POST(request: NextRequest) {
  try {
    const { action, email, password } = await request.json();
    
    console.log(`🔍 DEBUG API Called - Action: ${action}`);
    
    // Test database connection
    if (action === 'test-db') {
      try {
        const startTime = Date.now();
        await connectDB();
        const endTime = Date.now();
        console.log(`✅ Database connection successful in ${endTime - startTime}ms`);
        return NextResponse.json({ 
          success: true, 
          message: 'Database connection successful',
          connectionTime: `${endTime - startTime}ms`,
          timestamp: new Date().toISOString()
        });
      } catch (error: any) {
        console.error('❌ Database connection failed:', error);
        return NextResponse.json({ 
          success: false, 
          error: 'Database connection failed',
          details: error?.message || 'Unknown error'
        });
      }
    }
    
    // Test password hashing
    if (action === 'test-hash') {
      const testPassword = password || 'test123';
      console.log(`🔐 Testing password hashing for: ${testPassword}`);
      
      const saltRounds = 10;
      const hash1 = await bcrypt.hash(testPassword, saltRounds);
      const hash2 = await bcrypt.hash(testPassword, saltRounds);
      
      const compare1 = await bcrypt.compare(testPassword, hash1);
      const compare2 = await bcrypt.compare(testPassword, hash2);
      const crossCompare = await bcrypt.compare(testPassword, hash1);
      
      console.log(`🔐 Hash 1: ${hash1}`);
      console.log(`🔐 Hash 2: ${hash2}`);
      console.log(`🔐 Compare results: ${compare1}, ${compare2}, ${crossCompare}`);
      
      return NextResponse.json({
        success: true,
        testPassword,
        saltRounds,
        hash1: hash1.substring(0, 20) + '...',
        hash2: hash2.substring(0, 20) + '...',
        compareResults: { compare1, compare2, crossCompare },
        hashesAreDifferent: hash1 !== hash2,
        allComparisonsWork: compare1 && compare2 && crossCompare
      });
    }
    
    // Create a test user
    if (action === 'create-test-user') {
      await connectDB();
      
      const testEmail = email || 'test@debug.com';
      const testPassword = password || 'password123';
      
      console.log(`👤 Creating test user: ${testEmail}`);
      
      // Delete existing test user
      await User.deleteOne({ email: testEmail });
      console.log(`🗑️ Deleted existing user: ${testEmail}`);
      
      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(testPassword, saltRounds);
      console.log(`🔐 Password hashed with saltRounds: ${saltRounds}`);
      console.log(`🔐 Original password: ${testPassword}`);
      console.log(`🔐 Hashed password: ${hashedPassword}`);
      
      // Create user
      const newUser = new User({
        firstName: 'Debug',
        lastName: 'User',
        email: testEmail,
        password: hashedPassword,
        role: 'guest',
        isEmailVerified: true,
        isActive: true
      });
      
      const savedUser = await newUser.save();
      console.log(`✅ User saved with ID: ${savedUser._id}`);
      
      // Immediately test password comparison
      const immediateTest = await bcrypt.compare(testPassword, hashedPassword);
      console.log(`🔍 Immediate password test: ${immediateTest}`);
      
      return NextResponse.json({
        success: true,
        message: 'Test user created successfully',
        user: {
          id: savedUser._id,
          email: savedUser.email,
          role: savedUser.role
        },
        passwordTest: {
          original: testPassword,
          hashLength: hashedPassword.length,
          hashPrefix: hashedPassword.substring(0, 10),
          immediateComparison: immediateTest
        }
      });
    }
    
    // Test login with the created user
    if (action === 'test-login') {
      await connectDB();
      
      const testEmail = email || 'test@debug.com';
      const testPassword = password || 'password123';
      
      console.log(`🔍 Testing login for: ${testEmail}`);
      
      // Find user
      const user = await User.findOne({ email: testEmail }).select('+password');
      
      if (!user) {
        console.log(`❌ User not found: ${testEmail}`);
        return NextResponse.json({
          success: false,
          error: 'User not found',
          searchedEmail: testEmail
        });
      }
      
      console.log(`👤 User found: ${user.email}`);
      console.log(`🔐 Stored password hash: ${user.password}`);
      console.log(`🔐 Provided password: ${testPassword}`);
      
      // Test password comparison
      const isValid = await bcrypt.compare(testPassword, user.password);
      console.log(`🔍 Password comparison result: ${isValid}`);
      
      return NextResponse.json({
        success: true,
        userFound: true,
        user: {
          id: user._id,
          email: user.email,
          role: user.role
        },
        passwordTest: {
          provided: testPassword,
          storedHashPrefix: user.password.substring(0, 10),
          isValid: isValid
        }
      });
    }
    
    // Check existing user in database
    if (action === 'check-user') {
      await connectDB();
      
      const checkEmail = email || 'mirza.abdullah.baig.15@gmail.com';
      console.log(`🔍 Checking user: ${checkEmail}`);
      
      const user = await User.findOne({ email: checkEmail }).select('+password');
      
      if (!user) {
        return NextResponse.json({
          success: false,
          message: 'User not found',
          searchedEmail: checkEmail
        });
      }
      
      return NextResponse.json({
        success: true,
        userFound: true,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isActive: user.isActive,
          isEmailVerified: user.isEmailVerified
        },
        passwordInfo: {
          hasPassword: !!user.password,
          hashLength: user.password?.length || 0,
          hashPrefix: user.password?.substring(0, 10) || 'N/A',
          hashFormat: user.password?.startsWith('$2') ? 'bcrypt' : 'unknown'
        }
      });
    }
    
    return NextResponse.json({
      error: 'Invalid action',
      availableActions: ['test-db', 'test-hash', 'create-test-user', 'test-login', 'check-user']
    });
    
  } catch (error: any) {
    console.error('❌ Debug API Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
