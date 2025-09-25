import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { User, Project, InventoryCategory } from '@/models'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Get user's cart
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
    
    // Get user's cart
    const user = await User.findById(userId).select('cart')

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: 'User not found' 
      }, { status: 404 })
    }

    const cartItems = user.cart || []

    // Get full inventory details for cart items
    const inventoryIds = cartItems.map((item: any) => item.inventoryId).filter(Boolean)
    const inventories = await InventoryCategory.find({ 
      _id: { $in: inventoryIds }
    }).populate('projectId', 'title location city status')

    // Combine cart data with inventory details
    const enrichedCart = cartItems.map((item: any) => {
      const inventory = inventories.find(i => i._id.toString() === item.inventoryId)
      return {
        ...item,
        inventory: inventory || null,
        project: inventory?.projectId || null
      }
    }).filter((item: any) => item.inventory) // Remove items for inventory that no longer exist

    return NextResponse.json({
      success: true,
      cart: enrichedCart
    })

  } catch (error) {
    console.error('Error fetching cart:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 })
  }
}

// Add item to cart
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

    const { inventoryId, amount, sqft, pricePerSqFt } = await request.json()

    if (!inventoryId || !amount || amount <= 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'Inventory ID and valid amount are required' 
      }, { status: 400 })
    }

    await connectDB()

    // Check if inventory exists
    const inventory = await InventoryCategory.findById(inventoryId)
    if (!inventory) {
      return NextResponse.json({ 
        success: false, 
        message: 'Inventory item not found' 
      }, { status: 404 })
    }

    // Check if project is available for investment
    const project = await Project.findById(inventory.projectId)
    if (!project || !['active', 'funded'].includes(project.status)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Project is not available for investment' 
      }, { status: 400 })
    }

    // Check minimum investment
    const minAmount = inventory.minSquareFeet * inventory.pricePerSquareFoot
    if (amount < minAmount) {
      return NextResponse.json({ 
        success: false, 
        message: `Minimum investment is ${minAmount}` 
      }, { status: 400 })
    }

    // Check if requested area is available
    if (sqft && sqft > inventory.totalArea) {
      return NextResponse.json({ 
        success: false, 
        message: `Maximum available area is ${inventory.totalArea} sq ft` 
      }, { status: 400 })
    }

    // Get user's current cart
    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: 'User not found' 
      }, { status: 404 })
    }

    const cart = user.cart || []

    // Check if item already exists in cart
    const existingItemIndex = cart.findIndex((item: any) => item.inventoryId === inventoryId)
    
    if (existingItemIndex >= 0) {
      // Update existing item
      cart[existingItemIndex].amount = amount
      cart[existingItemIndex].sqft = sqft
      cart[existingItemIndex].pricePerSqFt = pricePerSqFt
      cart[existingItemIndex].addedAt = new Date()
    } else {
      // Add new item
      cart.push({
        inventoryId,
        amount,
        sqft,
        pricePerSqFt,
        addedAt: new Date()
      })
    }

    // Save updated cart
    await User.findByIdAndUpdate(userId, { cart })

    return NextResponse.json({
      success: true,
      message: existingItemIndex >= 0 ? 'Cart item updated' : 'Item added to cart'
    })

  } catch (error) {
    console.error('Error adding to cart:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 })
  }
}

// Update cart item
export async function PUT(request: NextRequest) {
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

    const { projectId, amount } = await request.json()

    if (!projectId || !amount || amount <= 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'Project ID and valid amount are required' 
      }, { status: 400 })
    }

    await connectDB()

    // Update cart item
    const result = await User.findOneAndUpdate(
      { 
        _id: userId,
        'cart.projectId': projectId 
      },
      { 
        $set: { 
          'cart.$.amount': amount,
          'cart.$.addedAt': new Date()
        }
      },
      { new: true }
    )

    if (!result) {
      return NextResponse.json({ 
        success: false, 
        message: 'Cart item not found' 
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Cart item updated'
    })

  } catch (error) {
    console.error('Error updating cart:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 })
  }
}

// Remove item from cart
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

    // Remove from user's cart
    await User.findByIdAndUpdate(
      userId,
      { $pull: { cart: { projectId: projectId } } }
    )

    return NextResponse.json({
      success: true,
      message: 'Item removed from cart'
    })

  } catch (error) {
    console.error('Error removing from cart:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 })
  }
}
