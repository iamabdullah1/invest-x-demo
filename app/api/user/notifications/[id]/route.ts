import { NextRequest, NextResponse } from 'next/server'
import User from '@/models/User'
import connectDB from '@/lib/mongodb'
import jwt from 'jsonwebtoken'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
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
    
    const { id: notificationId } = params
    const body = await request.json()
    
    // Update specific notification
    await User.findOneAndUpdate(
      { 
        _id: decoded.userId,
        'userNotifications._id': notificationId
      },
      {
        $set: {
          'userNotifications.$.isRead': body.isRead
        }
      }
    )

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