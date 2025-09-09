const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/invest-x-demo';

// Models (simplified for seeding)
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  firstName: String,
  lastName: String,
  role: { type: String, default: 'investor' },
  createdAt: { type: Date, default: Date.now }
});

const projectSchema = new mongoose.Schema({
  title: String,
  location: {
    city: String,
    area: String,
    address: String
  },
  targetAmount: Number,
  raisedAmount: Number,
  expectedReturn: Number,
  status: String,
  images: [String],
  createdAt: { type: Date, default: Date.now }
});

const investmentSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  projectId: mongoose.Schema.Types.ObjectId,
  amount: Number,
  status: { type: String, default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Project = mongoose.model('Project', projectSchema);
const Investment = mongoose.model('Investment', investmentSchema);

async function seedTestData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing test data
    await User.deleteMany({ email: 'test.investor@example.com' });
    await Investment.deleteMany({});
    
    // Create test user
    const hashedPassword = await bcrypt.hash('password123', 12);
    const testUser = await User.create({
      email: 'test.investor@example.com',
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'Investor',
      role: 'investor'
    });

    console.log('Created test user:', testUser.email);

    // Get first 3 projects for test investments
    const projects = await Project.find().limit(3);
    
    if (projects.length > 0) {
      // Create test investments
      const investments = [];
      for (let i = 0; i < projects.length; i++) {
        investments.push({
          userId: testUser._id,
          projectId: projects[i]._id,
          amount: [50000, 75000, 30000][i],
          status: 'active'
        });
      }

      await Investment.insertMany(investments);
      console.log(`Created ${investments.length} test investments`);
    } else {
      console.log('No projects found to create investments');
    }

    console.log('Test data seeded successfully!');
    console.log('Test user credentials:');
    console.log('Email: test.investor@example.com');
    console.log('Password: password123');
    
  } catch (error) {
    console.error('Error seeding test data:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seedTestData();
