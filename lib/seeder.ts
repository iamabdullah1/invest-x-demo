import { DatabaseService } from '../lib/database';
import { mockProjects } from '../lib/mockData';
import bcrypt from 'bcryptjs';
import type { IUser, IProject, IInvestment, ITransaction } from '../models';

// Database seeder to populate initial data
export class DatabaseSeeder {
  
  static async seedUsers() {
    console.log('🌱 Seeding users...');
    
    const users: Partial<IUser>[] = [
      {
        firstName: 'Ahmed',
        lastName: 'Khan',
        email: 'ahmed@example.com',
        phone: '+923001234567',
        password: await bcrypt.hash('investor123', 12),
        role: 'investor',
        isEmailVerified: true,
        city: 'Karachi',
        cnicNumber: '42101-1234567-1',
        totalInvested: 2500000,
        portfolioValue: 2750000,
        avatar: '/professional-pakistani-man.png'
      },
      {
        firstName: 'Sarah',
        lastName: 'Ali',
        email: 'sarah@investx.com',
        phone: '+923009876543',
        password: await bcrypt.hash('admin123', 12),
        role: 'admin',
        isEmailVerified: true,
        city: 'Lahore',
        cnicNumber: '35202-7654321-2',
        avatar: '/professional-pakistani-woman.png'
      },
      {
        firstName: 'Muhammad',
        lastName: 'Hassan',
        email: 'hassan@example.com',
        phone: '+923001111111',
        password: await bcrypt.hash('investor456', 12),
        role: 'investor',
        isEmailVerified: true,
        city: 'Islamabad',
        totalInvested: 1500000,
        portfolioValue: 1680000
      },
      {
        firstName: 'Fatima',
        lastName: 'Sheikh',
        email: 'fatima@example.com',
        phone: '+923002222222',
        password: await bcrypt.hash('investor789', 12),
        role: 'investor',
        isEmailVerified: true,
        city: 'Rawalpindi',
        totalInvested: 3200000,
        portfolioValue: 3520000
      }
    ];
    
    const createdUsers = [];
    for (const userData of users) {
      try {
        if (!userData.email) continue;
        const existingUser = await DatabaseService.findUserByEmail(userData.email);
        if (!existingUser) {
          const user = await DatabaseService.createUser(userData);
          createdUsers.push(user);
          console.log(`✅ Created user: ${user.email}`);
        } else {
          console.log(`⏭️  User already exists: ${userData.email}`);
          createdUsers.push(existingUser);
        }
      } catch (error) {
        console.error(`❌ Error creating user ${userData.email}:`, error);
      }
    }
    
    return createdUsers;
  }
  
