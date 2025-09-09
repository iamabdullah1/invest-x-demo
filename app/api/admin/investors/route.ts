import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User, Investment } from '@/models';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const city = searchParams.get('city');
    const search = searchParams.get('search');

    // Build filter query
    const filter: any = {
      role: { $in: ['investor', 'admin'] } // Include both investors and admins
    };

    // Add status filter if provided
    if (status && status !== 'all') {
      if (status === 'active') {
        filter.isActive = true;
        filter.verificationStatus = 'approved';
      } else if (status === 'pending') {
        filter.verificationStatus = 'pending';
      } else if (status === 'suspended') {
        filter.isActive = false;
      }
    }

    // Add city filter if provided
    if (city && city !== 'all') {
      filter.city = new RegExp(city, 'i');
    }

    // Add search filter if provided
    if (search) {
      filter.$or = [
        { firstName: new RegExp(search, 'i') },
        { lastName: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { phone: new RegExp(search, 'i') }
      ];
    }

    // Fetch investors from database
    const investors = await User.find(filter)
      .select('-password')
      .sort({ joinDate: -1 })
      .lean();

    // Calculate additional stats for each investor
    const investorsWithStats = await Promise.all(
      investors.map(async (investor) => {
        // Get active investments count
        const activeInvestments = await Investment.countDocuments({
          userId: investor._id,
          status: 'active'
        });

        return {
          id: investor._id,
          name: `${investor.firstName} ${investor.lastName}`,
          email: investor.email,
          phone: investor.phone || 'N/A',
          city: investor.city || 'N/A',
          joinDate: investor.joinDate,
          totalInvested: investor.totalInvested || 0,
          portfolioValue: investor.portfolioValue || 0,
          activeInvestments,
          status: investor.isActive && investor.verificationStatus === 'approved' ? 'active' : 
                  investor.verificationStatus === 'pending' ? 'pending' : 'suspended',
          verificationStatus: investor.verificationStatus || 'none',
          role: investor.role,
          avatar: investor.avatar,
          isEmailVerified: investor.isEmailVerified,
          lastLogin: investor.lastLogin
        };
      })
    );

    // Calculate summary stats
    const totalInvestors = investorsWithStats.length;
    const activeInvestors = investorsWithStats.filter(inv => inv.status === 'active').length;
    const pendingInvestors = investorsWithStats.filter(inv => inv.status === 'pending').length;
    const totalInvested = investorsWithStats.reduce((sum, inv) => sum + inv.totalInvested, 0);

    return NextResponse.json({
      success: true,
      data: {
        investors: investorsWithStats,
        stats: {
          totalInvestors,
          activeInvestors,
          pendingInvestors,
          totalInvested
        }
      }
    });

  } catch (error) {
    console.error('Error fetching investors:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch investors' },
      { status: 500 }
    );
  }
}
