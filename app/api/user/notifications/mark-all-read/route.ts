import { NextRequest, NextResponse } from 'next/server'
import User from '@/models/User'
import connectDB from '@/lib/mongodb'
import jwt from 'jsonwebtoken'

export async function PATCH(request: NextRequest) {
  try {
    await connectDB()

    // Get token from request
    const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
                  request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ success: false, message: 'No token provided' }, { status: 401 })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    
    // Mark all notifications as read
    await User.findByIdAndUpdate(
      decoded.userId,
      {
        $set: {
          'userNotifications.$[].isRead': true
        }
      }
    )

    return NextResponse.json({
      success: true,
      message: 'All notifications marked as read'
    })

  } catch (error: any) {
    console.error('Mark all notifications as read API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      }, 
      { status: 500 }
    )
  }
}