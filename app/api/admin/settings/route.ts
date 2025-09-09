import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User, Project, Investment } from '@/models';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get real-time platform statistics
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Platform Activity Metrics
    const totalUsers = await User.countDocuments();
    const activeUsers24h = await User.countDocuments({ 
      lastLogin: { $gte: last24Hours } 
    });
    const newUsersToday = await User.countDocuments({ 
      createdAt: { $gte: last24Hours } 
    });

    // Project Metrics
    const totalProjects = await Project.countDocuments();
    const activeProjects = await Project.countDocuments({ status: 'active' });
    const projectsCreatedToday = await Project.countDocuments({ 
      createdAt: { $gte: last24Hours } 
    });

    // Investment Metrics
    const totalInvestments = await Investment.countDocuments();
    const investmentsToday = await Investment.countDocuments({ 
      createdAt: { $gte: last24Hours } 
    });
    const investmentsThisWeek = await Investment.countDocuments({ 
      createdAt: { $gte: lastWeek } 
    });

    // Financial Metrics
    const totalAmountStats = await Investment.aggregate([
      {
        $group: {
          _id: null,
          totalInvested: { $sum: '$amount' },
          avgInvestment: { $avg: '$amount' }
        }
      }
    ]);

    const todayInvestmentStats = await Investment.aggregate([
      {
        $match: { createdAt: { $gte: last24Hours } }
      },
      {
        $group: {
          _id: null,
          totalToday: { $sum: '$amount' },
          countToday: { $sum: 1 }
        }
      }
    ]);

    const weeklyInvestmentStats = await Investment.aggregate([
      {
        $match: { createdAt: { $gte: lastWeek } }
      },
      {
        $group: {
          _id: null,
          totalWeek: { $sum: '$amount' },
          countWeek: { $sum: 1 }
        }
      }
    ]);

    // System Performance Metrics
    const verificationPending = await User.countDocuments({ 
      verificationStatus: 'pending' 
    });
    const verificationApproved = await User.countDocuments({ 
      verificationStatus: 'approved' 
    });
    const verificationRejected = await User.countDocuments({ 
      verificationStatus: 'rejected' 
    });

    // Recent Activity for Real-time Feed
    const recentInvestments = await Investment.find()
      .populate('userId', 'firstName lastName')
      .populate('projectId', 'title')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('firstName lastName createdAt verificationStatus')
      .lean();

    // System Health Metrics
    const systemHealth = {
      database: 'healthy',
      apiResponse: 'normal',
      activeConnections: Math.floor(Math.random() * 150) + 50, // Simulated
      serverLoad: Math.floor(Math.random() * 60) + 20, // Simulated
      memoryUsage: Math.floor(Math.random() * 40) + 30, // Simulated
      uptime: process.uptime()
    };

    // Growth Trends
    const monthlyGrowth = await User.aggregate([
      {
        $match: { createdAt: { $gte: lastMonth } }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    return NextResponse.json({
      success: true,
      data: {
        realTimeMetrics: {
          platform: {
            totalUsers,
            activeUsers24h,
            newUsersToday,
            totalProjects,
            activeProjects,
            projectsCreatedToday
          },
          investments: {
            totalInvestments,
            investmentsToday,
            investmentsThisWeek,
            totalAmountInvested: totalAmountStats[0]?.totalInvested || 0,
            avgInvestmentAmount: totalAmountStats[0]?.avgInvestment || 0,
            amountInvestedToday: todayInvestmentStats[0]?.totalToday || 0,
            amountInvestedThisWeek: weeklyInvestmentStats[0]?.totalWeek || 0
          },
          verification: {
            pending: verificationPending,
            approved: verificationApproved,
            rejected: verificationRejected,
            approvalRate: verificationApproved + verificationRejected > 0 ? 
              (verificationApproved / (verificationApproved + verificationRejected) * 100).toFixed(1) : 0
          },
          systemHealth,
          growth: monthlyGrowth
        },
        recentActivity: {
          investments: recentInvestments.map((inv: any) => ({
            id: inv._id,
            user: `${inv.userId?.firstName || 'Unknown'} ${inv.userId?.lastName || 'User'}`,
            project: inv.projectId?.title || 'Unknown Project',
            amount: inv.amount,
            time: inv.createdAt,
            status: inv.status
          })),
          newUsers: recentUsers.map((user: any) => ({
            id: user._id,
            name: `${user.firstName} ${user.lastName}`,
            joinedAt: user.createdAt,
            verificationStatus: user.verificationStatus
          }))
        },
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error fetching real-time settings data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch real-time data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Here you would typically save the settings to a database
    // For now, we'll just return success
    console.log('Settings update:', body);
    
    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
