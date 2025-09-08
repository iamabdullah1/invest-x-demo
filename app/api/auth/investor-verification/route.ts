import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import CloudinaryService from '@/lib/cloudinary';
import { getCollection } from '@/lib/db';
import JWTAuthService from '@/lib/jwtAuth';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await JWTAuthService.getAuthenticatedUser(request);
    
    if (!user) {
      console.log('❌ Authentication failed - no user found');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    
    // Extract form fields (no email needed since we have the user)
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const phone = formData.get('phone') as string;
    const address = formData.get('address') as string;
    const city = formData.get('city') as string;
    const postalCode = formData.get('postalCode') as string;
    const frontIdCard = formData.get('frontIdCard') as File;
    const backIdCard = formData.get('backIdCard') as File;

    // Validate required fields
    if (!firstName || !lastName || !phone || !address || !city || !postalCode) {
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

    // Check if user already has a pending or approved verification
    const usersCollection = await getCollection('users');
    const existingUser = await usersCollection.findOne({ 
      _id: new ObjectId(user._id),
      verificationStatus: { $in: ['pending', 'approved'] }
    });
    
    if (existingUser) {
      const status = existingUser.verificationStatus;
      if (status === 'approved') {
        return NextResponse.json(
          { error: 'Your verification is already approved' },
          { status: 409 }
        );
      } else if (status === 'pending') {
        return NextResponse.json(
          { error: 'A verification request is already pending review' },
          { status: 409 }
        );
      }
    }

    // Validate file types
    if (!frontIdCard.type.startsWith('image/') || !backIdCard.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are allowed for ID cards' },
        { status: 400 }
      );
    }

    // Validate file sizes (5MB limit for ID cards)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (frontIdCard.size > maxSize || backIdCard.size > maxSize) {
      return NextResponse.json(
        { error: 'ID card file size must be less than 5MB' },
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

    // Update user with verification data
    const verificationData = {
      verificationId,
      address,
      postalCode,
      frontIdUrl: uploadResult.frontId?.url,
      frontIdPublicId: uploadResult.frontId?.public_id,
      backIdUrl: uploadResult.backId?.url,
      backIdPublicId: uploadResult.backId?.public_id,
      submittedAt: new Date(),
    };

    // Update user record
    try {
      const updateResult = await usersCollection.updateOne(
        { _id: new ObjectId(user._id) },
        { 
          $set: {
            firstName,
            lastName,
            phone,
            city,
            verificationStatus: 'pending',
            verificationData
          }
        }
      );
      
      if (updateResult.matchedCount === 0) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      
      console.log(`💾 User verification data updated for user: ${user._id}`);
    } catch (dbError: any) {
      console.error('❌ Database update error:', dbError);
      return NextResponse.json(
        { error: 'Failed to update user verification data' },
        { status: 500 }
      );
    }

    console.log('✅ Investor verification submitted successfully:', {
      verificationId,
      userId: user._id,
      email: user.email,
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
    // Verify admin authentication
    const { user, error } = await JWTAuthService.requireRole(request, 'admin');
    if (error || !user) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build query - fetch users with verification requests
    const query: any = {};
    if (status && status !== 'all') {
      query.verificationStatus = status;
    } else {
      // If no specific status, show all users who have submitted verification (not 'none')
      query.verificationStatus = { $ne: 'none' };
    }

    // Get users with verification requests
    const usersCollection = await getCollection('users');
    const users = await usersCollection
      .find(query)
      .sort({ 'verificationData.submittedAt': -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await usersCollection.countDocuments(query);

    // Transform data to match expected format
    const verifications = users.map(user => ({
      _id: user._id,
      verificationId: user.verificationData?.verificationId,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      address: user.verificationData?.address,
      city: user.city,
      postalCode: user.verificationData?.postalCode,
      frontIdUrl: user.verificationData?.frontIdUrl,
      backIdUrl: user.verificationData?.backIdUrl,
      status: user.verificationStatus,
      submittedAt: user.verificationData?.submittedAt,
      reviewedAt: user.verificationData?.reviewedAt,
      reviewedBy: user.verificationData?.reviewedBy,
      rejectionReason: user.verificationData?.rejectionReason,
    }));

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
