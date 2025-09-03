# MongoDB Setup Guide for InvestX

## 🗄️ Database Setup Complete!

### ✅ What's Been Implemented:

#### 1. **Database Models**
- **User Model** (`models/User.ts`): Complete user management with authentication
- **Project Model** (`models/Project.ts`): Real estate projects with full details
- **Investment Model** (`models/Investment.ts`): User investments and portfolio tracking
- **Transaction Model** (`models/Transaction.ts`): Financial transaction history

#### 2. **Database Connection**
- **MongoDB Connection** (`lib/mongodb.ts`): Optimized connection with caching
- **Database Service** (`lib/database.ts`): High-level database operations
- **Database Seeder** (`lib/seeder.ts`): Sample data population

#### 3. **API Endpoints Created**
- `POST /api/admin/seed` - Populate database with sample data
- `GET /api/test/db` - Test database connectivity

---

## 🚀 Getting Started

### Step 1: Install MongoDB
Choose one of these options:

#### Option A: MongoDB Cloud (Atlas) - Recommended
1. Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster
4. Get your connection string
5. Update `.env.local` with your connection string:
```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/investx?retryWrites=true&w=majority
```

#### Option B: Local MongoDB
1. Download MongoDB from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Install MongoDB locally
3. Start MongoDB service
4. Use local connection string (already in `.env.local`):
```bash
MONGODB_URI=mongodb://localhost:27017/investx
```

### Step 2: Test Database Connection
```bash
# Start your Next.js development server
npm run dev

# Test database connectivity
curl http://localhost:3000/api/test/db
```

### Step 3: Seed Database with Sample Data
```bash
# Populate database with sample data
curl -X POST http://localhost:3000/api/admin/seed
```

---

## 📊 Database Schema Overview

### User Collection
```typescript
{
  firstName: string
  lastName: string
  email: string (unique)
  phone?: string
  password: string (hashed)
  role: 'guest' | 'investor' | 'admin'
  isEmailVerified: boolean
  totalInvested: number
  portfolioValue: number
  city?: string
  cnicNumber?: string
  // ... more fields
}
```

### Project Collection
```typescript
{
  title: string
  description: string
  location: string
  city: string
  type: 'residential' | 'commercial' | 'mixed'
  status: 'draft' | 'active' | 'funded' | 'completed' | 'cancelled'
  targetAmount: number
  raisedAmount: number
  minInvestment: number
  expectedReturn: number
  duration: number
  // ... more fields
}
```

### Investment Collection
```typescript
{
  userId: ObjectId (ref: User)
  projectId: ObjectId (ref: Project)
  amount: number
  shares: number
  transactionId: string
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded'
  currentValue: number
  status: 'active' | 'matured' | 'sold' | 'cancelled'
  // ... more fields
}
```

### Transaction Collection
```typescript
{
  userId: ObjectId (ref: User)
  transactionId: string (unique)
  type: 'investment' | 'withdrawal' | 'dividend' | 'refund' | 'fee' | 'bonus'
  amount: number
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  paymentMethod: 'bank_transfer' | 'online_banking' | 'wallet' | 'card'
  // ... more fields
}
```

---

## 🔧 Database Operations

### High-Level Database Service
The `DatabaseService` class provides easy-to-use methods:

```typescript
// User operations
await DatabaseService.createUser(userData)
await DatabaseService.findUserByEmail(email)
await DatabaseService.getAllUsers(page, limit)

// Project operations
await DatabaseService.createProject(projectData)
await DatabaseService.findProjectById(id)
await DatabaseService.getAllProjects(filters)

// Investment operations
await DatabaseService.createInvestment(investmentData)
await DatabaseService.getUserInvestments(userId)

// Analytics
await DatabaseService.getDashboardStats(userId)
```

---

## 📈 Sample Data

After seeding, you'll have:
- **4 Users**: 1 admin + 3 investors
- **Multiple Projects**: From different cities (Karachi, Lahore, Islamabad)
- **Investments**: Realistic investment distributions
- **Transactions**: Complete transaction history

### Default Users After Seeding:
- **Admin**: sarah@investx.com / admin123
- **Investor 1**: ahmed@example.com / investor123
- **Investor 2**: hassan@example.com / investor456
- **Investor 3**: fatima@example.com / investor789

---

## 🔒 Security Features

- **Password Hashing**: Using bcryptjs with salt rounds
- **Data Validation**: Mongoose schema validation
- **Indexes**: Optimized queries with proper indexing
- **Environment Variables**: Secure configuration

---

## 🚀 Next Steps

Now that MongoDB is set up, you can:

1. **Create API Endpoints**: Build CRUD operations for your features
2. **Update Frontend**: Connect React components to real database
3. **Add Authentication**: Implement JWT with database users
4. **Build Analytics**: Create dashboard with real data
5. **Add File Upload**: Implement image/document storage

Would you like me to help with any of these next steps?
