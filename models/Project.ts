import mongoose, { Document, Model, Schema } from 'mongoose';

// Project interface extending Document for TypeScript
export interface IProject extends Document {
  _id: string;
  title: string;
  description: string;
  location: string;
  city: string;
  type: 'residential' | 'commercial' | 'mixed';
  status: 'draft' | 'active' | 'funded' | 'completed' | 'cancelled';
  
  // Financial details
  targetAmount: number;
  raisedAmount: number;
  minInvestment: number;
  maxInvestment?: number;
  expectedReturn: number;
  actualReturn?: number;
  
  // Project timeline
  duration: number; // in months
  startDate: Date;
  endDate: Date;
  fundingDeadline: Date;
  
  // Property details
  area: number; // in sq ft
  pricePerSqFt: number;
  totalUnits?: number;
  availableUnits?: number;
  
  // Media and documentation
  images: string[];
  documents: {
    name: string;
    url: string;
    type: 'noc' | 'approval' | 'layout' | 'financial' | 'legal' | 'other';
    uploadDate: Date;
  }[];
  
  // Developer information
  developer: {
    name: string;
    experience: number; // years
    completedProjects: number;
    rating: number;
    contact: {
      email: string;
      phone: string;
      address: string;
    };
  };
  
  // Property features
  amenities: string[];
  specifications: {
    bedrooms?: number;
    bathrooms?: number;
    parking?: boolean;
    floor?: number;
    facing?: string;
  };
  
  // Risk and compliance
  riskLevel: 'low' | 'medium' | 'high';
  riskFactors: string[];
  complianceStatus: {
    noc: boolean;
    environmentalClearance: boolean;
    buildingApproval: boolean;
    utilityConnections: boolean;
  };
  
  // Investment tracking
  totalInvestors: number;
  investments: {
    userId: mongoose.Types.ObjectId;
    amount: number;
    shares: number;
    investmentDate: Date;
  }[];
  
  // Admin fields
  createdBy: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  approvalDate?: Date;
  
  // SEO and marketing
  slug: string;
  tags: string[];
  featured: boolean;
  views: number;
  
  // Methods
  calculateProgress(): number;
  getRemainingAmount(): number;
  isInvestmentOpen(): boolean;
}

