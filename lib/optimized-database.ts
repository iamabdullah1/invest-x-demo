// Enhanced database service with query optimization, caching, and performance monitoring
import { getCollection } from './db';
import { cache, CacheUtils, CACHE_DURATIONS } from './cache';
import { ObjectId } from 'mongodb';

interface QueryOptions {
  useCache?: boolean;
  cacheTTL?: number;
  fields?: any;
  lean?: boolean;
}

interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: any;
}

export class OptimizedDatabaseService {
  
  // Optimized user queries
  static async findUserByEmail(email: string, options: QueryOptions = {}): Promise<any> {
    const cacheKey = `user:email:${email}`;
    
    if (options.useCache !== false) {
      return CacheUtils.cacheQuery(
        cacheKey,
        async () => {
          const collection = await getCollection('users');
          const query = collection.findOne(
            { email },
            { projection: options.fields || {} }
          );
          return await query;
        },
        options.cacheTTL || CACHE_DURATIONS.USER_PROFILE
      );
    }

    const collection = await getCollection('users');
    return await collection.findOne(
      { email },
      { projection: options.fields || {} }
    );
  }

  static async findUserById(id: string, options: QueryOptions = {}): Promise<any> {
    const cacheKey = `user:id:${id}`;
    
    if (options.useCache !== false) {
      return CacheUtils.cacheQuery(
        cacheKey,
        async () => {
          const collection = await getCollection('users');
          return await collection.findOne(
            { _id: new ObjectId(id) },
            { projection: options.fields || {} }
          );
        },
        options.cacheTTL || CACHE_DURATIONS.USER_PROFILE
      );
    }

    const collection = await getCollection('users');
    return await collection.findOne(
      { _id: new ObjectId(id) },
      { projection: options.fields || {} }
    );
  }

  // Optimized project queries with caching
  static async getProjects(
    filters: any = {},
    pagination: PaginationOptions = {},
    options: QueryOptions = {}
  ): Promise<{ projects: any[]; total: number; page: number; totalPages: number }> {
    const page = pagination.page || 1;
    const limit = Math.min(pagination.limit || 20, 50); // Max 50 items per page
    const skip = (page - 1) * limit;
    const sort = pagination.sort || { createdAt: -1 };

    const cacheKey = CacheUtils.cachePaginatedQuery('projects', filters, page, limit, sort);

    const queryFn = async () => {
      const collection = await getCollection('projects');

      // Optimize filter - ensure indexed fields are used efficiently
      const optimizedFilter = this.optimizeProjectFilter(filters);

      // Use projection to limit data transfer
      const projection = options.fields || {
        title: 1,
        description: 1,
        location: 1,
        city: 1,
        type: 1,
        status: 1,
        featured: 1,
        images: 1,
        fundingTarget: 1,
        fundingRaised: 1,
        fundingDeadline: 1,
        createdAt: 1,
        slug: 1,
        developer: 1,
        // Exclude heavy fields by default
        'details.specifications': 0,
        'details.floorPlans': 0,
        'analytics': 0
      };

      const [projects, total] = await Promise.all([
        collection
          .find(optimizedFilter, { projection })
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .toArray(),
        collection.countDocuments(optimizedFilter)
      ]);

      return {
        projects,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    };

    if (options.useCache !== false) {
      return CacheUtils.cacheQuery(
        cacheKey,
        queryFn,
        options.cacheTTL || CACHE_DURATIONS.PROJECTS
      );
    }

    return queryFn();
  }

  // Optimize project filters for better index usage
  private static optimizeProjectFilter(filters: any): any {
    const optimized: any = {};

    // Ensure status filter uses indexed field efficiently
    if (filters.status) {
      if (Array.isArray(filters.status)) {
        optimized.status = { $in: filters.status };
      } else {
        optimized.status = filters.status;
      }
    } else {
      // Default to active projects only
      optimized.status = { $in: ['active', 'funded'] };
    }

    // City filter - ensure lowercase for consistency
    if (filters.city && filters.city !== 'all') {
      optimized.city = filters.city.toLowerCase();
    }

    // Type filter
    if (filters.type && filters.type !== 'all') {
      optimized.type = filters.type;
    }

    // Featured filter
    if (filters.featured === true || filters.featured === 'true') {
      optimized.featured = true;
    }

    // Search filter - use text index if available, otherwise regex
    if (filters.search) {
      optimized.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { location: { $regex: filters.search, $options: 'i' } },
        { 'developer.name': { $regex: filters.search, $options: 'i' } }
      ];
    }

    // Price range filter
    if (filters.minPrice || filters.maxPrice) {
      optimized.fundingTarget = {};
      if (filters.minPrice) {
        optimized.fundingTarget.$gte = parseInt(filters.minPrice);
      }
      if (filters.maxPrice) {
        optimized.fundingTarget.$lte = parseInt(filters.maxPrice);
      }
    }

    return optimized;
  }

