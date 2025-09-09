import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';
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

    // Rejection reason is now optional

    // Get the users collection
    const usersCollection = await getCollection('users');

    // Find the user by ID
    const targetUser = await usersCollection.findOne({ _id: new ObjectId(id) });
    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (targetUser.verificationStatus !== 'pending') {
      return NextResponse.json(
        { error: 'This verification has already been processed' },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {
      verificationStatus: action === 'approve' ? 'approved' : 'rejected',
      updatedAt: new Date(),
      'verificationData.reviewedAt': new Date(),
      'verificationData.reviewedBy': `${user.firstName} ${user.lastName}`,
    };

    // If approved, also update the role to investor
    if (action === 'approve') {
      updateData.role = 'investor';
    }

    if (rejectionReason) {
      updateData['verificationData.rejectionReason'] = rejectionReason;
    }

    if (notes) {
      updateData['verificationData.notes'] = notes;
    }

    // Update the user
    const updateResult = await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (updateResult.matchedCount === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Verification ${action}d successfully`,
      verification: {
        id: id,
        status: updateData.verificationStatus,
        reviewedAt: updateData['verificationData.reviewedAt'],
        reviewedBy: updateData['verificationData.reviewedBy'],
        userRole: action === 'approve' ? 'investor' : targetUser.role
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

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Get the users collection
    const usersCollection = await getCollection('users');

    // Find the user by ID
    const targetUser = await usersCollection.findOne({ _id: new ObjectId(id) });
    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if verification is approved - prevent deletion
    if (targetUser.verificationStatus === 'approved') {
      return NextResponse.json(
        { error: 'Cannot delete approved verification requests. Approved investors cannot have their verification status revoked.' },
        { status: 400 }
      );
    }

    // Reset verification data and status to 'none'
    const updateResult = await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: {
          verificationStatus: 'none',
          updatedAt: new Date()
        },
        $unset: {
          verificationData: 1 // Remove the entire verificationData object
        }
      }
    );

    if (updateResult.matchedCount === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Verification request deleted successfully',
      verification: {
        id: id,
        status: 'deleted',
        deletedAt: new Date(),
        deletedBy: `${user.firstName} ${user.lastName}`
      }
    });

  } catch (error: any) {
    console.error('Error deleting verification:', error);
    return NextResponse.json(
      { error: 'Failed to delete verification request' },
      { status: 500 }
    );
  }
}
