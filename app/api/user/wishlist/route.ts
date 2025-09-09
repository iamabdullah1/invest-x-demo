import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { User, Project } from '@/models'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Get user's wishlist
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ 
        success: false, 
        message: 'Authentication required' 
      }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any
    const userId = decoded.userId

    await connectDB()
    
    // Get user's wishlist
    const user = await User.findById(userId).select('wishlist')

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: 'User not found' 
      }, { status: 404 })
    }

    const wishlistIds = user.wishlist || []

    // Get full project details for wishlist items
    const projects = await Project.find({ 
      _id: { $in: wishlistIds },
      status: { $in: ['active', 'funded'] }
    })

    return NextResponse.json({
      success: true,
      wishlist: projects
    })

  } catch (error) {
    console.error('Error fetching wishlist:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 })
  }
}

// Add project to wishlist
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ 
        success: false, 
        message: 'Authentication required' 
      }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any
    const userId = decoded.userId

    const { projectId } = await request.json()

    if (!projectId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Project ID is required' 
      }, { status: 400 })
    }

    await connectDB()

    // Check if project exists
    const project = await Project.findById(projectId)
    if (!project) {
      return NextResponse.json({ 
        success: false, 
        message: 'Project not found' 
      }, { status: 404 })
    }

    // Add to user's wishlist (using $addToSet to avoid duplicates)
    await User.findByIdAndUpdate(
      userId,
      { $addToSet: { wishlist: projectId } }
    )

    return NextResponse.json({
      success: true,
      message: 'Project added to wishlist'
    })

  } catch (error) {
    console.error('Error adding to wishlist:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 })
  }
}

// Remove project from wishlist
export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ 
        success: false, 
        message: 'Authentication required' 
      }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any
    const userId = decoded.userId

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Project ID is required' 
      }, { status: 400 })
    }

    await connectDB()

    // Remove from user's wishlist
    await User.findByIdAndUpdate(
      userId,
      { $pull: { wishlist: projectId } }
    )

    return NextResponse.json({
      success: true,
      message: 'Project removed from wishlist'
    })

  } catch (error) {
    console.error('Error removing from wishlist:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 })
  }
}
