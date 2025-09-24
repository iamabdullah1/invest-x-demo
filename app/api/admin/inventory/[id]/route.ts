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

    // Log detailed validation errors if available
    if (error instanceof Error && 'errors' in error) {
      console.error('Validation errors:', (error as any).errors);
    }

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
