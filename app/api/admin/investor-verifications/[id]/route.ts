import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';
import JWTAuthService from '@/lib/jwtAuth';
import { ObjectId } from 'mongodb';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify admin authentication
    const { user, error } = await JWTAuthService.requireAuth(request);
    if (error || !user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { id } = params;
    const { action, rejectionReason, notes } = await request.json();

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be approve or reject' },
        { status: 400 }
      );
    }

    if (action === 'reject' && !rejectionReason) {
      return NextResponse.json(
        { error: 'Rejection reason is required when rejecting' },
        { status: 400 }
      );
    }

    await DatabaseService.connect();

    // Use your colleague's collection structure
    const db = await DatabaseService.connect();
    const collection = db.collection('investor_verifications');

    // Find the verification request
    const verification = await collection.findOne({ _id: new ObjectId(id) });
    if (!verification) {
      return NextResponse.json(
        { error: 'Verification request not found' },
        { status: 404 }
      );
    }

    if (verification.status !== 'pending') {
      return NextResponse.json(
        { error: 'This verification has already been processed' },
        { status: 400 }
      );
    }

    // Update verification status
    const updateData: any = {
      status: action === 'approve' ? 'approved' : 'rejected',
      reviewedAt: new Date(),
      reviewedBy: `${user.firstName} ${user.lastName}`,
      updatedAt: new Date()
    };

    if (rejectionReason) updateData.rejectionReason = rejectionReason;
    if (notes) updateData.notes = notes;

    await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    // If approved, your colleague's backend will handle user role upgrade
    
    console.log(`✅ Verification ${action}d by admin ${user.email} for verification ID: ${id}`);

    return NextResponse.json({
      success: true,
      message: `Verification ${action}d successfully`,
      verification: {
        id: id,
        status: updateData.status,
        reviewedAt: updateData.reviewedAt,
        reviewedBy: updateData.reviewedBy
      }
    });

  } catch (error: any) {
    console.error('Error processing verification:', error);
    return NextResponse.json(
      { error: 'Failed to process verification' },
      { status: 500 }
    );
  }
}
