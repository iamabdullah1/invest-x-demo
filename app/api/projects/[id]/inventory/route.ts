import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { InventoryCategory } from '@/models';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id: projectId } = await params;

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Get all inventory items for the project
    const inventory = await InventoryCategory.find({ projectId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      inventory,
      count: inventory.length
    });

  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch inventory' },
      { status: 500 }
    );
  }
}
