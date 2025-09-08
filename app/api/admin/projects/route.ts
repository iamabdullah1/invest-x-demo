import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import CloudinaryService from '@/lib/cloudinary';
import { getCollection } from '@/lib/db';

// GET - Fetch all projects
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const type = url.searchParams.get('type');
    const city = url.searchParams.get('city');
    const search = url.searchParams.get('search');
    const projectId = url.searchParams.get('id'); // Add single project fetch support

    const projectsCollection = await getCollection('projects');
    
    // If requesting a single project by ID
    if (projectId) {
      const { ObjectId } = await import('mongodb');
      const project = await projectsCollection.findOne({
        _id: new ObjectId(projectId)
      });
      
      if (!project) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        projects: [project] // Return as array for consistency
      });
    }
    
    // Build filter query
    const filter: any = {};
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (type && type !== 'all') {
      filter.type = type;
    }
    
    if (city && city !== 'all') {
      filter.city = city.toLowerCase();
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { 'developer.name': { $regex: search, $options: 'i' } }
      ];
    }

    const projects = await projectsCollection.find(filter).sort({ createdAt: -1 }).toArray();

    return NextResponse.json({
      success: true,
      projects: projects
    });

  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST - Create new project
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Extract form fields
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const location = formData.get('location') as string;
    const city = formData.get('city') as string;
    const type = formData.get('type') as string;
    const developer = formData.get('developer') as string;
    const riskLevel = formData.get('riskLevel') as string;
    
    // Financial details
    const targetAmount = parseInt(formData.get('targetAmount') as string);
    const minInvestment = parseInt(formData.get('minInvestment') as string);
    const expectedReturn = parseFloat(formData.get('expectedReturn') as string);
    const duration = parseInt(formData.get('duration') as string);
    const area = parseInt(formData.get('area') as string);
    const pricePerSqFt = parseInt(formData.get('pricePerSqFt') as string);
    
    // Timeline
    const startDate = formData.get('startDate') as string;
    const endDate = formData.get('endDate') as string;
    
    // Amenities (JSON string)
    const amenitiesJson = formData.get('amenities') as string;
    const amenities = amenitiesJson ? JSON.parse(amenitiesJson) : [];
    
    // Images
    const imageFiles: File[] = [];
    for (let i = 0; i < 10; i++) { // Support up to 10 images
      const file = formData.get(`images_${i}`) as File;
      if (file && file.size > 0) {
        imageFiles.push(file);
      }
    }

    // Validate required fields
    if (!title || !description || !location || !city || !type || !developer) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!targetAmount || !minInvestment || !expectedReturn || !duration) {
      return NextResponse.json(
        { error: 'Missing required financial details' },
        { status: 400 }
      );
    }

    // Generate project ID
    const projectId = uuidv4();
    
    console.log(`📤 Starting project creation for: ${title}`);

    // Upload images to Cloudinary
    let imageUrls: string[] = [];
    if (imageFiles.length > 0) {
      console.log(`📤 Uploading ${imageFiles.length} images to Cloudinary...`);
      
      try {
        for (const [index, imageFile] of imageFiles.entries()) {
          const imageBytes = await imageFile.arrayBuffer();
          const imageBuffer = Buffer.from(imageBytes);
          
          const uploadResult = await CloudinaryService.uploadProjectImage(
            imageBuffer,
            projectId,
            `image_${index + 1}`,
            imageFile.name
          );
          
          if (uploadResult.success && uploadResult.url) {
            imageUrls.push(uploadResult.url);
          } else {
            console.error(`Image ${index + 1} upload failed:`, uploadResult.error);
          }
        }
        
        console.log(`✅ Successfully uploaded ${imageUrls.length} images`);
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        return NextResponse.json(
          { error: 'Failed to upload project images' },
          { status: 500 }
        );
      }
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Create project document (without _id field, let MongoDB auto-generate)
    const projectDoc = {
      projectId, // Use custom field for our UUID
      title,
      description,
      location,
      city: city.toLowerCase(),
      type,
      status: 'active', // Set as active so investors can see it
      
      // Financial details
      targetAmount,
      raisedAmount: 0,
      minInvestment,
      maxInvestment: Math.floor(targetAmount * 0.1), // 10% of target as max
      expectedReturn,
      actualReturn: null,
      
      // Timeline
      duration,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      fundingDeadline: new Date(new Date(startDate).getTime() + (30 * 24 * 60 * 60 * 1000)), // 30 days from start
      
      // Property details
      area,
      pricePerSqFt,
      totalUnits: Math.floor(area / 1000), // Estimate based on area
      availableUnits: Math.floor(area / 1000),
      
      // Media
      images: imageUrls,
      documents: [],
      
      // Developer info
      developer: {
        name: developer,
        experience: 5, // Default values - can be made configurable
        completedProjects: 10,
        rating: 4.5,
        contact: {
          email: 'contact@developer.com',
          phone: '+92-300-0000000',
          address: location
        }
      },
      
      // Features
      amenities,
      specifications: {
        bedrooms: type === 'residential' ? 3 : null,
        bathrooms: type === 'residential' ? 2 : null,
        parking: true,
        floor: 1,
        facing: 'North'
      },
      
      // Risk and compliance
      riskLevel,
      riskFactors: [
        'Market fluctuations',
        'Construction delays',
        'Regulatory changes'
      ],
      complianceStatus: {
        noc: true,
        environmentalClearance: true,
        buildingApproval: true,
        utilityConnections: false
      },
      
      // Investment tracking
      totalInvestors: 0,
      investments: [],
      
      // Admin fields
      createdBy: 'admin', // TODO: Get from auth context
      approvedBy: null,
      approvalDate: null,
      
      // SEO and marketing
      slug,
      tags: [type, city.toLowerCase(), 'investment'],
      featured: false,
      views: 0,
      
      // Timestamps
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Save to database
    const projectsCollection = await getCollection('projects');
    const insertResult = await projectsCollection.insertOne(projectDoc);

    console.log(`✅ Project created successfully: ${projectId}`);

    return NextResponse.json({
      success: true,
      message: 'Project created successfully',
      project: {
        id: insertResult.insertedId,
        projectId: projectDoc.projectId,
        title: projectDoc.title,
        slug: projectDoc.slug,
        status: projectDoc.status,
        images: projectDoc.images
      }
    });

  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project. Please try again.' },
      { status: 500 }
    );
  }
}

