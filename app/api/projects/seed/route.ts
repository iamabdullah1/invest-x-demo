import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Create sample project data
    const sampleProject = {
      _id: '507f1f77bcf86cd799439011',
      title: 'InvestX Demo Project',
      description: 'A comprehensive real estate investment project showcasing various property types across Pakistan',
      location: 'Multiple Cities, Pakistan',
      city: 'Karachi',
      type: 'mixed' as const,
      status: 'active' as const,
      targetAmount: 100000000, // 100 million PKR
      raisedAmount: 0,
      minInvestment: 100000, // 100k PKR
      expectedReturn: 15,
      duration: 24, // months
      startDate: new Date(),
      endDate: new Date(Date.now() + 24 * 30 * 24 * 60 * 60 * 1000), // 24 months from now
      fundingDeadline: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000), // 6 months from now
      area: 100000, // 100,000 sq ft
      pricePerSqFt: 10000,
      images: [
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop'
      ],
      documents: [],
      developer: {
        name: 'InvestX Developers',
        experience: 10,
        completedProjects: 25,
        rating: 4.5,
        contact: {
          email: 'info@investx.com',
          phone: '+92-300-1234567',
          address: 'Karachi, Pakistan'
        }
      },
      amenities: [
        'Prime Locations',
        'High Quality Construction',
        'Tokenized Ownership',
        'Professional Management'
      ],
      riskLevel: 'medium' as const,
      complianceStatus: {
        noc: true,
        environmentalClearance: true,
        buildingApproval: true,
        utilityConnections: false
      },
      totalInvestors: 0,
      investments: [],
      createdBy: '507f1f77bcf86cd799439012', // Sample user ID
      slug: 'investx-demo-project',
      tags: ['demo', 'mixed', 'investment'],
      featured: true,
      views: 0
    };

    // Check if project already exists
    const existingProject = await Project.findById(sampleProject._id);
    if (existingProject) {
      return NextResponse.json({
        success: true,
        message: 'Sample project already exists',
        project: existingProject
      });
    }

    // Create the project
    const createdProject = await Project.create(sampleProject);

    return NextResponse.json({
      success: true,
      message: 'Sample project created successfully',
      project: createdProject
    });

  } catch (error) {
    console.error('Error seeding project data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to seed project data' },
      { status: 500 }
    );
  }
}
