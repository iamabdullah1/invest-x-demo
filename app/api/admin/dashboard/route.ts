import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User, Project, Investment, InventoryCategory } from '@/models';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Fetch projects statistics
    const totalProjects = await Project.countDocuments();
    const activeProjects = await Project.countDocuments({ status: 'active' });
    const completedProjects = await Project.countDocuments({ status: 'completed' });
    const upcomingProjects = await Project.countDocuments({ status: 'upcoming' });

    // Calculate total raised and target amounts from inventory categories
    const inventoryStats = await InventoryCategory.aggregate([
      {
        $group: {
          _id: null,
          totalRaised: { $sum: { $multiply: ['$price', '$tokensAvailable'] } },
          totalTarget: { $sum: { $multiply: ['$price', '$totalTokens'] } }
        }
      }
    ]);

    const totalRaised = inventoryStats[0]?.totalRaised || 0;
    const totalTarget = inventoryStats[0]?.totalTarget || 0;

    // Fetch investor statistics
    const totalInvestors = await User.countDocuments({ 
      role: { $in: ['investor', 'admin'] } 
    });
    const activeInvestors = await User.countDocuments({ 
      role: { $in: ['investor', 'admin'] },
      isActive: true,
      verificationStatus: 'approved'
    });
    const pendingApprovals = await User.countDocuments({ 
      verificationStatus: 'pending' 
    });

    // Get recent projects for project overview
    const recentProjects = await Project.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title location status _id')
      .lean();

    // Get inventory data for these projects
    const projectIds = recentProjects.map(p => p._id);
    const inventoryData = await InventoryCategory.find({ projectId: { $in: projectIds } })
      .select('projectId price tokensAvailable totalTokens')
      .lean();

    // Calculate raised and target amounts for each project
    const projectsWithFinancials = recentProjects.map(project => {
      const projectInventory = inventoryData.filter(inv => inv.projectId.toString() === project._id.toString());
      const raisedAmount = projectInventory.reduce((sum, inv) => sum + (inv.price * inv.tokensAvailable), 0);
      const targetAmount = projectInventory.reduce((sum, inv) => sum + (inv.price * inv.totalTokens), 0);

      return {
        ...project,
        raisedAmount,
        targetAmount
      };
    });

    // Get recent activity (investments)
    const recentInvestments = await Investment.find()
      .populate('userId', 'firstName lastName')
      .populate('projectId', 'title')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Format recent activity
    const recentActivity = recentInvestments.map((investment: any, index) => {
      const timeAgo = getTimeAgo(investment.createdAt);
      const userName = investment.userId ? 
        `${investment.userId.firstName} ${investment.userId.lastName}` : 
        'Unknown User';
      const projectTitle = investment.projectId?.title || 'Unknown Project';
      
      return {
        id: investment._id.toString(),
        type: 'investment',
        message: `${userName} invested ${formatCurrency(investment.amount)} in ${projectTitle}`,
        time: timeAgo,
        status: 'success'
      };
    });

    // Add project milestones to activity
    const projectMilestones = projectsWithFinancials.slice(0, 3).map((project: any, index) => {
      const progress = project.targetAmount > 0 ?
        (project.raisedAmount / project.targetAmount) * 100 : 0;

      let message = '';
      let status = 'info';

      if (progress >= 100) {
        message = `${project.title} reached 100% funding`;
        status = 'success';
      } else if (progress >= 75) {
        message = `${project.title} reached ${Math.round(progress)}% funding`;
        status = 'success';
      } else if (progress >= 50) {
        message = `${project.title} reached ${Math.round(progress)}% funding`;
        status = 'info';
      }

      return message ? {
        id: `project-${project._id}`,
        type: 'project',
        message,
        time: getTimeAgo(project.createdAt),
        status
      } : null;
    }).filter(Boolean);

    // Combine and sort activities
    const allActivity = [...recentActivity, ...projectMilestones]
      .filter(activity => activity && activity.time)
      .sort((a, b) => {
        if (!a || !b || !a.time || !b.time) return 0;
        const timeA = new Date(a.time).getTime();
        const timeB = new Date(b.time).getTime();
        return timeB - timeA;
      })
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalProjects,
          activeProjects,
          completedProjects,
          upcomingProjects,
          totalRaised,
          totalTarget,
          totalInvestors,
          activeInvestors,
          pendingApprovals
        },
        recentProjects: projectsWithFinancials.map(project => ({
          ...project,
          progress: project.targetAmount > 0 ?
            Math.min((project.raisedAmount / project.targetAmount) * 100, 100) : 0
        })),
        recentActivity: allActivity
      }
    });

  } catch (error) {
    console.error('Error fetching admin dashboard data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

function getTimeAgo(date: string | Date): string {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
