import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { User, type IUser } from '@/models';
import connectDB from './mongodb';

// JWT payload interface
export interface JWTPayload {
  userId: string;
  email: string;
  role: 'guest' | 'investor' | 'admin';
  firstName: string;
  lastName: string;
  iat?: number;
  exp?: number;
}

// Role hierarchy for authorization
export const ROLE_HIERARCHY = {
  guest: 0,
  investor: 1,
  admin: 2
};

export class JWTAuthService {
  private static JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
  private static JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

  /**
   * Generate JWT token for user
   */
  static generateToken(user: IUser): string {
    const payload: JWTPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName
    };

    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN
    } as jwt.SignOptions);
  }

  /**
   * Verify and decode JWT token
   */
  static verifyToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as JWTPayload;
      return decoded;
    } catch (error) {
      console.error('JWT verification failed:', error);
      return null;
    }
  }

  /**
   * Extract token from request (from cookies or Authorization header)
   */
  static extractTokenFromRequest(request: NextRequest): string | null {
    // First try to get from HTTP-only cookie
    const cookieToken = request.cookies.get('auth-token')?.value;
    if (cookieToken) return cookieToken;

    // Fallback to Authorization header
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    return null;
  }

  /**
   * Get user from JWT token
   */
  static async getUserFromToken(token: string): Promise<IUser | null> {
    try {
      const payload = this.verifyToken(token);
      if (!payload) return null;

      await connectDB();
      const user = await User.findById(payload.userId).select('-password');
      return user;
    } catch (error) {
      console.error('Error getting user from token:', error);
      return null;
    }
  }

  /**
   * Get authenticated user from request
   */
  static async getAuthenticatedUser(request: NextRequest): Promise<IUser | null> {
    const token = this.extractTokenFromRequest(request);
    if (!token) return null;

    return await this.getUserFromToken(token);
  }

  /**
   * Check if user has required role or higher
   */
  static hasRequiredRole(userRole: string, requiredRole: string): boolean {
    const userRoleLevel = ROLE_HIERARCHY[userRole as keyof typeof ROLE_HIERARCHY] ?? 0;
    const requiredRoleLevel = ROLE_HIERARCHY[requiredRole as keyof typeof ROLE_HIERARCHY] ?? 0;
    
    return userRoleLevel >= requiredRoleLevel;
  }

  /**
   * Middleware function to require authentication
   */
  static async requireAuth(request: NextRequest): Promise<{ user: IUser | null; error?: string }> {
    const user = await this.getAuthenticatedUser(request);
    
    if (!user) {
      return { user: null, error: 'Authentication required' };
    }

    if (!user.isActive) {
      return { user: null, error: 'Account is inactive' };
    }

    return { user };
  }

  /**
   * Middleware function to require specific role
   */
  static async requireRole(
    request: NextRequest, 
    requiredRole: 'guest' | 'investor' | 'admin'
  ): Promise<{ user: IUser | null; error?: string }> {
    const { user, error } = await this.requireAuth(request);
    
    if (error || !user) {
      return { user: null, error: error || 'Authentication required' };
    }

    if (!this.hasRequiredRole(user.role, requiredRole)) {
      return { user: null, error: `${requiredRole} role required` };
    }

    return { user };
  }

  /**
   * Create session cookie options
   */
  static getCookieOptions() {
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: '/'
    };
  }

  /**
   * Refresh token if it's close to expiry
   */
  static shouldRefreshToken(payload: JWTPayload): boolean {
    if (!payload.exp) return false;
    
    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = payload.exp - now;
    const oneDay = 24 * 60 * 60;
    
    // Refresh if token expires in less than 1 day
    return timeUntilExpiry < oneDay;
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(userId: string): string {
    return jwt.sign({ userId, type: 'refresh' }, this.JWT_SECRET, {
      expiresIn: '30d' // Refresh tokens last longer
    });
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token: string): { userId: string } | null {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as any;
      if (decoded.type !== 'refresh') return null;
      return { userId: decoded.userId };
    } catch (error) {
      return null;
    }
  }
}

export default JWTAuthService;
