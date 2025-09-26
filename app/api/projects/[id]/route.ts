import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';
import { ObjectId } from 'mongodb';

// GET - Fetch a specific project by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.log('Fetching project with ID:', id);

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Project ID is required' },
        { status: 400 }
      );
    }

    const projectsCollection = await getCollection('projects');
    
    // Try to find by ObjectId first
    let project = null;
    if (ObjectId.isValid(id)) {
      project = await projectsCollection.findOne({ _id: new ObjectId(id) });
    }
    
    // If not found and ID is not a valid ObjectId, try string match as fallback
    if (!project && !ObjectId.isValid(id)) {
      project = await projectsCollection.findOne({ _id: id });
    }

    console.log('Project found:', !!project);

    if (!project) {
      return NextResponse.json(
        { success: false, message: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      project: project
    });

  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}
