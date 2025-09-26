import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const projectsCollection = await getCollection('projects');
    
    // Sample projects with images
    const sampleProjects = [
      {
        title: "Emerald Heights Residential Complex",
        description: "Modern luxury apartments in the heart of Islamabad with world-class amenities.",
        location: "DHA Phase 2, Islamabad",
        city: "islamabad",
        area: "DHA Phase 2",
        type: "residential",
        status: "active",
        targetAmount: 50000000,
        raisedAmount: 15000000,
        expectedReturn: 15.5,
        duration: 24,
        riskLevel: "Low",
        images: [
          "/modern-apartments-islamabad.png",
          "/residential-development-rawalpindi.png"
        ],
        featured: true,
        developer: {
          name: "Emerald Developers",
          contact: "+92-300-1234567"
        },
        amenities: ["Swimming Pool", "Gym", "Security", "Parking"],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "Pearl Commercial Plaza",
        description: "Premium commercial spaces in the business district of Lahore.",
        location: "Gulberg III, Lahore",
        city: "lahore",
        area: "Gulberg III",
        type: "commercial",
        status: "active",
        targetAmount: 75000000,
        raisedAmount: 25000000,
        expectedReturn: 18.2,
        duration: 36,
        riskLevel: "Medium",
        images: [
          "/commercial-plaza-lahore.png",
          "/lahore-gulberg-plaza.png"
        ],
        featured: true,
        developer: {
          name: "Pearl Builders",
          contact: "+92-300-9876543"
        },
        amenities: ["24/7 Security", "Elevator", "Generator", "Parking"],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "Ocean View Luxury Residences",
        description: "Luxury beachfront apartments with stunning sea views in Karachi.",
        location: "Clifton Block 5, Karachi",
        city: "karachi",
        area: "Clifton",
        type: "residential",
        status: "active",
        targetAmount: 100000000,
        raisedAmount: 40000000,
        expectedReturn: 20.0,
        duration: 30,
        riskLevel: "High",
        images: [
          "/luxury-residential-karachi.png",
          "/modern-residential-complex-karachi.png"
        ],
        featured: true,
        developer: {
          name: "Ocean Developers",
          contact: "+92-300-5555555"
        },
        amenities: ["Sea View", "Swimming Pool", "Gym", "Security", "Beach Access"],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Clear existing projects and insert new ones
    await projectsCollection.deleteMany({});
    const result = await projectsCollection.insertMany(sampleProjects);

    return NextResponse.json({
      success: true,
      message: 'Sample projects with images created successfully',
      projectsCreated: result.insertedCount,
      projects: sampleProjects.map(p => ({ title: p.title, images: p.images }))
    });

  } catch (error) {
    console.error('Error seeding projects:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to seed projects',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
