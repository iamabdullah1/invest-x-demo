import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing database connection...');
    
    // Test database connection
    const projectsCollection = await getCollection('projects');
    const totalProjects = await projectsCollection.countDocuments();
    
    console.log('Total projects found:', totalProjects);
    
    // Get a sample of projects
    const sampleProjects = await projectsCollection
      .find({})
      .limit(5)
      .toArray();
    
    console.log('Sample projects:', sampleProjects.map(p => ({ 
      _id: p._id, 
      title: p.title, 
      status: p.status 
    })));
    
    return NextResponse.json({
      success: true,
      totalProjects,
      sampleProjects: sampleProjects.map(p => ({
        _id: p._id,
        title: p.title,
        status: p.status,
        city: p.city,
        location: p.location,
        targetAmount: p.targetAmount,
        raisedAmount: p.raisedAmount
      })),
      message: 'Database connection successful'
    });
    
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Database connection failed'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🌱 Attempting to seed database...');
    
    // Call the admin seed endpoint
    const seedResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3002'}/api/admin/seed`, {
      method: 'POST'
    });
    
    const seedResult = await seedResponse.json();
    console.log('Seed result:', seedResult);
    
    if (seedResult.success) {
      // Check projects after seeding
      const projectsCollection = await getCollection('projects');
      const totalProjects = await projectsCollection.countDocuments();
      
      return NextResponse.json({
        success: true,
        message: 'Database seeded successfully',
        seedResult,
        totalProjectsAfterSeed: totalProjects
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Seeding failed',
        details: seedResult
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Seeding failed'
    }, { status: 500 });
  }
}
