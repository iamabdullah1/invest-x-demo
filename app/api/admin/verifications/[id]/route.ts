import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';
import { InvestorVerification, User } from '@/models';
import JWTAuthService from '@/lib/jwtAuth';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await DatabaseService.connect();

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

    // Find the verification request
    const verification = await InvestorVerification.findById(id);
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
    verification.status = action === 'approve' ? 'approved' : 'rejected';
    verification.reviewedAt = new Date();
    verification.reviewedBy = `${user.firstName} ${user.lastName}`;
    if (rejectionReason) verification.rejectionReason = rejectionReason;
    if (notes) verification.notes = notes;

    await verification.save();

    // If approved, update user role to investor
    if (action === 'approve') {
      const existingUser = await User.findOne({ email: verification.email });
      if (existingUser && existingUser.role === 'guest') {
        existingUser.role = 'investor';
        existingUser.isEmailVerified = true;
        await existingUser.save();
        console.log(`👤 User ${verification.email} upgraded to investor role`);
      }
    }

    console.log(`✅ Verification ${action}d by admin ${user.email} for ${verification.email}`);

    return NextResponse.json({
      success: true,
      message: `Verification ${action}d successfully`,
      verification: {
        id: verification._id,
        status: verification.status,
        reviewedAt: verification.reviewedAt,
        reviewedBy: verification.reviewedBy
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
