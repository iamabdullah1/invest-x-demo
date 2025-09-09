import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User, Investment, Project } from '@/models';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    console.log('Dashboard API: Starting request');
    await connectDB();

    // Get token from cookies or Authorization header
    const token = request.cookies.get('auth-token')?.value || 
                 request.headers.get('authorization')?.replace('Bearer ', '');

    console.log('Dashboard API: Token found:', !!token);

    if (!token) {
      console.log('Dashboard API: No token provided');
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify and decode the token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      console.log('Dashboard API: Token verified for userId:', decoded.userId);
    } catch (jwtError) {
      console.log('Dashboard API: JWT verification failed:', jwtError);
      return NextResponse.json(
        { success: false, error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    const userId = decoded.userId;

    // Get user's investments
    const userInvestments = await Investment.find({ userId })
      .populate('projectId', 'title location targetAmount raisedAmount expectedReturn duration status images')
      .sort({ createdAt: -1 })
      .lean();

    // Calculate portfolio statistics
    const totalInvested = userInvestments.reduce((sum, inv) => sum + inv.amount, 0);
    
    // For current value calculation, we'll use a simple formula based on project progress and expected returns
    let totalCurrentValue = 0;
    let totalReturns = 0;

    const investmentDetails = userInvestments.map((investment: any) => {
      const project = investment.projectId;
      
      if (!project) {
        return {
          ...investment,
          currentValue: investment.amount,
          returns: 0,
          projectTitle: 'Unknown Project',
          projectProgress: 0
        };
      }

      // Calculate current value based on project progress and time elapsed
      const projectProgress = project.targetAmount > 0 ? 
        Math.min((project.raisedAmount / project.targetAmount) * 100, 100) : 0;
      
      // Simple calculation: if project is fully funded, apply some returns based on time
      const monthsElapsed = Math.max(1, 
        Math.floor((Date.now() - new Date(investment.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30))
      );
      
      let currentValue = investment.amount;
      let returns = 0;
      
      if (projectProgress >= 100) {
        // Project is funded, calculate some returns
        const expectedAnnualReturn = project.expectedReturn / 100;
        const timeBasedReturn = (expectedAnnualReturn * monthsElapsed) / 12;
        returns = investment.amount * Math.min(timeBasedReturn, expectedAnnualReturn * 2); // Cap at 2x expected
        currentValue = investment.amount + returns;
      } else if (projectProgress >= 50) {
        // Project is progressing, small gains
        returns = investment.amount * 0.02 * (projectProgress / 100); // 2% max based on progress
        currentValue = investment.amount + returns;
      }

      totalCurrentValue += currentValue;
      totalReturns += returns;

      return {
        ...investment,
        currentValue: Math.round(currentValue),
        returns: Math.round(returns),
        projectTitle: project.title,
        projectProgress: Math.round(projectProgress),
        projectLocation: project.location,
        projectStatus: project.status
      };
    });

    const activeInvestments = investmentDetails.filter(inv => 
      inv.projectStatus === 'active' || inv.projectStatus === 'funded'
    ).length;

    // Get featured projects (excluding ones user already invested in)
    const investedProjectIds = userInvestments.map(inv => inv.projectId?._id?.toString()).filter(Boolean);
    
    const featuredProjects = await Project.find({
      _id: { $nin: investedProjectIds },
      status: 'active'
    })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();

    console.log('Dashboard API: Returning data successfully');
    return NextResponse.json({
      success: true,
      data: {
        portfolio: {
          totalInvested: Math.round(totalInvested),
          totalCurrentValue: Math.round(totalCurrentValue),
          totalReturns: Math.round(totalReturns),
          returnPercentage: totalInvested > 0 ? ((totalReturns / totalInvested) * 100) : 0,
          activeInvestments
        },
        investments: investmentDetails,
        featuredProjects: featuredProjects.map(project => ({
          ...project,
          progress: project.targetAmount > 0 ? 
            Math.min((project.raisedAmount / project.targetAmount) * 100, 100) : 0
        }))
      }
    });

  } catch (error) {
    console.error('Dashboard API: Error occurred:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
