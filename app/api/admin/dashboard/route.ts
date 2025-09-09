import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User, Project, Investment } from '@/models';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Fetch projects statistics
    const totalProjects = await Project.countDocuments();
    const activeProjects = await Project.countDocuments({ status: 'active' });
    const completedProjects = await Project.countDocuments({ status: 'completed' });
    const upcomingProjects = await Project.countDocuments({ status: 'upcoming' });

    // Calculate total raised and target amounts
    const projectStats = await Project.aggregate([
      {
        $group: {
          _id: null,
          totalRaised: { $sum: '$raisedAmount' },
          totalTarget: { $sum: '$targetAmount' }
        }
      }
    ]);

    const totalRaised = projectStats[0]?.totalRaised || 0;
    const totalTarget = projectStats[0]?.totalTarget || 0;

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
      .select('title location status raisedAmount targetAmount')
      .lean();

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
    const projectMilestones = recentProjects.slice(0, 3).map((project: any, index) => {
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
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
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
        recentProjects: recentProjects.map(project => ({
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
