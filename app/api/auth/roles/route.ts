import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const roles = [
      {
        value: 'guest',
        label: 'Guest',
        description: 'Browse and explore properties',
        permissions: ['view_projects', 'browse_marketplace'],
        icon: 'Users'
      },
      {
        value: 'investor',
        label: 'Investor', 
        description: 'Invest in real estate projects',
        permissions: ['view_projects', 'invest', 'portfolio_management', 'dashboard_access'],
        icon: 'UserCheck'
      },
      {
        value: 'admin',
        label: 'Administrator',
        description: 'Full system access and management',
        permissions: ['all_permissions'],
        icon: 'Shield',
        note: 'Admin accounts can only be created by existing administrators'
      }
    ];

    return NextResponse.json({
      success: true,
      roles,
      message: 'Available user roles retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch roles' },
      { status: 500 }
    );
  }
}