  // Optimized verification queries
  static async getVerificationRequests(
    status?: string,
    pagination: PaginationOptions = {},
    options: QueryOptions = {}
  ): Promise<{ verifications: any[]; total: number; page: number; totalPages: number }> {
    const page = pagination.page || 1;
    const limit = Math.min(pagination.limit || 10, 50);
    const skip = (page - 1) * limit;

    const query: any = {};
    if (status && status !== 'all') {
      query.verificationStatus = status;
    } else {
      query.verificationStatus = { $ne: 'none' };
    }

    const cacheKey = CacheUtils.cachePaginatedQuery('users', query, page, limit, {
      'verificationData.submittedAt': -1
    });

    const queryFn = async () => {
      const collection = await getCollection('users');

      // Optimized projection - only fetch needed fields
      const projection = {
        firstName: 1,
        lastName: 1,
        email: 1,
        phone: 1,
        city: 1,
        verificationStatus: 1,
        'verificationData.verificationId': 1,
        'verificationData.address': 1,
        'verificationData.postalCode': 1,
        'verificationData.frontIdUrl': 1,
        'verificationData.backIdUrl': 1,
        'verificationData.submittedAt': 1,
        'verificationData.reviewedAt': 1,
        'verificationData.reviewedBy': 1,
        'verificationData.rejectionReason': 1,
        // Exclude sensitive data
        password: 0,
        refreshTokens: 0
      };

      const [users, total] = await Promise.all([
        collection
          .find(query, { projection })
          .sort({ 'verificationData.submittedAt': -1 })
          .skip(skip)
          .limit(limit)
          .toArray(),
        collection.countDocuments(query)
      ]);

      // Transform data
      const verifications = users.map(user => ({
        _id: user._id,
        verificationId: user.verificationData?.verificationId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        address: user.verificationData?.address,
        city: user.city,
        postalCode: user.verificationData?.postalCode,
        frontIdUrl: user.verificationData?.frontIdUrl,
        backIdUrl: user.verificationData?.backIdUrl,
        status: user.verificationStatus,
        submittedAt: user.verificationData?.submittedAt,
        reviewedAt: user.verificationData?.reviewedAt,
        reviewedBy: user.verificationData?.reviewedBy,
        rejectionReason: user.verificationData?.rejectionReason,
      }));

      return {
        verifications,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    };

    if (options.useCache !== false) {
      return CacheUtils.cacheQuery(
        cacheKey,
        queryFn,
        options.cacheTTL || CACHE_DURATIONS.VERIFICATION
      );
    }

    return queryFn();
  }

  // Cache invalidation helpers
  static invalidateUserCache(userId: string, email?: string): void {
    cache.delete(`user:id:${userId}`);
    if (email) {
      cache.delete(`user:email:${email}`);
    }
    // Invalidate user-related cached queries
    CacheUtils.invalidatePattern('users:.*');
  }

  static invalidateProjectCache(): void {
    CacheUtils.invalidatePattern('projects:.*');
  }

  static invalidateVerificationCache(): void {
    CacheUtils.invalidatePattern('users:.*');
  }

  // Bulk operations with optimized performance
  static async bulkUpdateUserStatus(
    userIds: string[], 
    status: string,
    additionalData?: any
  ): Promise<any> {
    const collection = await getCollection('users');
    
    const updateData: any = { verificationStatus: status };
    if (additionalData) {
      Object.assign(updateData, additionalData);
    }

    const result = await collection.updateMany(
      { _id: { $in: userIds.map(id => new ObjectId(id)) } },
      { $set: updateData }
    );

    // Invalidate cache for affected users
    userIds.forEach(id => this.invalidateUserCache(id));

    return result;
  }

  // Database performance monitoring
  static async getQueryPerformanceStats(): Promise<any> {
    try {
      const cacheStats = cache.getStats();
      return {
        cache: {
          size: cacheStats.size,
          keys: cacheStats.keys.length,
          hitRate: 'Monitoring not implemented yet' // Can be enhanced
        },
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error getting performance stats:', error);
      return null;
    }
  }
}