// Project schema
const projectSchema = new Schema<IProject>({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  location: {
    type: String,
    required: [true, 'Project location is required'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
    enum: ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Other']
  },
  type: {
    type: String,
    required: [true, 'Project type is required'],
    enum: ['residential', 'commercial', 'mixed']
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'funded', 'completed', 'cancelled'],
    default: 'draft'
  },
  targetAmount: {
    type: Number,
    required: [true, 'Target amount is required'],
    min: [1000000, 'Target amount must be at least PKR 10 Lakh']
  },
  raisedAmount: {
    type: Number,
    default: 0,
    min: [0, 'Raised amount cannot be negative']
  },
  minInvestment: {
    type: Number,
    required: [true, 'Minimum investment is required'],
    min: [100000, 'Minimum investment must be at least PKR 1 Lakh']
  },
  maxInvestment: {
    type: Number,
    validate: {
      validator: function(value: number) {
        return !value || value >= this.minInvestment;
      },
      message: 'Maximum investment must be greater than minimum investment'
    }
  },
  expectedReturn: {
    type: Number,
    required: [true, 'Expected return is required'],
    min: [0, 'Expected return cannot be negative'],
    max: [100, 'Expected return cannot exceed 100%']
  },
  actualReturn: {
    type: Number,
    min: [0, 'Actual return cannot be negative']
  },
  duration: {
    type: Number,
    required: [true, 'Project duration is required'],
    min: [6, 'Duration must be at least 6 months'],
    max: [120, 'Duration cannot exceed 10 years']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  fundingDeadline: {
    type: Date,
    required: [true, 'Funding deadline is required']
  },
  area: {
    type: Number,
    required: [true, 'Project area is required'],
    min: [500, 'Area must be at least 500 sq ft']
  },
  pricePerSqFt: {
    type: Number,
    required: [true, 'Price per sq ft is required'],
    min: [1000, 'Price per sq ft must be at least PKR 1,000']
  },
  totalUnits: {
    type: Number,
    min: [1, 'Total units must be at least 1']
  },
  availableUnits: {
    type: Number,
    min: [0, 'Available units cannot be negative']
  },
  images: [{
    type: String,
    required: [true, 'At least one project image is required']
  }],
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
      enum: ['noc', 'approval', 'layout', 'financial', 'legal', 'other'],
      required: true
    },
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  developer: {
    name: {
      type: String,
      required: [true, 'Developer name is required']
    },
    experience: {
      type: Number,
      required: [true, 'Developer experience is required'],
      min: [0, 'Experience cannot be negative']
    },
    completedProjects: {
      type: Number,
      default: 0,
      min: [0, 'Completed projects cannot be negative']
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5']
    },
    contact: {
      email: {
        type: String,
        required: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
      },
      phone: {
        type: String,
        required: true
      },
      address: {
        type: String,
        required: true
      }
    }
  },
  amenities: [{
    type: String,
    trim: true
  }],
  specifications: {
    bedrooms: {
      type: Number,
      min: [1, 'Bedrooms must be at least 1']
    },
    bathrooms: {
      type: Number,
      min: [1, 'Bathrooms must be at least 1']
    },
    parking: {
      type: Boolean,
      default: false
    },
    floor: {
      type: Number,
      min: [0, 'Floor cannot be negative']
    },
    facing: {
      type: String,
      enum: ['North', 'South', 'East', 'West', 'North-East', 'North-West', 'South-East', 'South-West']
    }
  },
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: [true, 'Risk level is required']
  },
  riskFactors: [{
    type: String,
    trim: true
  }],
  complianceStatus: {
    noc: {
      type: Boolean,
      default: false
    },
    environmentalClearance: {
      type: Boolean,
      default: false
    },
    buildingApproval: {
      type: Boolean,
      default: false
    },
    utilityConnections: {
      type: Boolean,
      default: false
    }
  },
  totalInvestors: {
    type: Number,
    default: 0,
    min: [0, 'Total investors cannot be negative']
  },
  investments: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Investment amount cannot be negative']
    },
    shares: {
      type: Number,
      required: true,
      min: [0, 'Shares cannot be negative']
    },
    investmentDate: {
      type: Date,
      default: Date.now
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvalDate: {
    type: Date
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  featured: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0,
    min: [0, 'Views cannot be negative']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
projectSchema.index({ status: 1 });
projectSchema.index({ city: 1 });
projectSchema.index({ type: 1 });
projectSchema.index({ featured: 1 });
projectSchema.index({ createdAt: -1 });
projectSchema.index({ fundingDeadline: 1 });
projectSchema.index({ slug: 1 });
projectSchema.index({ tags: 1 });

// Compound indexes
projectSchema.index({ status: 1, featured: 1 });
projectSchema.index({ city: 1, type: 1 });

// Virtual for funding progress percentage
projectSchema.virtual('fundingProgress').get(function() {
  return Math.round((this.raisedAmount / this.targetAmount) * 100);
});

// Virtual for remaining amount
projectSchema.virtual('remainingAmount').get(function() {
  return this.targetAmount - this.raisedAmount;
});

// Virtual for days remaining
projectSchema.virtual('daysRemaining').get(function() {
  const today = new Date();
  const deadline = new Date(this.fundingDeadline);
  const diffTime = deadline.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to generate slug
projectSchema.pre('save', function(next) {
  if (this.isModified('title') && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

// Pre-save middleware to validate dates
projectSchema.pre('save', function(next) {
  if (this.endDate <= this.startDate) {
    return next(new Error('End date must be after start date'));
  }
  if (this.fundingDeadline >= this.endDate) {
    return next(new Error('Funding deadline must be before project end date'));
  }
  next();
});

// Instance method to calculate progress percentage
projectSchema.methods.calculateProgress = function(): number {
  return Math.round((this.raisedAmount / this.targetAmount) * 100);
};

// Instance method to get remaining amount
projectSchema.methods.getRemainingAmount = function(): number {
  return this.targetAmount - this.raisedAmount;
};

// Instance method to check if investment is open
projectSchema.methods.isInvestmentOpen = function(): boolean {
  const now = new Date();
  return (
    this.status === 'active' &&
    this.fundingDeadline > now &&
    this.raisedAmount < this.targetAmount
  );
};

// Static method to find active projects
projectSchema.statics.findActive = function() {
  return this.find({ status: 'active' }).sort({ createdAt: -1 });
};

// Static method to find featured projects
projectSchema.statics.findFeatured = function() {
  return this.find({ featured: true, status: 'active' }).sort({ createdAt: -1 });
};

// Create and export the Project model
const Project: Model<IProject> = mongoose.models.Project || mongoose.model<IProject>('Project', projectSchema);

export default Project;
