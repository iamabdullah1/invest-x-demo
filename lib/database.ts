import connectDB from './mongodb';
import { User, Project, Investment, Transaction } from '../models';
import type { IUser, IProject, IInvestment, ITransaction } from '../models';

// Database service class for common operations
export class DatabaseService {
  // Ensure database connection (only call when needed)
  static async connect() {
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
    
    // Build query
    const query: any = {};
    if (filterQuery.status) query.status = filterQuery.status;
    if (filterQuery.city) query.city = filterQuery.city;
    if (filterQuery.type) query.type = filterQuery.type;
    if (filterQuery.featured !== undefined) query.featured = filterQuery.featured;
    
    const projects = await Project.find(query)
      .populate('createdBy', 'firstName lastName email')
      .sort({ featured: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Project.countDocuments(query);
    
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
    await this.connect();
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

  static async getUserInvestments(userId: string): Promise<IInvestment[]> {
    await this.connect();
    return await Investment.find({ userId })
      .populate('projectId', 'title location city type status expectedReturn')
      .sort({ investmentDate: -1 });
  }

  static async getProjectInvestments(projectId: string): Promise<IInvestment[]> {
    await this.connect();
    return await Investment.find({ projectId })
      .populate('userId', 'firstName lastName email')
      .sort({ investmentDate: -1 });
  }

  // Transaction operations
  static async createTransaction(transactionData: Partial<ITransaction>): Promise<ITransaction> {
    await this.connect();
    const transaction = new Transaction(transactionData);
    return await transaction.save();
  }

  static async findTransactionById(id: string): Promise<ITransaction | null> {
    await this.connect();
    return await Transaction.findById(id).populate('userId', 'firstName lastName email');
  }

  static async getUserTransactions(userId: string, status?: string): Promise<ITransaction[]> {
    await this.connect();
    const query: any = { userId };
    if (status) query.status = status;
    
    return await Transaction.find(query)
      .populate('projectId', 'title')
      .sort({ createdAt: -1 });
  }

  static async updateTransactionStatus(
    id: string, 
    status: string, 
    additionalData?: any
  ): Promise<ITransaction | null> {
    await this.connect();
    const updateData = { status, ...additionalData };
    
    if (status === 'completed') {
      updateData.completedAt = new Date();
    }
    
    return await Transaction.findByIdAndUpdate(id, updateData, { new: true });
  }

  // Analytics and statistics
  static async getDashboardStats(userId?: string) {
    await this.connect();
    
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
