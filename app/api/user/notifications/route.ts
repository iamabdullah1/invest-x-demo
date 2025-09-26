import { NextRequest, NextResponse } from 'next/server'
import User from '@/models/User'
import connectDB from '@/lib/mongodb'
import jwt from 'jsonwebtoken'

export async function GET(request: NextRequest) {
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
    
    // Find user with notifications
    const user = await User.findById(decoded.userId).select('userNotifications')
    
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    // Sort notifications by date (newest first)
    const notifications = (user.userNotifications || []).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    return NextResponse.json({
      success: true,
      notifications
    })

  } catch (error: any) {
    console.error('Notifications API error:', error)
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

// Mark notification as read
export async function PUT(request: NextRequest) {
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
    
    const { notificationId, markAsRead } = await request.json()

    if (!notificationId) {
      return NextResponse.json({ success: false, message: 'Notification ID is required' }, { status: 400 })
    }

    // Update notification read status
    const user = await User.findOneAndUpdate(
      { 
        _id: decoded.userId,
        'userNotifications._id': notificationId
      },
      {
        $set: {
          'userNotifications.$.read': markAsRead !== false
        }
      },
      { new: true }
    )

    if (!user) {
      return NextResponse.json({ success: false, message: 'Notification not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Notification updated successfully'
    })

  } catch (error: any) {
    console.error('Update notification API error:', error)
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

// Mark all notifications as read
export async function POST(request: NextRequest) {
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
          'userNotifications.$[].read': true
        }
      }
    )

    return NextResponse.json({
      success: true,
      message: 'All notifications marked as read'
    })

  } catch (error: any) {
    console.error('Mark all read API error:', error)
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
