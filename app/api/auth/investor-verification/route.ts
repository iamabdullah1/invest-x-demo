import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { DatabaseService } from '@/lib/database';
import { InvestorVerification } from '@/models';

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

    // Validate file sizes (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (frontIdCard.size > maxSize || backIdCard.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'verifications');
    await mkdir(uploadDir, { recursive: true });

    // Generate unique filenames
    const timestamp = Date.now();
    const frontFileName = `${timestamp}_${email.replace('@', '_')}_front.${frontIdCard.name.split('.').pop()}`;
    const backFileName = `${timestamp}_${email.replace('@', '_')}_back.${backIdCard.name.split('.').pop()}`;

    // Save files
    const frontIdBytes = await frontIdCard.arrayBuffer();
    const backIdBytes = await backIdCard.arrayBuffer();
    
    const frontIdPath = join(uploadDir, frontFileName);
    const backIdPath = join(uploadDir, backFileName);
    
    await writeFile(frontIdPath, Buffer.from(frontIdBytes));
    await writeFile(backIdPath, Buffer.from(backIdBytes));

    // Create verification request in database
    const verification = new InvestorVerification({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      address: address.trim(),
      city: city.trim(),
      postalCode: postalCode.trim(),
      frontIdCardPath: `/uploads/verifications/${frontFileName}`,
      backIdCardPath: `/uploads/verifications/${backFileName}`,
      status: 'pending'
    });

    await verification.save();

    console.log(`📋 New investor verification request submitted by ${email}`);

    return NextResponse.json({
      success: true,
      message: 'Verification request submitted successfully',
      verificationId: verification._id,
      status: 'pending'
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
