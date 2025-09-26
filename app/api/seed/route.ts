import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { InventoryCategory } from '@/models';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Create sample inventory data
    const sampleInventory = [
      {
        projectId: '507f1f77bcf86cd799439011', // Sample project ID
        country: 'Pakistan',
        city: 'Lahore',
        area: 'DHA Phase 6',
        title: 'Luxury Apartment Complex',
        description: 'Modern luxury apartments with premium amenities',
        propertyType: 'Residential',
        propertySubType: 'Apartment',
        totalArea: 50000,
        minSquareFeet: 500,
        pricePerSquareFoot: 25000,
        inventoryImages: [
          'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop'
        ],
        tokensAvailable: 80,
        totalTokens: 100
      },
      {
        projectId: '507f1f77bcf86cd799439011',
        country: 'Pakistan',
        city: 'Karachi',
        area: 'Clifton',
        title: 'Commercial Plaza',
        description: 'Prime commercial space in heart of Clifton',
        propertyType: 'Commercial',
        propertySubType: 'Shop',
        totalArea: 25000,
        minSquareFeet: 200,
        pricePerSquareFoot: 35000,
        inventoryImages: [
          'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop'
        ],
        tokensAvailable: 45,
        totalTokens: 50
      },
      {
        projectId: '507f1f77bcf86cd799439011',
        country: 'Pakistan',
        city: 'Islamabad',
        area: 'F-10',
        title: 'Mixed-Use Development',
        description: 'Residential and commercial mixed development',
        propertyType: 'Mixed',
        propertySubType: 'Office',
        totalArea: 75000,
        minSquareFeet: 1000,
        pricePerSquareFoot: 30000,
        inventoryImages: [
          'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&h=600&fit=crop'
        ],
        tokensAvailable: 60,
        totalTokens: 75
      }
    ];

    // Clear existing inventory
    await InventoryCategory.deleteMany({});

    // Insert sample data
    const createdInventory = await InventoryCategory.insertMany(sampleInventory);

    return NextResponse.json({
      success: true,
      message: 'Sample inventory data created successfully',
      inventory: createdInventory,
      count: createdInventory.length
    } as const);

  } catch (error) {
    console.error('Error seeding inventory data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to seed inventory data' },
      { status: 500 }
    );
  }
}
