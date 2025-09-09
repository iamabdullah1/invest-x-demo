import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Project, Investment } from '@/models';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    console.log('Recommendations API: Starting request');
    await connectDB();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const riskTolerance = searchParams.get('riskTolerance') || 'all';
    const investmentAmount = parseInt(searchParams.get('investmentAmount') || '5000000');
    const preferredCity = searchParams.get('preferredCity') || 'all';
    const propertyType = searchParams.get('propertyType') || 'all';
    const duration = searchParams.get('duration') || 'all';

    // Get user information if authenticated (for personalized recommendations)
    let userId = null;
    const token = request.cookies.get('auth-token')?.value;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
        userId = decoded.userId;
      } catch (jwtError) {
        console.log('Recommendations API: JWT verification failed (continuing as guest)');
      }
    }

    // Build query filters
    let query: any = {
      status: 'active' // Only show active projects
    };

    // Filter by city if specified
    if (preferredCity !== 'all') {
      query.$or = [
        { 'location.city': new RegExp(preferredCity, 'i') },
        { city: new RegExp(preferredCity, 'i') }
      ];
    }

    // Filter by property type if specified
    if (propertyType !== 'all') {
      query.type = propertyType;
    }

    // Filter by duration if specified
    if (duration !== 'all') {
      const maxDuration = parseInt(duration);
      query.duration = { $lte: maxDuration };
    }

    console.log('Recommendations API: Query filters:', query);

    // Get projects from database
    const projects = await Project.find(query)
      .select('title location city type status targetAmount raisedAmount expectedReturn duration images description features category createdAt')
      .lean();

    console.log(`Recommendations API: Found ${projects.length} projects`);

    // Calculate additional fields and apply client-side filters
    let recommendations = projects.map(project => {
      // Calculate progress
      const progress = project.targetAmount > 0 ? 
        Math.min((project.raisedAmount / project.targetAmount) * 100, 100) : 0;

      // Calculate minimum investment (1% of target, minimum PKR 100,000, maximum PKR 5,000,000)
      const minInvestmentCalc = Math.max(
        100000, // Minimum PKR 1 Lakh
        Math.min(
          project.targetAmount * 0.01, // 1% of target
          5000000 // Maximum PKR 50 Lakh
        )
      );

      // Map risk level based on expected return and project status
      let riskLevel: 'low' | 'medium' | 'high' = 'medium';
      if (project.expectedReturn <= 10) {
        riskLevel = 'low';
      } else if (project.expectedReturn >= 18) {
        riskLevel = 'high';
      }

      return {
        _id: project._id,
        id: project._id.toString(),
        title: project.title,
        location: project.location?.address || `${project.location?.area}, ${project.location?.city}` || project.city || 'Location TBD',
        city: project.location?.city || project.city || 'Unknown',
        type: project.type,
        status: project.status,
        targetAmount: project.targetAmount,
        raisedAmount: project.raisedAmount,
        minInvestment: Math.round(minInvestmentCalc),
        expectedReturn: project.expectedReturn,
        duration: project.duration || 24, // Default 2 years
        images: project.images || ['/placeholder.svg'],
        description: project.description || 'No description available',
        riskLevel,
        progress: Math.round(progress),
        category: project.category || project.type,
        features: project.features || [],
        createdAt: project.createdAt
      };
    });

    // Apply client-side filters that can't be done in MongoDB query

    // Filter by risk tolerance
    if (riskTolerance !== 'all') {
      recommendations = recommendations.filter(project => project.riskLevel === riskTolerance);
    }

    // Filter by minimum investment amount
    recommendations = recommendations.filter(project => project.minInvestment <= investmentAmount);

    // Get user's existing investments to avoid recommending same projects
    let userInvestmentProjectIds: string[] = [];
    if (userId) {
      try {
        const userInvestments = await Investment.find({ userId })
          .select('projectId')
          .lean();
        userInvestmentProjectIds = userInvestments.map(inv => inv.projectId.toString());
      } catch (error) {
        console.log('Recommendations API: Error fetching user investments:', error);
      }
    }

    // Filter out projects user has already invested in
    if (userInvestmentProjectIds.length > 0) {
      recommendations = recommendations.filter(project => 
        !userInvestmentProjectIds.includes(project.id)
      );
    }

    // Sort recommendations by multiple criteria
    recommendations.sort((a, b) => {
      // Primary sort: Expected return (descending)
      if (a.expectedReturn !== b.expectedReturn) {
        return b.expectedReturn - a.expectedReturn;
      }
      
      // Secondary sort: Progress (ascending - prefer newer projects)
      if (a.progress !== b.progress) {
        return a.progress - b.progress;
      }
      
      // Tertiary sort: Creation date (descending - newer projects first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // Limit to top 20 recommendations
    recommendations = recommendations.slice(0, 20);

    console.log(`Recommendations API: Returning ${recommendations.length} recommendations`);

    return NextResponse.json({
      success: true,
      data: {
        recommendations,
        filters: {
          riskTolerance,
          investmentAmount,
          preferredCity,
          propertyType,
          duration
        },
        totalProjects: projects.length,
        filteredCount: recommendations.length
      }
    });

  } catch (error) {
    console.error('Recommendations API: Error occurred:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch recommendations', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
