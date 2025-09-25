import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

// User interface extending Document for TypeScript
export interface IUser extends Document {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password?: string;
  role: 'guest' | 'investor' | 'admin';
  isEmailVerified: boolean;
  avatar?: string;
  
  // Investment related fields
  totalInvested: number;
  portfolioValue: number;
  joinDate: Date;
  
  // Profile fields
  city?: string;
  cnicNumber?: string;
  bankAccount?: {
    accountNumber: string;
    bankName: string;
    accountTitle: string;
  };
  
  // Preferences
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  
  // Account status
  isActive: boolean;
  lastLogin?: Date;
  
  // Wishlist
  wishlist: string[];
  
  // Cart
  cart: Array<{
    inventoryId: string;
    amount: number;
    sqft: number;
    pricePerSqFt: number;
    addedAt: Date;
  }>;
  
  // Investments
  investments: Array<{
    projectId: string;
    amount: number;
    investedAt: Date;
  }>;
  
  // User Notifications
  userNotifications: Array<{
    _id?: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    read: boolean;
    createdAt: Date;
    relatedProjectId?: string;
    actionUrl?: string;
  }>;
  
  // Investor verification fields
  verificationStatus: 'none' | 'pending' | 'approved' | 'rejected';
  verificationData?: {
    verificationId?: string;
    address?: string;
    postalCode?: string;
    frontIdUrl?: string;
    frontIdPublicId?: string;
    backIdUrl?: string;
    backIdPublicId?: string;
    submittedAt?: Date;
    reviewedAt?: Date;
    reviewedBy?: string;
    rejectionReason?: string;
  };
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  getFullName(): string;
}

// User schema
const userSchema = new Schema<IUser>({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^(\+92|0)?[0-9]{10}$/, 'Please provide a valid Pakistani phone number']
  },
  password: {
    type: String,
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false // Don't include password in queries by default
  },
  role: {
    type: String,
    enum: ['guest', 'investor', 'admin'],
    default: 'guest'
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  avatar: {
    type: String,
    default: null
  },
  totalInvested: {
    type: Number,
    default: 0,
    min: [0, 'Total invested cannot be negative']
  },
  portfolioValue: {
    type: Number,
    default: 0,
    min: [0, 'Portfolio value cannot be negative']
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  city: {
    type: String,
    trim: true
  },
  cnicNumber: {
    type: String,
    trim: true,
    match: [/^[0-9]{5}-[0-9]{7}-[0-9]$/, 'Please provide a valid CNIC number (format: 12345-1234567-1)']
  },
  bankAccount: {
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
    }
  },
  notifications: {
    email: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: false
    },
    push: {
      type: Boolean,
      default: true
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  wishlist: [{
    type: String,
    ref: 'Project'
  }],
  cart: [{
    inventoryId: {
      type: String,
      ref: 'InventoryCategory',
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    sqft: {
      type: Number,
      required: true,
      min: 0
    },
    pricePerSqFt: {
      type: Number,
      required: true,
      min: 0
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  investments: [{
    projectId: {
      type: String,
      ref: 'Project',
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    investedAt: {
      type: Date,
      default: Date.now
    }
  }],
  userNotifications: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['info', 'success', 'warning', 'error'],
      required: true
    },
    read: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    relatedProjectId: {
      type: String,
      ref: 'Project'
    },
    actionUrl: {
      type: String,
      trim: true
    }
  }],
  verificationStatus: {
    type: String,
    enum: ['none', 'pending', 'approved', 'rejected'],
    default: 'none'
  },
  verificationData: {
    verificationId: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    postalCode: {
      type: String,
      trim: true
    },
    frontIdUrl: {
      type: String,
      trim: true
    },
    frontIdPublicId: {
      type: String,
      trim: true
    },
    backIdUrl: {
      type: String,
      trim: true
    },
    backIdPublicId: {
      type: String,
      trim: true
    },
    submittedAt: {
      type: Date
    },
    reviewedAt: {
      type: Date
    },
    reviewedBy: {
      type: String,
      trim: true
    },
    rejectionReason: {
      type: String,
      trim: true
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
// email index is already created by unique: true, no need to duplicate
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ verificationStatus: 1 });
userSchema.index({ createdAt: -1 });

// Compound indexes for common query patterns
userSchema.index({ role: 1, isActive: 1 }); // Role-based active user queries
userSchema.index({ verificationStatus: 1, 'verificationData.submittedAt': -1 }); // Admin verification queries
userSchema.index({ isActive: 1, createdAt: -1 }); // Active users chronologically
userSchema.index({ 'refreshTokens.token': 1 }, { sparse: true }); // Token lookup for auth

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash password if it's modified or new
  if (!this.isModified('password') || !this.password) return next();
  
  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Instance method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to get full name
userSchema.methods.getFullName = function(): string {
  return `${this.firstName} ${this.lastName}`;
};

// Static method to find by email
userSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

// Create and export the User model
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;
