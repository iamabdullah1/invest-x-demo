import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { User, Project } from '@/models'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ 
        success: false, 
        message: 'Authentication required' 
      }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any
    const userId = decoded.userId

    await connectDB()
    
    // Find user with populated investments
    const user = await User.findById(userId).select('investments')
    
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    // Get all project IDs from user's investments
    const investmentProjectIds = user.investments.map(inv => inv.projectId)
    
    // If user has no investments, return empty portfolio
    if (investmentProjectIds.length === 0) {
      return NextResponse.json({
        success: true,
        portfolio: {
          investments: [],
          summary: {
            totalInvested: 0,
            totalCurrentValue: 0,
            totalReturns: 0,
            returnPercentage: 0
          },
          performance: []
        }
      })
    }
    
    // Fetch project details for all investments
    const projects = await Project.find({ _id: { $in: investmentProjectIds } })
    
    // Create portfolio data with project details
    const portfolioData = user.investments.map((investment, index) => {
      const project = projects.find(p => p._id.toString() === investment.projectId.toString())
      
      if (!project) return null
      
      // Calculate current value and returns (simplified calculation)
      // In real app, this would be based on actual project performance
      const monthsSinceInvestment = Math.floor(
        (Date.now() - new Date(investment.investedAt).getTime()) / (1000 * 60 * 60 * 24 * 30)
      )
      const monthlyReturnRate = project.expectedReturn / 100 / 12 // Convert annual to monthly
      const currentValue = investment.amount * (1 + (monthlyReturnRate * monthsSinceInvestment))
      const returns = currentValue - investment.amount
      
      return {
        id: `investment-${index}`,
        projectId: project._id,
        amount: investment.amount,
        investedAt: investment.investedAt,
        currentValue: Math.round(currentValue),
        returns: Math.round(returns),
        project: {
          _id: project._id,
          title: project.title,
          location: {
            city: project.city || 'N/A',
            area: project.location || 'N/A'
          },
          type: project.type,
          status: project.status,
          targetAmount: project.targetAmount,
          raisedAmount: project.raisedAmount,
          expectedReturn: project.expectedReturn,
          images: project.images || []
        }
      }
    }).filter(Boolean)

    // Calculate portfolio statistics
    const totalInvested = portfolioData.reduce((sum, inv) => sum + (inv?.amount || 0), 0)
    const totalCurrentValue = portfolioData.reduce((sum, inv) => sum + (inv?.currentValue || 0), 0)
    const totalReturns = totalCurrentValue - totalInvested
    const returnPercentage = totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0

    // Generate performance data for the last 6 months
    const performanceData = []
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const currentMonth = new Date().getMonth()
    
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12
      const monthProgress = (6 - i) / 6
      const estimatedValue = totalInvested + (totalReturns * monthProgress)
      
      performanceData.push({
        month: months[monthIndex],
        value: Math.round(estimatedValue)
      })
    }

    return NextResponse.json({
      success: true,
      portfolio: {
        investments: portfolioData,
        summary: {
          totalInvested,
          totalCurrentValue,
          totalReturns,
          returnPercentage
        },
        performance: performanceData
      }
    })

  } catch (error: any) {
    console.error('Portfolio API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      }, 
      { status: 500 }
    )
  }
}
