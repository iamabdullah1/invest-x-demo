import mongoose, { Document, Schema } from 'mongoose';

export interface IInventoryCategory extends Document {
  projectId: mongoose.Types.ObjectId;
  country: string;
  city: string;
  area: string;
  title: string;
  description: string;
  propertyType: string;
  propertySubType: string;
  totalArea: number;
  minSquareFeet: number;
  pricePerSquareFoot: number;
  inventoryImages: string[];
  createdAt: Date;
  updatedAt: Date;
}

const InventoryCategorySchema = new Schema<IInventoryCategory>({
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  country: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  area: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  propertyType: {
    type: String,
    required: true,
    enum: ['Residential', 'Commercial', 'Mixed']
  },
  propertySubType: {
    type: String,
    required: true,
    enum: ['Apartment', 'Villa', 'Shop', 'Office', 'Plot']
  },
  totalArea: {
    type: Number,
    required: true
  },
  minSquareFeet: {
    type: Number,
    required: true
  },
  pricePerSquareFoot: {
    type: Number,
    required: true
  },
  inventoryImages: [{
    type: String
  }]
}, {
  timestamps: true
});

// Add index for efficient querying by project
InventoryCategorySchema.index({ projectId: 1 });

export default mongoose.models.InventoryCategory || mongoose.model<IInventoryCategory>('InventoryCategory', InventoryCategorySchema);
