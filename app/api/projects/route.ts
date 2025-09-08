import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';

// GET - Fetch active projects for investors
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const city = url.searchParams.get('city');
    const type = url.searchParams.get('type');
    const search = url.searchParams.get('search');
    const featured = url.searchParams.get('featured');
    const limit = url.searchParams.get('limit');

    const projectsCollection = await getCollection('projects');
    
    // Build filter query - only show active projects to investors
    const filter: any = {
      status: { $in: ['active', 'funded'] } // Only show active and funded projects
    };
    
    if (city && city !== 'all') {
      filter.city = city.toLowerCase();
    }
    
    if (type && type !== 'all') {
      filter.type = type;
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { 'developer.name': { $regex: search, $options: 'i' } }
      ];
    }

    if (featured === 'true') {
      filter.featured = true;
    }

    let query = projectsCollection.find(filter).sort({ createdAt: -1 });
    
    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const projects = await query.toArray();

    return NextResponse.json({
      success: true,
      projects: projects
    });

  } catch (error) {
    console.error('Error fetching projects for investors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}
