import mongoose, { Document, Model, Schema } from 'mongoose';

// Transaction interface extending Document for TypeScript
export interface ITransaction extends Document {
  _id: string;
  userId: mongoose.Types.ObjectId;
  
  // Transaction identification
  transactionId: string;
  referenceId?: string; // External payment gateway reference
  
  // Transaction details
  type: 'investment' | 'withdrawal' | 'dividend' | 'refund' | 'fee' | 'bonus';
  amount: number;
  currency: 'PKR' | 'USD';
  
  // Status and processing
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'reversed';
  
  // Payment details
  paymentMethod: 'bank_transfer' | 'online_banking' | 'wallet' | 'card' | 'cash';
  paymentGateway?: 'easypaisa' | 'jazzcash' | 'sadapay' | 'nayapay' | 'bank' | 'stripe';
  
  // Related entities
  projectId?: mongoose.Types.ObjectId;
  investmentId?: mongoose.Types.ObjectId;
  
  // Description and metadata
  description: string;
  category: 'investment' | 'returns' | 'management' | 'system';
  
  // Banking details
  bankDetails?: {
    accountNumber: string;
    bankName: string;
    accountTitle: string;
    iban?: string;
  };
  
  // Processing timestamps
  processedAt?: Date;
  completedAt?: Date;
  
  // Fee information
  fees: {
    platform: number;
    payment: number;
    tax: number;
    total: number;
  };
  
  // Verification and audit
  verifiedBy?: mongoose.Types.ObjectId;
  verificationNotes?: string;
  
  // Failure details
  failureReason?: string;
  retryCount: number;
  
  // Methods
  markAsCompleted(): void;
  markAsFailed(reason: string): void;
  calculateNetAmount(): number;
}

// Transaction schema
const transactionSchema = new Schema<ITransaction>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  transactionId: {
    type: String,
    required: [true, 'Transaction ID is required'],
    unique: true
  },
  referenceId: {
    type: String,
    sparse: true // Allows multiple null values
  },
  type: {
    type: String,
    enum: ['investment', 'withdrawal', 'dividend', 'refund', 'fee', 'bonus'],
    required: [true, 'Transaction type is required']
  },
  amount: {
    type: Number,
    required: [true, 'Transaction amount is required'],
    min: [0.01, 'Amount must be positive']
  },
  currency: {
    type: String,
    enum: ['PKR', 'USD'],
    default: 'PKR'
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'reversed'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'online_banking', 'wallet', 'card', 'cash'],
    required: [true, 'Payment method is required']
  },
  paymentGateway: {
    type: String,
    enum: ['easypaisa', 'jazzcash', 'sadapay', 'nayapay', 'bank', 'stripe']
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  investmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Investment'
  },
  description: {
    type: String,
    required: [true, 'Transaction description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    enum: ['investment', 'returns', 'management', 'system'],
    required: [true, 'Transaction category is required']
  },
  bankDetails: {
    accountNumber: {
      type: String,
      trim: true
    },
    bankName: {
      type: String,
      trim: true
    },
    accountTitle: {
      type: String,
      trim: true
    },
    iban: {
      type: String,
      trim: true,
      uppercase: true
    }
  },
  processedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  fees: {
    platform: {
      type: Number,
      default: 0,
      min: [0, 'Platform fee cannot be negative']
    },
    payment: {
      type: Number,
      default: 0,
      min: [0, 'Payment fee cannot be negative']
    },
    tax: {
      type: Number,
      default: 0,
      min: [0, 'Tax cannot be negative']
    },
    total: {
      type: Number,
      default: 0,
      min: [0, 'Total fee cannot be negative']
    }
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verificationNotes: {
    type: String,
    maxlength: [1000, 'Verification notes cannot exceed 1000 characters']
  },
  failureReason: {
    type: String,
    maxlength: [500, 'Failure reason cannot exceed 500 characters']
  },
  retryCount: {
    type: Number,
    default: 0,
    min: [0, 'Retry count cannot be negative'],
    max: [5, 'Maximum 5 retries allowed']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
transactionSchema.index({ userId: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ category: 1 });
// transactionId index is already created by unique: true, no need to duplicate
// referenceId index is already created by sparse: true, no need to duplicate
transactionSchema.index({ createdAt: -1 });
transactionSchema.index({ completedAt: -1 });

// Compound indexes
transactionSchema.index({ userId: 1, status: 1 });
transactionSchema.index({ userId: 1, type: 1 });
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ projectId: 1, status: 1 });

// Virtual for net amount (amount - total fees)
transactionSchema.virtual('netAmount').get(function() {
  return this.amount - this.fees.total;
});

// Virtual for is recent (within last 30 days)
transactionSchema.virtual('isRecent').get(function() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return (this as any).createdAt > thirtyDaysAgo;
});

// Pre-save middleware to calculate total fees
transactionSchema.pre('save', function(next) {
  this.fees.total = this.fees.platform + this.fees.payment + this.fees.tax;
  next();
});

// Pre-save middleware to set processing timestamps
transactionSchema.pre('save', function(next) {
  const now = new Date();
  
  if (this.isModified('status')) {
    if (this.status === 'processing' && !this.processedAt) {
      this.processedAt = now;
    }
    
    if (this.status === 'completed' && !this.completedAt) {
      this.completedAt = now;
    }
  }
  
  next();
});

// Instance method to mark transaction as completed
transactionSchema.methods.markAsCompleted = function(): void {
  this.status = 'completed';
  this.completedAt = new Date();
};

// Instance method to mark transaction as failed
transactionSchema.methods.markAsFailed = function(reason: string): void {
  this.status = 'failed';
  this.failureReason = reason;
};

// Instance method to calculate net amount
transactionSchema.methods.calculateNetAmount = function(): number {
  return this.amount - this.fees.total;
};

// Static method to find user transactions
transactionSchema.statics.findByUser = function(userId: string, status?: string) {
  const query: any = { userId };
  if (status) query.status = status;
  return this.find(query).sort({ createdAt: -1 });
};

// Static method to find pending transactions
transactionSchema.statics.findPending = function() {
  return this.find({ status: 'pending' }).populate('userId').sort({ createdAt: 1 });
};

// Static method to get transaction statistics
transactionSchema.statics.getStats = function(userId?: string) {
  const matchStage: any = {};
  if (userId) matchStage.userId = new mongoose.Types.ObjectId(userId);
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        avgAmount: { $avg: '$amount' }
      }
    }
  ]);
};

// Create and export the Transaction model
const Transaction: Model<ITransaction> = mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', transactionSchema);

export default Transaction;
