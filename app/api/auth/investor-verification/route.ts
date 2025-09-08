import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
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

    // Generate unique verification ID
    const verificationId = uuidv4();
    
    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'uploads', 'verifications', verificationId);
    await mkdir(uploadDir, { recursive: true });

    // Save files
    const frontIdBytes = await frontIdCard.arrayBuffer();
    const backIdBytes = await backIdCard.arrayBuffer();
    
    const frontIdExtension = frontIdCard.name.split('.').pop();
    const backIdExtension = backIdCard.name.split('.').pop();
    
    const frontIdPath = join(uploadDir, `front-id.${frontIdExtension}`);
    const backIdPath = join(uploadDir, `back-id.${backIdExtension}`);
    
    await writeFile(frontIdPath, Buffer.from(frontIdBytes));
    await writeFile(backIdPath, Buffer.from(backIdBytes));

    // Here you would typically:
    // 1. Save the verification data to your database
    // 2. Send notification emails to admin
    // 3. Create a verification record with pending status
    
    // For now, we'll simulate the database save
    const verificationData = {
      verificationId,
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      postalCode,
      frontIdPath: `uploads/verifications/${verificationId}/front-id.${frontIdExtension}`,
      backIdPath: `uploads/verifications/${verificationId}/back-id.${backIdExtension}`,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };

    console.log('Investor verification submitted:', verificationData);

    // In a real application, you would save this to your database
    // await saveVerificationToDatabase(verificationData);

    // Send success response
    return NextResponse.json({
      success: true,
      message: 'Verification request submitted successfully',
      verificationId,
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