  static async seedProjects(users: any[]) {
    console.log('🌱 Seeding projects...');
    
    const adminUser = users.find(u => u.role === 'admin');
    if (!adminUser) {
      console.error('❌ No admin user found for creating projects');
      return [];
    }
    
    const projectsData: Partial<IProject>[] = mockProjects.map(project => ({
      title: project.title,
      description: project.description,
      location: project.location,
      city: project.city as any,
      type: project.type,
      status: (project.status === 'active' ? 'active' : project.status === 'funded' ? 'funded' : 'completed') as 'active' | 'funded' | 'completed',
      targetAmount: project.targetAmount,
      raisedAmount: project.raisedAmount,
      minInvestment: project.minInvestment,
      expectedReturn: project.expectedReturn,
      duration: project.duration,
      startDate: new Date(project.startDate),
      endDate: new Date(project.endDate),
      fundingDeadline: new Date(new Date(project.endDate).getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days before end
      area: project.area,
      pricePerSqFt: project.pricePerSqFt,
      images: project.images,
      developer: {
        name: project.developer,
        experience: Math.floor(Math.random() * 15) + 5, // 5-20 years
        completedProjects: Math.floor(Math.random() * 20) + 3, // 3-23 projects
        rating: 4 + Math.random(), // 4.0-5.0 rating
        contact: {
          email: `contact@${project.developer.toLowerCase().replace(/\s+/g, '')}.com`,
          phone: '+9221' + Math.floor(Math.random() * 90000000 + 10000000),
          address: `${project.location}, ${project.city}`
        }
      },
      amenities: project.amenities,
      specifications: {
        bedrooms: project.type === 'residential' ? Math.floor(Math.random() * 3) + 2 : undefined,
        bathrooms: project.type === 'residential' ? Math.floor(Math.random() * 2) + 2 : undefined,
        parking: true,
        floor: Math.floor(Math.random() * 10) + 1
      },
      riskLevel: project.riskLevel,
      riskFactors: [
        'Market volatility',
        'Construction delays',
        'Regulatory changes',
        'Economic conditions'
      ].slice(0, Math.floor(Math.random() * 3) + 1),
      complianceStatus: {
        noc: true,
        environmentalClearance: Math.random() > 0.3,
        buildingApproval: true,
        utilityConnections: Math.random() > 0.2
      },
      totalInvestors: Math.floor(project.raisedAmount / project.minInvestment),
      createdBy: adminUser._id,
      approvedBy: adminUser._id,
      approvalDate: new Date(),
      tags: [project.type, project.city.toLowerCase(), project.riskLevel],
      featured: Math.random() > 0.7, // 30% chance of being featured
      views: Math.floor(Math.random() * 1000) + 100
    }));
    
    const createdProjects = [];
    for (const projectData of projectsData) {
      try {
        const project = await DatabaseService.createProject(projectData);
        createdProjects.push(project);
        console.log(`✅ Created project: ${project.title}`);
      } catch (error) {
        console.error(`❌ Error creating project ${projectData.title}:`, error);
      }
    }
    
    return createdProjects;
  }
  
  static async seedInvestments(users: any[], projects: any[]) {
    console.log('🌱 Seeding investments...');
    
    const investors = users.filter(u => u.role === 'investor');
    const activeProjects = projects.filter(p => p.status === 'active');
    
    const createdInvestments = [];
    
    for (const investor of investors) {
      // Each investor invests in 2-4 random projects
      const numInvestments = Math.floor(Math.random() * 3) + 2;
      const selectedProjects = activeProjects
        .sort(() => 0.5 - Math.random())
        .slice(0, numInvestments);
      
      for (const project of selectedProjects) {
        try {
          const investmentAmount = project.minInvestment * (Math.floor(Math.random() * 5) + 1);
          const shares = Math.floor(investmentAmount / 100000); // Assuming 1 share = PKR 100k
          const pricePerShare = 100000;
          const paymentMethods: ('bank_transfer' | 'online_banking' | 'wallet')[] = ['bank_transfer', 'online_banking', 'wallet'];
          const paymentMethod = paymentMethods[Math.floor(Math.random() * 3)];
          
          const investmentData: Partial<IInvestment> = {
            userId: investor._id,
            projectId: project._id,
            amount: investmentAmount,
            shares: shares,
            pricePerShare: pricePerShare,
            transactionId: `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`,
            paymentMethod: paymentMethod,
            paymentStatus: 'completed',
            expectedReturns: (investmentAmount * project.expectedReturn) / 100,
            currentValue: investmentAmount * (1 + (Math.random() * 0.1 - 0.05)), // ±5% variation
            maturityDate: new Date(project.endDate),
            status: 'active'
          };
          
          const investment = await DatabaseService.createInvestment(investmentData);
          createdInvestments.push(investment);
          console.log(`✅ Created investment: ${investor.firstName} -> ${project.title.substring(0, 30)}...`);
        } catch (error) {
          console.error(`❌ Error creating investment:`, error);
        }
      }
    }
    
    return createdInvestments;
  }
  
  static async seedTransactions(investments: any[]) {
    console.log('🌱 Seeding transactions...');
    
    const createdTransactions = [];
    
    for (const investment of investments) {
      try {
        const paymentGateways: ('easypaisa' | 'jazzcash' | 'bank')[] = ['easypaisa', 'jazzcash', 'bank'];
        const paymentGateway = paymentGateways[Math.floor(Math.random() * 3)];
        
        const transactionData: Partial<ITransaction> = {
          userId: investment.userId,
          transactionId: investment.transactionId,
          type: 'investment',
          amount: investment.amount,
          currency: 'PKR',
          status: 'completed',
          paymentMethod: investment.paymentMethod,
          paymentGateway: paymentGateway,
          projectId: investment.projectId,
          investmentId: investment._id,
          description: `Investment in project`,
          category: 'investment',
          fees: {
            platform: investment.amount * 0.02, // 2% platform fee
            payment: investment.amount * 0.005, // 0.5% payment fee
            tax: investment.amount * 0.01, // 1% tax
            total: investment.amount * 0.035 // 3.5% total fees
          },
          completedAt: investment.investmentDate
        };
        
        const transaction = await DatabaseService.createTransaction(transactionData);
        createdTransactions.push(transaction);
        console.log(`✅ Created transaction: ${transaction.transactionId}`);
      } catch (error) {
        console.error(`❌ Error creating transaction:`, error);
      }
    }
    
    return createdTransactions;
  }
  
  static async seedAll() {
    console.log('🚀 Starting database seeding...');
    
    try {
      const users = await this.seedUsers();
      const projects = await this.seedProjects(users);
      const investments = await this.seedInvestments(users, projects);
      const transactions = await this.seedTransactions(investments);
      
      console.log('\n✅ Database seeding completed successfully!');
      console.log(`📊 Summary:`);
      console.log(`   👥 Users: ${users.length}`);
      console.log(`   🏢 Projects: ${projects.length}`);
      console.log(`   💰 Investments: ${investments.length}`);
      console.log(`   💳 Transactions: ${transactions.length}`);
      
      return {
        users,
        projects,
        investments,
        transactions
      };
    } catch (error) {
      console.error('❌ Database seeding failed:', error);
      throw error;
    }
  }
}

export default DatabaseSeeder;
