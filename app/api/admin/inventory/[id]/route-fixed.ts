import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { InventoryCategory } from '@/models';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Inventory ID is required' },
        { status: 400 }
      );
    }

    // Get inventory item with project information
    const inventory = await InventoryCategory.findById(id)
      .populate('projectId', 'title location')
      .lean();

    if (!inventory) {
      return NextResponse.json(
        { success: false, error: 'Inventory item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      inventory
    });

  } catch (error) {
    console.error('Error fetching inventory item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch inventory item' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const updateData = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Inventory ID is required' },
        { status: 400 }
      );
    }

    // Validate required fields
    const requiredFields = ['title', 'city', 'area', 'propertyType', 'propertySubType', 'totalArea', 'minSquareFeet', 'pricePerSquareFoot'];
    for (const field of requiredFields) {
      if (!updateData[field]) {
        return NextResponse.json(
          { success: false, error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Validate numeric fields
    const numericFields = ['totalArea', 'minSquareFeet', 'pricePerSquareFoot'];
    for (const field of numericFields) {
      const value = parseFloat(updateData[field]);
      if (isNaN(value) || value <= 0) {
        return NextResponse.json(
          { success: false, error: `${field} must be a positive number` },
          { status: 400 }
        );
      }
    }

    // Validate property type and subtype
    const validPropertyTypes = ['Residential', 'Commercial', 'Mixed'];
    const validPropertySubTypes = ['Apartment', 'Villa', 'Shop', 'Office', 'Plot'];

    if (!validPropertyTypes.includes(updateData.propertyType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid property type' },
        { status: 400 }
      );
    }

    if (!validPropertySubTypes.includes(updateData.propertySubType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid property sub type' },
        { status: 400 }
      );
    }

    // Remove fields that shouldn't be updated directly
    const { _id, createdAt, updatedAt, ...updateFields } = updateData;

    // Update inventory item
    const updatedInventory = await InventoryCategory.findByIdAndUpdate(
      id,
      { ...updateFields },
      { new: true, runValidators: true }
    ).populate('projectId', 'title location');

    if (!updatedInventory) {
      return NextResponse.json(
        { success: false, error: 'Inventory item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      inventory: updatedInventory,
      message: 'Inventory item updated successfully'
    });

  } catch (error) {
    console.error('Error updating inventory item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update inventory item' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Inventory ID is required' },
        { status: 400 }
      );
    }

    // Delete inventory item
    const deletedInventory = await InventoryCategory.findByIdAndDelete(id);

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

  } catch (error) {
    console.error('Error deleting inventory item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete inventory item' },
      { status: 500 }
    );
  }
}
