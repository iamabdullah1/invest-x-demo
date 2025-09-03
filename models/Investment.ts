import mongoose, { Document, Model, Schema } from 'mongoose';

// Investment interface extending Document for TypeScript
export interface IInvestment extends Document {
  _id: string;
  userId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  
  // Investment details
  amount: number;
  shares: number;
  pricePerShare: number;
  
  // Transaction details
  transactionId: string;
  paymentMethod: 'bank_transfer' | 'online_banking' | 'wallet' | 'card';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  
  // Investment timeline
  investmentDate: Date;
  maturityDate: Date;
  
  // Returns and performance
  expectedReturns: number;
  actualReturns?: number;
  currentValue: number;
  profitLoss: number;
  
  // Status tracking
  status: 'active' | 'matured' | 'sold' | 'cancelled';
  
  // Exit details (for sold investments)
  exitDate?: Date;
  exitAmount?: number;
  exitReason?: string;
  
  // Documents and receipts
  documents: {
    name: string;
    url: string;
    type: 'receipt' | 'certificate' | 'statement' | 'contract';
    uploadDate: Date;
  }[];
  
  // Methods
  calculateCurrentValue(): number;
  calculateReturns(): number;
  isMatured(): boolean;
}

// Investment schema
const investmentSchema = new Schema<IInvestment>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project ID is required']
  },
  amount: {
    type: Number,
    required: [true, 'Investment amount is required'],
    min: [100000, 'Minimum investment is PKR 1 Lakh']
  },
  shares: {
    type: Number,
    required: [true, 'Number of shares is required'],
    min: [1, 'Minimum 1 share is required']
  },
  pricePerShare: {
    type: Number,
    required: [true, 'Price per share is required'],
    min: [1, 'Price per share must be positive']
  },
  transactionId: {
    type: String,
    required: [true, 'Transaction ID is required'],
    unique: true
  },
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'online_banking', 'wallet', 'card'],
    required: [true, 'Payment method is required']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  investmentDate: {
    type: Date,
    default: Date.now
  },
  maturityDate: {
    type: Date,
    required: [true, 'Maturity date is required']
  },
  expectedReturns: {
    type: Number,
    required: [true, 'Expected returns is required'],
    min: [0, 'Expected returns cannot be negative']
  },
  actualReturns: {
    type: Number,
    default: 0
  },
  currentValue: {
    type: Number,
    required: [true, 'Current value is required'],
    min: [0, 'Current value cannot be negative']
  },
  profitLoss: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'matured', 'sold', 'cancelled'],
    default: 'active'
  },
  exitDate: {
    type: Date
  },
  exitAmount: {
    type: Number,
    min: [0, 'Exit amount cannot be negative']
  },
  exitReason: {
    type: String,
    maxlength: [500, 'Exit reason cannot exceed 500 characters']
  },
  documents: [{
    name: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['receipt', 'certificate', 'statement', 'contract'],
      required: true
    },
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
investmentSchema.index({ userId: 1 });
investmentSchema.index({ projectId: 1 });
investmentSchema.index({ status: 1 });
investmentSchema.index({ paymentStatus: 1 });
investmentSchema.index({ investmentDate: -1 });
investmentSchema.index({ maturityDate: 1 });
investmentSchema.index({ transactionId: 1 });

// Compound indexes
investmentSchema.index({ userId: 1, status: 1 });
investmentSchema.index({ projectId: 1, status: 1 });
investmentSchema.index({ userId: 1, investmentDate: -1 });

// Virtual for return percentage
investmentSchema.virtual('returnPercentage').get(function() {
  if (this.amount === 0) return 0;
  return ((this.currentValue - this.amount) / this.amount) * 100;
});

// Virtual for days to maturity
investmentSchema.virtual('daysToMaturity').get(function() {
  const today = new Date();
  const maturity = new Date(this.maturityDate);
  const diffTime = maturity.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to calculate current value and profit/loss
investmentSchema.pre('save', function(next) {
  // Calculate profit/loss
  this.profitLoss = this.currentValue - this.amount;
  
  // Set maturity date if not provided (assuming project duration)
  if (!this.maturityDate && this.investmentDate) {
    const maturityDate = new Date(this.investmentDate);
    maturityDate.setMonth(maturityDate.getMonth() + 24); // Default 24 months
    this.maturityDate = maturityDate;
  }
  
  next();
});

// Pre-save middleware to validate investment amount vs shares
investmentSchema.pre('save', function(next) {
  const calculatedAmount = this.shares * this.pricePerShare;
  if (Math.abs(this.amount - calculatedAmount) > 0.01) {
    return next(new Error('Investment amount must equal shares × price per share'));
  }
  next();
});

// Instance method to calculate current value based on project performance
investmentSchema.methods.calculateCurrentValue = function(): number {
  // This would typically involve complex calculations based on project performance
  // For now, we'll use a simple growth model
  const daysSinceInvestment = Math.floor(
    (Date.now() - this.investmentDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  // Assume linear growth towards expected returns
  const totalDays = Math.floor(
    (this.maturityDate.getTime() - this.investmentDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  if (totalDays <= 0) return this.amount;
  
  const progressRatio = Math.min(daysSinceInvestment / totalDays, 1);
  const expectedGrowth = (this.expectedReturns / 100) * this.amount;
  
  return this.amount + (expectedGrowth * progressRatio);
};

// Instance method to calculate returns
investmentSchema.methods.calculateReturns = function(): number {
  return this.currentValue - this.amount;
};

// Instance method to check if investment is matured
investmentSchema.methods.isMatured = function(): boolean {
  return new Date() >= this.maturityDate;
};

// Static method to find user investments
investmentSchema.statics.findByUser = function(userId: string) {
  return this.find({ userId }).populate('projectId').sort({ investmentDate: -1 });
};

// Static method to find project investments
investmentSchema.statics.findByProject = function(projectId: string) {
  return this.find({ projectId }).populate('userId').sort({ investmentDate: -1 });
};

// Static method to find active investments
investmentSchema.statics.findActive = function() {
  return this.find({ status: 'active' }).populate(['userId', 'projectId']);
};

// Create and export the Investment model
const Investment: Model<IInvestment> = mongoose.models.Investment || mongoose.model<IInvestment>('Investment', investmentSchema);

export default Investment;
