import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/models';
import connectDB from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Get all users (without passwords)
    const users = await User.find({}).select('-password');
    
    // Check cart data for debugging
    const usersWithCart = await User.find({ 'cart.0': { $exists: true } }).select('email cart');
    const cartDebug = usersWithCart.map(user => ({
      email: user.email,
      cartItems: user.cart.map((item: any, index: number) => ({
        index,
        inventoryId: item.inventoryId,
        inventoryIdType: typeof item.inventoryId,
        amount: item.amount,
        sqft: item.sqft,
        hasAllFields: !!(item.inventoryId && item.amount && item.sqft)
      }))
    }));
    
    return NextResponse.json({
      success: true,
      count: users.length,
      cartDebug,
      users: users.map(user => ({
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isActive: user.isActive,
        hasPassword: user.password ? true : false // Check if password exists
      }))
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Clean up invalid cart items
    const usersWithCart = await User.find({ 'cart.0': { $exists: true } });
    let cleanedCount = 0;
    
    for (const user of usersWithCart) {
      const originalLength = user.cart.length;
      user.cart = user.cart.filter((item: any) => 
        item.inventoryId && 
        typeof item.inventoryId === 'string' && 
        item.inventoryId.trim() !== '' &&
        item.amount && 
        item.sqft
      );
      
      if (user.cart.length !== originalLength) {
        await user.save();
        cleanedCount++;
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Cleaned cart data for ${cleanedCount} users`
    });

  } catch (error) {
    console.error('Error cleaning cart data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clean cart data' },
      { status: 500 }
    );
  }
}
