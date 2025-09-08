import mongoose, { Document, Schema } from 'mongoose';

export interface IInvestorVerification extends Document {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  frontIdCardPath: string;
  backIdCardPath: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  rejectionReason?: string;
  notes?: string;
}

const investorVerificationSchema = new Schema<IInvestorVerification>({
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    match: /^\S+@\S+\.\S+$/
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  postalCode: {
    type: String,
    required: true,
    trim: true
  },
  frontIdCardPath: {
    type: String,
    required: true
  },
  backIdCardPath: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: {
    type: Date
  },
  reviewedBy: {
    type: String
  },
  rejectionReason: {
    type: String
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for better query performance
investorVerificationSchema.index({ email: 1 });
investorVerificationSchema.index({ status: 1 });
investorVerificationSchema.index({ submittedAt: -1 });

const InvestorVerification = mongoose.models.InvestorVerification || 
  mongoose.model<IInvestorVerification>('InvestorVerification', investorVerificationSchema);

export default InvestorVerification;
