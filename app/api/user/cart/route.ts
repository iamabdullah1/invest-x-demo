import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { User, Project, InventoryCategory } from '@/models'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Get user's cart
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    console.log('Cart GET - Token present:', !!token)

    if (!token) {
      return NextResponse.json({ 
        success: false, 
        message: 'Authentication required' 
      }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any
    const userId = decoded.userId

    console.log('Cart GET - Decoded userId:', userId)

    await connectDB()
    
    // Get user's cart
    const user = await User.findById(userId).select('cart')

    console.log('Cart GET - User found:', !!user)
    console.log('Cart GET - User cart:', user?.cart)

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: 'User not found' 
      }, { status: 404 })
    }

    const cartItems = user.cart || []

    console.log('Cart GET - Cart items count:', cartItems.length)
    console.log('Cart GET - Cart items:', cartItems)

    // Convert Mongoose subdocuments to plain objects
    const plainCartItems = cartItems.map((item: any) => item.toObject ? item.toObject() : item)

    console.log('Cart GET - Plain cart items:', plainCartItems)

    // Get full inventory details for cart items
    const inventoryIds = plainCartItems.map((item: any) => item.inventoryId).filter(Boolean)
    console.log('Cart GET - Inventory IDs to fetch:', inventoryIds)
    
    const inventories = await InventoryCategory.find({ 
      _id: { $in: inventoryIds }
    }).populate('projectId', 'title location city status')

    console.log('Cart GET - Found inventories count:', inventories.length)
    inventories.forEach((inv, index) => {
      console.log(`Cart GET - Inventory ${index + 1}:`, {
        _id: inv._id,
        title: inv.title,
        projectId: inv.projectId
      })
    })

    // Combine cart data with inventory details
    const enrichedCart = plainCartItems.map((item: any) => {
      const inventory = inventories.find(i => i._id.toString() === item.inventoryId)
      console.log(`Cart GET - Enriching item ${item.inventoryId}:`, {
        foundInventory: !!inventory,
        inventoryTitle: inventory?.title
      })
      
      return {
        ...item,
        addedAt: item.addedAt.toISOString(), // Convert Date to string
        inventory: inventory || null,
        project: inventory?.projectId ? {
          _id: inventory.projectId._id,
          title: inventory.projectId.title,
          location: {
            city: inventory.projectId.city,
            area: inventory.projectId.location // Using location as area
          },
          status: inventory.projectId.status
        } : null,
        isValid: !!inventory // Mark if inventory exists
      }
    }) // Don't filter out invalid items, let frontend handle them

    console.log('Cart GET - Enriched cart count:', enrichedCart.length)
    console.log('Cart GET - Final response cart:', enrichedCart)

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

    console.log('Cart POST request data:', { inventoryId, amount, sqft, pricePerSqFt })

    if (!inventoryId || !amount || amount <= 0) {
      console.log('Validation failed:', { inventoryId: !!inventoryId, amount, amountValid: amount > 0 })
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
    console.log('Saving cart for user:', userId)
    console.log('Cart data to save:', cart)
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

    const { inventoryId, amount } = await request.json()

    if (!inventoryId || !amount || amount <= 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'Inventory ID and valid amount are required' 
      }, { status: 400 })
    }

    await connectDB()

    // Update cart item
    const result = await User.findOneAndUpdate(
      { 
        _id: userId,
        'cart.inventoryId': inventoryId 
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
    const inventoryId = searchParams.get('inventoryId')
    const cleanupInvalid = searchParams.get('cleanupInvalid') === 'true'
    const clearAll = searchParams.get('clearAll') === 'true'

    await connectDB()

    if (clearAll) {
      // Clear all cart items completely
      const user = await User.findById(userId)
      if (!user) {
        return NextResponse.json({ 
          success: false, 
          message: 'User not found' 
        }, { status: 404 })
      }

      const clearedCount = user.cart.length
      user.cart = []
      await user.save()
      
      return NextResponse.json({
        success: true,
        message: `Cleared all ${clearedCount} cart items`
      })
    }

    if (cleanupInvalid) {
      // Clean up all invalid cart items (those without inventoryId, invalid data, or non-existent inventory)
      const user = await User.findById(userId)
      if (!user) {
        return NextResponse.json({ 
          success: false, 
          message: 'User not found' 
        }, { status: 404 })
      }

      console.log('Original cart items:', user.cart.length)
      user.cart.forEach((item: any, index: number) => {
        console.log(`Cart item ${index}:`, {
          inventoryId: item.inventoryId,
          amount: item.amount,
          sqft: item.sqft,
          pricePerSqFt: item.pricePerSqFt
        })
      })

      // Get all inventory IDs from cart (filter out undefined/null)
      const inventoryIds = user.cart
        .map((item: any) => item.inventoryId)
        .filter((id: any) => id && typeof id === 'string' && id.trim() !== '')

      console.log('Valid inventory IDs found:', inventoryIds)

      // Check which inventories actually exist
      const existingInventories = await InventoryCategory.find({ 
        _id: { $in: inventoryIds }
      }).select('_id')

      const existingInventoryIds = new Set(
        existingInventories.map((inv: any) => inv._id.toString())
      )

      console.log('Existing inventory IDs:', Array.from(existingInventoryIds))

      const originalLength = user.cart.length
      user.cart = user.cart.filter((item: any) => {
        const isValid = item.inventoryId && 
          typeof item.inventoryId === 'string' && 
          item.inventoryId.trim() !== '' &&
          item.amount && 
          typeof item.amount === 'number' &&
          item.amount > 0 &&
          item.sqft && 
          typeof item.sqft === 'number' &&
          item.sqft > 0 &&
          item.pricePerSqFt &&
          typeof item.pricePerSqFt === 'number' &&
          item.pricePerSqFt > 0 &&
          existingInventoryIds.has(item.inventoryId)
        
        console.log(`Item ${item.inventoryId || 'undefined'}: ${isValid ? 'KEEP' : 'REMOVE'}`)
        return isValid
      })
      
      await user.save()
      
      console.log(`Removed ${originalLength - user.cart.length} invalid items. Remaining: ${user.cart.length}`)
      
      return NextResponse.json({
        success: true,
        message: `Cleaned up ${originalLength - user.cart.length} invalid cart items. ${user.cart.length} items remaining.`
      })
    }

    if (!inventoryId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Inventory ID is required' 
      }, { status: 400 })
    }

    // Remove from user's cart
    await User.findByIdAndUpdate(
      userId,
      { $pull: { cart: { inventoryId: inventoryId } } }
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
