import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { InventoryCategory } from '@/models';

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
