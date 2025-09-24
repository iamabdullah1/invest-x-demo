// Quick script to seed test inventory data
import connectDB from './lib/mongodb';
import InventoryCategory from './models/InventoryCategory';

async function seedInventory() {
  try {
    console.log('🚀 Seeding inventory data...');

    await connectDB();

    // Create test inventory items
    const testInventory = [
      {
        projectId: '507f1f77bcf86cd799439011', // Dummy project ID
        country: 'Pakistan',
        city: 'Lahore',
        area: 'DHA Phase 8',
        title: 'Premium 2-Bedroom Apartment',
        description: 'Luxurious 2-bedroom apartment with modern amenities',
        propertyType: 'Residential',
        propertySubType: 'Apartment',
        totalArea: 1200,
        minSquareFeet: 600,
        pricePerSquareFoot: 8500,
        inventoryImages: ['/placeholder.jpg'],
        tokensAvailable: 50,
        totalTokens: 100
      },
      {
        projectId: '507f1f77bcf86cd799439011', // Same project ID
        country: 'Pakistan',
        city: 'Lahore',
        area: 'DHA Phase 8',
        title: 'Executive 3-Bedroom Villa',
        description: 'Spacious 3-bedroom villa with garden and parking',
        propertyType: 'Residential',
        propertySubType: 'Villa',
        totalArea: 2500,
        minSquareFeet: 800,
        pricePerSquareFoot: 12000,
        inventoryImages: ['/placeholder.jpg'],
        tokensAvailable: 25,
        totalTokens: 50
      },
      {
        projectId: '507f1f77bcf86cd799439011', // Same project ID
        country: 'Pakistan',
        city: 'Lahore',
        area: 'DHA Phase 8',
        title: 'Commercial Shop Space',
        description: 'Prime commercial space in high-traffic area',
        propertyType: 'Commercial',
        propertySubType: 'Shop',
        totalArea: 800,
        minSquareFeet: 400,
        pricePerSquareFoot: 15000,
        inventoryImages: ['/placeholder.jpg'],
        tokensAvailable: 30,
        totalTokens: 60
      }
    ];

    for (const item of testInventory) {
      const existing = await InventoryCategory.findOne({ title: item.title });
      if (!existing) {
        await InventoryCategory.create(item);
        console.log(`✅ Created inventory: ${item.title}`);
      } else {
        console.log(`⚠️  Inventory already exists: ${item.title}`);
      }
    }

    console.log('✅ Inventory seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding inventory:', error);
    process.exit(1);
  }
}

seedInventory();