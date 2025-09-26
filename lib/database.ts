import connectDB from './mongodb-optimized';
import { User, Project, Investment, Transaction } from '../models';
import type { IUser, IProject, IInvestment, ITransaction } from '../models';

// Database service class for common operations
export class DatabaseService {
  // Optimized database connection - uses connection pooling
  static async connect() {
    return await connectDB();
  }

  // Initialize connection once at startup
  private static async ensureConnection() {
    return await connectDB();
  }

  // User operations
  static async createUser(userData: Partial<IUser>): Promise<IUser> {
    const user = new User(userData);
    return await user.save();
  }

  static async findUserByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email: email.toLowerCase() }).select('+password');
  }

  static async findUserById(id: string): Promise<IUser | null> {
    return await User.findById(id);
  }

  static async updateUser(id: string, updates: Partial<IUser>): Promise<IUser | null> {
    return await User.findByIdAndUpdate(id, updates, { new: true });
  }

  static async getAllUsers(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const users = await User.find({ role: { $ne: 'admin' } })
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await User.countDocuments({ role: { $ne: 'admin' } });
    
    return {
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  // Project operations
  static async createProject(projectData: Partial<IProject>): Promise<IProject> {
    const project = new Project(projectData);
    return await project.save();
  }

  static async findProjectById(id: string): Promise<IProject | null> {
    return await Project.findById(id).populate('createdBy', 'firstName lastName email');
  }

  static async findProjectBySlug(slug: string): Promise<IProject | null> {
    return await Project.findOne({ slug }).populate('createdBy', 'firstName lastName email');
  }

  static async getAllProjects(filters: {
    status?: string;
    city?: string;
    type?: string;
    featured?: boolean;
    page?: number;
    limit?: number;
  } = {}) {
    const { page = 1, limit = 10, ...filterQuery } = filters;
    const skip = (page - 1) * limit;
    
    // Build optimized query
    const query: any = {};
    if (filterQuery.status) query.status = filterQuery.status;
    if (filterQuery.city) query.city = filterQuery.city;
    if (filterQuery.type) query.type = filterQuery.type;
    if (filterQuery.featured !== undefined) query.featured = filterQuery.featured;
    
    // Optimized parallel queries with selective field population
    const [projects, total] = await Promise.all([
      Project.find(query)
        .populate('createdBy', 'firstName lastName email') // Only needed user fields
        .select('title description location city type status targetAmount raisedAmount images featured expectedReturn fundingDeadline') // Only needed project fields
        .sort({ featured: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(), // Better performance for read-only operations
      Project.countDocuments(query)
    ]);
    
    return {
      projects,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async updateProject(id: string, updates: Partial<IProject>): Promise<IProject | null> {
    return await Project.findByIdAndUpdate(id, updates, { new: true });
  }

  static async incrementProjectViews(id: string): Promise<void> {
    await Project.findByIdAndUpdate(id, { $inc: { views: 1 } });
  }

  // Investment operations
  static async createInvestment(investmentData: Partial<IInvestment>): Promise<IInvestment> {
    await this.ensureConnection();
    const investment = new Investment(investmentData);
    
    // Start a transaction to ensure data consistency
    const session = await Investment.startSession();
    session.startTransaction();
    
    try {
      // Save the investment
      const savedInvestment = await investment.save({ session });
      
      // Update project raised amount and total investors
      await Project.findByIdAndUpdate(
        investmentData.projectId,
        {
          $inc: {
            raisedAmount: investmentData.amount || 0,
            totalInvestors: 1
          }
        },
        { session }
      );
      
      // Update user total invested
      await User.findByIdAndUpdate(
        investmentData.userId,
        {
          $inc: {
            totalInvested: investmentData.amount || 0
          }
        },
        { session }
      );
      
      await session.commitTransaction();
      return savedInvestment;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async getUserInvestments(userId: string, page: number = 1, limit: number = 20): Promise<{
    investments: IInvestment[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    
    // Optimized query with pagination and selective field population
    const [investments, total] = await Promise.all([
      Investment.find({ userId })
        .populate('projectId', 'title location city type status expectedReturn targetAmount raisedAmount') // Only needed fields
        .sort({ investmentDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(), // Use lean() for better performance when no document methods needed
      Investment.countDocuments({ userId })
    ]);

    return {
      investments,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async getProjectInvestments(projectId: string, page: number = 1, limit: number = 50): Promise<{
    investments: IInvestment[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    
    // Optimized query with pagination and selective field population
    const [investments, total] = await Promise.all([
      Investment.find({ projectId })
        .populate('userId', 'firstName lastName email avatar') // Only needed fields
        .sort({ investmentDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(), // Use lean() for better performance
      Investment.countDocuments({ projectId })
    ]);

    return {
      investments,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  // Transaction operations
  static async createTransaction(transactionData: Partial<ITransaction>): Promise<ITransaction> {
    const transaction = new Transaction(transactionData);
    return await transaction.save();
  }

  static async findTransactionById(id: string): Promise<ITransaction | null> {
    return await Transaction.findById(id)
      .populate('userId', 'firstName lastName email')
      .lean();
  }

  static async getUserTransactions(
    userId: string, 
    status?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<ITransaction[]> {
    const query: any = { userId };
    if (status) query.status = status;
    
    const skip = (page - 1) * limit;
    
    return await Transaction.find(query)
      .populate('projectId', 'title image')
      .select('amount type status createdAt projectId description')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }

  static async updateTransactionStatus(
    id: string, 
    status: string, 
    additionalData?: any
  ): Promise<ITransaction | null> {
    const updateData = { status, ...additionalData };
    
    if (status === 'completed') {
      updateData.completedAt = new Date();
    }
    
    return await Transaction.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, select: 'status amount type completedAt' }
    ).lean();
  }

  // Analytics and statistics
  static async getDashboardStats(userId?: string) {
    await this.ensureConnection();
    
    const [userStats, projectStats, investmentStats, transactionStats] = await Promise.all([
      // User statistics
      User.aggregate([
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 },
            totalInvested: { $sum: '$totalInvested' }
          }
        }
      ]),
      
      // Project statistics
      Project.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalTarget: { $sum: '$targetAmount' },
            totalRaised: { $sum: '$raisedAmount' }
          }
        }
      ]),
      
      // Investment statistics
      Investment.aggregate([
        ...(userId ? [{ $match: { userId: userId } }] : []),
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
            totalCurrentValue: { $sum: '$currentValue' }
          }
        }
      ]),
      
      // Transaction statistics
      Transaction.aggregate([
        ...(userId ? [{ $match: { userId: userId } }] : []),
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' }
          }
        }
      ])
    ]);
    
    return {
      users: userStats,
      projects: projectStats,
      investments: investmentStats,
      transactions: transactionStats
    };
  }

  // Search functionality
  static async searchProjects(query: string, filters: any = {}) {
    await this.connect();
    
    const searchQuery = {
      $and: [
        {
          $or: [
            { title: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } },
            { location: { $regex: query, $options: 'i' } },
            { city: { $regex: query, $options: 'i' } },
            { tags: { $in: [new RegExp(query, 'i')] } }
          ]
        },
        { status: 'active' },
        ...Object.entries(filters).map(([key, value]) => ({ [key]: value }))
      ]
    };
    
    return await Project.find(searchQuery)
      .populate('createdBy', 'firstName lastName')
      .sort({ featured: -1, views: -1 })
      .limit(20);
  }
}

export default DatabaseService;