// PUT - Update existing project
export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData();
    const projectId = formData.get('projectId') as string;
    
    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Extract form fields
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const location = formData.get('location') as string;
    const city = formData.get('city') as string;
    const type = formData.get('type') as string;
    const developer = formData.get('developer') as string;
    const riskLevel = formData.get('riskLevel') as string;
    
    // Financial details
    const targetAmount = parseInt(formData.get('targetAmount') as string);
    const minInvestment = parseInt(formData.get('minInvestment') as string);
    const expectedReturn = parseFloat(formData.get('expectedReturn') as string);
    const duration = parseInt(formData.get('duration') as string);
    const area = parseInt(formData.get('area') as string);
    const pricePerSqFt = parseInt(formData.get('pricePerSqFt') as string);
    
    // Timeline
    const startDate = formData.get('startDate') as string;
    const endDate = formData.get('endDate') as string;
    
    // Status
    const status = formData.get('status') as string || 'active';
    
    // Handle image upload if new image is provided
    let imageUrl = formData.get('existingImageUrl') as string;
    const imageFile = formData.get('image') as File;
    
    if (imageFile && imageFile.size > 0) {
      try {
        const { CloudinaryService } = await import('@/lib/cloudinary');
        
        // Convert File to Buffer
        const buffer = Buffer.from(await imageFile.arrayBuffer());
        
        const uploadResult = await CloudinaryService.uploadProjectImage(
          buffer,
          projectId,
          'main-image',
          imageFile.name
        );
        
        if (uploadResult.success && uploadResult.url) {
          imageUrl = uploadResult.url;
        }
      } catch (error) {
        console.error('Image upload failed:', error);
        // Continue with existing image if upload fails
      }
    }

    // Prepare update document
    const updateDoc = {
      title,
      description,
      location: {
        city: city.toLowerCase(),
        area: location,
        address: location
      },
      type,
      status,
      
      // Financial details
      targetAmount,
      raisedAmount: 0, // Keep existing raised amount
      minInvestment,
      expectedReturn,
      duration,
      
      // Property details
      area,
      pricePerSqFt,
      totalValue: area * pricePerSqFt,
      
      // Timeline
      timeline: {
        projectStart: new Date(startDate),
        expectedCompletion: new Date(endDate),
        phases: [
          {
            name: 'Planning & Approval',
            duration: '3 months',
            status: 'completed'
          },
          {
            name: 'Construction',
            duration: `${duration} months`,
            status: 'in-progress'
          }
        ]
      },
      
      // Developer info
      developer: {
        name: developer,
        experience: '10+ years',
        rating: 4.5,
        completedProjects: 25
      },
      
      // Images
      images: imageUrl ? [imageUrl] : [],
      
      // Risk and compliance
      riskLevel,
      
      // Admin fields
      updatedBy: 'admin', // TODO: Get from auth context
      updatedAt: new Date()
    };

    // Update in database
    const projectsCollection = await getCollection('projects');
    const updateResult = await projectsCollection.updateOne(
      { _id: new (await import('mongodb')).ObjectId(projectId) },
      { $set: updateDoc }
    );

    if (updateResult.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    console.log(`✅ Project updated successfully: ${projectId}`);

    return NextResponse.json({
      success: true,
      message: 'Project updated successfully',
      projectId
    });

  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Failed to update project. Please try again.' },
      { status: 500 }
    );
  }
}

// DELETE - Delete project
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const projectId = url.searchParams.get('id');
    
    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const projectsCollection = await getCollection('projects');
    
    // Check if project exists and has no investments
    const project = await projectsCollection.findOne({
      _id: new (await import('mongodb')).ObjectId(projectId)
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Check if project has investments
    if (project.totalInvestors > 0 || project.raisedAmount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete project with existing investments' },
        { status: 400 }
      );
    }

    // Delete the project
    const deleteResult = await projectsCollection.deleteOne({
      _id: new (await import('mongodb')).ObjectId(projectId)
    });

    if (deleteResult.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Failed to delete project' },
        { status: 500 }
      );
    }

    console.log(`✅ Project deleted successfully: ${projectId}`);

    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project. Please try again.' },
      { status: 500 }
    );
  }
}
