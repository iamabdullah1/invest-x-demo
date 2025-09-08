import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import CloudinaryService from '@/lib/cloudinary';
import { getCollection } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    await DatabaseService.connect();

    const formData = await request.formData();
    
    // Extract form fields
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const address = formData.get('address') as string;
    const city = formData.get('city') as string;
    const postalCode = formData.get('postalCode') as string;
    const frontIdCard = formData.get('frontIdCard') as File;
    const backIdCard = formData.get('backIdCard') as File;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !address || !city || !postalCode) {
      return NextResponse.json(
        { error: 'All personal and address information is required' },
        { status: 400 }
      );
    }

    if (!frontIdCard || !backIdCard) {
      return NextResponse.json(
        { error: 'Both front and back ID card images are required' },
        { status: 400 }
      );
    }

    // Check if verification request already exists for this email
    const existingVerification = await InvestorVerification.findOne({ email: email.toLowerCase() });
    if (existingVerification) {
      return NextResponse.json(
        { error: 'A verification request already exists for this email' },
        { status: 409 }
      );
    }

    // Validate file types
    if (!frontIdCard.type.startsWith('image/') || !backIdCard.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are allowed for ID cards' },
        { status: 400 }
      );
    }

    // Validate file sizes (500KB limit for ID cards)
    const maxSize = 500 * 1024; // 500KB
    if (frontIdCard.size > maxSize || backIdCard.size > maxSize) {
      return NextResponse.json(
        { error: 'ID card file size must be less than 500KB' },
        { status: 400 }
      );
    }

    // Generate unique verification ID
    const verificationId = uuidv4();
    
    console.log(`📤 Starting Cloudinary upload for verification: ${verificationId}`);

    // Convert files to buffers
    const frontIdBytes = await frontIdCard.arrayBuffer();
    const backIdBytes = await backIdCard.arrayBuffer();
    
    const frontIdBuffer = Buffer.from(frontIdBytes);
    const backIdBuffer = Buffer.from(backIdBytes);

    // Upload to Cloudinary
    const uploadResult = await CloudinaryService.uploadVerificationDocuments(
      frontIdBuffer,
      backIdBuffer,
      verificationId
    );

    if (!uploadResult.success) {
      console.error('Cloudinary upload failed:', uploadResult.error);
      return NextResponse.json(
        { error: 'Failed to upload verification documents. Please try again.' },
        { status: 500 }
      );
    }

    console.log(`✅ Cloudinary upload successful for verification: ${verificationId}`);

    // Prepare verification data for database
    const verificationData = {
      verificationId,
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      postalCode,
      frontIdUrl: uploadResult.frontId?.url,
      frontIdPublicId: uploadResult.frontId?.public_id,
      backIdUrl: uploadResult.backId?.url,
      backIdPublicId: uploadResult.backId?.public_id,
      status: 'pending',
      submittedAt: new Date(),
      cloudinaryUpload: true,
    };

    // Save to MongoDB
    try {
      const verificationCollection = await getCollection('investor_verifications');
      const insertResult = await verificationCollection.insertOne(verificationData);
      
      console.log(`💾 Verification saved to MongoDB with ID: ${insertResult.insertedId}`);
    } catch (dbError: any) {
      console.error('❌ Database save error:', dbError);
      // Continue anyway - Cloudinary upload was successful
    }

    console.log('✅ Investor verification submitted successfully:', {
      verificationId,
      email,
      frontIdUrl: uploadResult.frontId?.url,
      backIdUrl: uploadResult.backId?.url,
    });

    // Send success response
    return NextResponse.json({
      success: true,
      message: 'Verification request submitted successfully',
      verificationId,
      status: 'pending',
      documentUrls: {
        frontId: uploadResult.frontId?.url,
        backId: uploadResult.backId?.url,
      }
    });

  } catch (error: any) {
    console.error('Investor verification error:', error);
    return NextResponse.json(
      { error: 'Failed to process verification request' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await DatabaseService.connect();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    // Get verification requests
    const verifications = await InvestorVerification.find(query)
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await InvestorVerification.countDocuments(query);

    return NextResponse.json({
      success: true,
      verifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error: any) {
    console.error('Error fetching verification requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch verification requests' },
      { status: 500 }
    );
  }
}
