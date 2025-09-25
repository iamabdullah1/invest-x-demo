import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { InventoryCategory } from '@/models';
import JWTAuthService from '@/lib/jwtAuth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    const search = searchParams.get('search');
    const propertyType = searchParams.get('propertyType');
    const projectId = searchParams.get('projectId'); // Added projectId filter

    // Build filter object
    const filter: any = {};
    
    if (propertyType) {
      filter.propertyType = propertyType;
    }

    if (projectId) {
      filter.projectId = projectId; // Filter by projectId if provided
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { area: { $regex: search, $options: 'i' } }
      ];
    }

    // Get filtered inventory items with project information
    const inventory = await InventoryCategory.find(filter)
      .populate('projectId', 'title location')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await InventoryCategory.countDocuments(filter);

    return NextResponse.json({
      success: true,
      inventory,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch inventory' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate and authorize admin user
    const { user, error: authError } = await JWTAuthService.requireRole(request, 'admin');
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: authError || 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const {
      projectId,
      country,
      city,
      area,
      title,
      description,
      propertyType,
      propertySubType,
      totalArea,
      minSquareFeet,
      pricePerSquareFoot,
      inventoryImages
    } = body;

    // Validate required fields
    if (!projectId || !country || !city || !area || !title || !description ||
        !propertyType || !propertySubType || !totalArea || !minSquareFeet || !pricePerSquareFoot) {
      return NextResponse.json(
        { success: false, error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    // Validate numeric fields
    if (isNaN(totalArea) || isNaN(minSquareFeet) || isNaN(pricePerSquareFoot)) {
      return NextResponse.json(
        { success: false, error: 'Numeric fields must be valid numbers' },
        { status: 400 }
      );
    }

    // Validate propertyType and propertySubType enums
    const validPropertyTypes = ['Residential', 'Commercial', 'Mixed'];
    const validPropertySubTypes = ['Apartment', 'Villa', 'Shop', 'Office', 'Plot'];

    if (!validPropertyTypes.includes(propertyType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid property type' },
        { status: 400 }
      );
    }

    if (!validPropertySubTypes.includes(propertySubType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid property sub-type' },
        { status: 400 }
      );
    }

    // Create new inventory category
    const inventoryCategory = new InventoryCategory({
      projectId,
      country,
      city,
      area,
      title,
      description,
      propertyType,
      propertySubType,
      totalArea: Number(totalArea),
      minSquareFeet: Number(minSquareFeet),
      pricePerSquareFoot: Number(pricePerSquareFoot),
      inventoryImages: inventoryImages || []
    });

    await inventoryCategory.save();

    // Populate project information for response
    await inventoryCategory.populate('projectId', 'title location');

    return NextResponse.json({
      success: true,
      inventory: inventoryCategory,
      message: 'Inventory category created successfully'
    });

  } catch (error: any) {
    console.error('Error creating inventory category:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create inventory category' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Authenticate and authorize admin user
    const { user, error: authError } = await JWTAuthService.requireRole(request, 'admin');
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: authError || 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const inventoryId = searchParams.get('id');

    if (!inventoryId) {
      return NextResponse.json(
        { success: false, error: 'Inventory ID is required' },
        { status: 400 }
      );
    }

    // Find and delete the inventory item
    const deletedInventory = await InventoryCategory.findByIdAndDelete(inventoryId);

    if (!deletedInventory) {
      return NextResponse.json(
        { success: false, error: 'Inventory item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Inventory item deleted successfully'
    });

  } catch (error: any) {
    console.error('Error deleting inventory item:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete inventory item' },
      { status: 500 }
    );
  }
}
