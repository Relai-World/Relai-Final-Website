import mongoose, { Schema, Document } from 'mongoose';

// User Schema
export interface IUser extends Document {
  username: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Contact Inquiry Schema
export interface IContactInquiry extends Document {
  name: string;
  phone: string;
  email: string;
  meetingTime: Date;
  propertyName: string;
  createdAt: Date;
  updatedAt: Date;
}

export const ContactInquirySchema = new Schema<IContactInquiry>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  meetingTime: {
    type: Date,
    required: true
  },
  propertyName: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

// Property Schema
export interface IProperty extends Document {
  developerName?: string;
  reraNumber?: string;
  projectName: string;
  constructionStatus?: string;
  propertyType: string;
  location: string;
  possessionDate?: string;
  isGatedCommunity?: boolean;
  totalUnits?: number;
  areaSizeAcres?: number;
  configurations?: string;
  minSizeSqft?: number;
  maxSizeSqft?: number;
  pricePerSqft?: number;
  pricePerSqftOTP?: number;
  price: number;
  longitude?: number;
  latitude?: number;
  projectDocumentsLink?: string;
  source?: string;
  builderContactInfo?: string;
  listingType?: string;
  loanApprovedBanks?: string[];
  nearbyLocations?: string[];
  remarksComments?: string;
  amenities?: string[];
  faq?: string[];
  name: string;
  bedrooms?: number;
  bathrooms?: number;
  area: number;
  description?: string;
  features?: string[];
  images?: string[];
  builder?: string;
  possession?: string;
  rating?: number;
  legalClearance?: string;
  constructionQuality?: string;
  waterSupply?: string;
  powerBackup?: string;
  parkingFacilities?: string;
  communityType?: string;
  buildQuality?: string;
  investmentPotential?: string;
  propertyAge?: string;
  environmentalFeatures?: string;
  views?: string;
  noiseLevel?: string;
  connectivityAndTransit?: string;
  medicalFacilities?: string;
  educationalInstitutions?: string;
  shoppingAndEntertainment?: string;
  specialFeatures?: string[];
  videoTour?: string;
  virtualTour?: string;
  siteVisitSchedule?: string;
  homeLoans?: string;
  maintenanceCharges?: string;
  taxAndCharges?: string;
  legalDocuments?: string[];
  floorPlans?: string[];
  masterPlan?: string;
  relaiRating?: number;
  relaiReview?: string;
  discounts?: string;
  bookingAmount?: string;
  paymentSchedule?: string;
  minimumBudget?: number;
  maximumBudget?: number;
  configurationDetails?: Array<{
    type: string;
    sizeRange: number;
    sizeUnit: string;
    facing: string;
    baseProjectPrice: number;
  }>;
  RERA_Number?: string;
  ProjectName?: string;
  BuilderName?: string;
  Area?: string;
  Possession_date?: string;
  Price_per_sft?: number;
  createdAt: Date;
  updatedAt: Date;
}

export const PropertySchema = new Schema<IProperty>({
  developerName: {
    type: String,
    trim: true
  },
  reraNumber: {
    type: String,
    trim: true
  },
  projectName: {
    type: String,
    required: true,
    trim: true
  },
  constructionStatus: {
    type: String,
    trim: true
  },
  propertyType: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  possessionDate: {
    type: String,
    trim: true
  },
  isGatedCommunity: {
    type: Boolean,
    default: false
  },
  totalUnits: {
    type: Number,
    min: 0
  },
  areaSizeAcres: {
    type: Number,
    min: 0
  },
  configurations: {
    type: String,
    trim: true
  },
  minSizeSqft: {
    type: Number,
    min: 0
  },
  maxSizeSqft: {
    type: Number,
    min: 0
  },
  pricePerSqft: {
    type: Number,
    min: 0
  },
  pricePerSqftOTP: {
    type: Number,
    min: 0
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  longitude: {
    type: Number
  },
  latitude: {
    type: Number
  },
  projectDocumentsLink: {
    type: String,
    trim: true
  },
  source: {
    type: String,
    trim: true
  },
  builderContactInfo: {
    type: String,
    trim: true
  },
  listingType: {
    type: String,
    trim: true
  },
  loanApprovedBanks: [{
    type: String,
    trim: true
  }],
  nearbyLocations: [{
    type: String,
    trim: true
  }],
  remarksComments: {
    type: String,
    trim: true
  },
  amenities: [{
    type: String,
    trim: true
  }],
  faq: [{
    type: String,
    trim: true
  }],
  name: {
    type: String,
    required: true,
    trim: true
  },
  bedrooms: {
    type: Number,
    min: 0
  },
  bathrooms: {
    type: Number,
    min: 0
  },
  area: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    trim: true
  },
  features: [{
    type: String,
    trim: true
  }],
  images: [{
    type: String,
    trim: true
  }],
  builder: {
    type: String,
    trim: true
  },
  possession: {
    type: String,
    trim: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 5
  },
  legalClearance: {
    type: String,
    trim: true
  },
  constructionQuality: {
    type: String,
    trim: true
  },
  waterSupply: {
    type: String,
    trim: true
  },
  powerBackup: {
    type: String,
    trim: true
  },
  parkingFacilities: {
    type: String,
    trim: true
  },
  communityType: {
    type: String,
    trim: true
  },
  buildQuality: {
    type: String,
    trim: true
  },
  investmentPotential: {
    type: String,
    trim: true
  },
  propertyAge: {
    type: String,
    trim: true
  },
  environmentalFeatures: {
    type: String,
    trim: true
  },
  views: {
    type: String,
    trim: true
  },
  noiseLevel: {
    type: String,
    trim: true
  },
  connectivityAndTransit: {
    type: String,
    trim: true
  },
  medicalFacilities: {
    type: String,
    trim: true
  },
  educationalInstitutions: {
    type: String,
    trim: true
  },
  shoppingAndEntertainment: {
    type: String,
    trim: true
  },
  specialFeatures: [{
    type: String,
    trim: true
  }],
  videoTour: {
    type: String,
    trim: true
  },
  virtualTour: {
    type: String,
    trim: true
  },
  siteVisitSchedule: {
    type: String,
    trim: true
  },
  homeLoans: {
    type: String,
    trim: true
  },
  maintenanceCharges: {
    type: String,
    trim: true
  },
  taxAndCharges: {
    type: String,
    trim: true
  },
  legalDocuments: [{
    type: String,
    trim: true
  }],
  floorPlans: [{
    type: String,
    trim: true
  }],
  masterPlan: {
    type: String,
    trim: true
  },
  relaiRating: {
    type: Number,
    min: 0,
    max: 5
  },
  relaiReview: {
    type: String,
    trim: true
  },
  discounts: {
    type: String,
    trim: true
  },
  bookingAmount: {
    type: String,
    trim: true
  },
  paymentSchedule: {
    type: String,
    trim: true
  },
  minimumBudget: {
    type: Number,
    min: 0
  },
  maximumBudget: {
    type: Number,
    min: 0
  },
  configurationDetails: [{
    type: {
      type: String,
      trim: true
    },
    sizeRange: {
      type: Number,
      min: 0
    },
    sizeUnit: {
      type: String,
      trim: true
    },
    facing: {
      type: String,
      trim: true
    },
    baseProjectPrice: {
      type: Number,
      min: 0
    }
  }],
  RERA_Number: {
    type: String,
    trim: true
  },
  ProjectName: {
    type: String,
    trim: true
  },
  BuilderName: {
    type: String,
    trim: true
  },
  Area: {
    type: String,
    trim: true
  },
  Possession_date: {
    type: String,
    trim: true
  },
  Price_per_sft: {
    type: Number,
    min: 0
  }
}, {
  timestamps: true
});

// Blog Admin Schema
export interface IBlogAdmin extends Document {
  username: string;
  password: string;
  email: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export const BlogAdminSchema = new Schema<IBlogAdmin>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  role: {
    type: String,
    required: true,
    default: 'admin',
    enum: ['admin', 'editor', 'author']
  }
}, {
  timestamps: true
});

// Blog Post Schema
export interface IBlogPost extends Document {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  category: string;
  status: string;
  authorId?: mongoose.Types.ObjectId;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const BlogPostSchema = new Schema<IBlogPost>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  excerpt: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  featuredImage: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true,
    default: 'Real Estate',
    trim: true
  },
  status: {
    type: String,
    required: true,
    default: 'draft',
    enum: ['draft', 'published']
  },
  authorId: {
    type: Schema.Types.ObjectId,
    ref: 'BlogAdmin'
  },
  publishedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Blog Category Schema
export interface IBlogCategory extends Document {
  name: string;
  slug: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const BlogCategorySchema = new Schema<IBlogCategory>({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Blog Post Category Junction Schema
export interface IBlogPostCategory extends Document {
  postId: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
}

export const BlogPostCategorySchema = new Schema<IBlogPostCategory>({
  postId: {
    type: Schema.Types.ObjectId,
    ref: 'BlogPost',
    required: true
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: 'BlogCategory',
    required: true
  }
});

// Admin Session Schema
export interface IAdminSession extends Document {
  sessionId: string;
  userId: mongoose.Types.ObjectId;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const AdminSessionSchema = new Schema<IAdminSession>({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'BlogAdmin',
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// Create and export models
export const User = mongoose.model<IUser>('User', UserSchema);
export const ContactInquiry = mongoose.model<IContactInquiry>('ContactInquiry', ContactInquirySchema);
export const Property = mongoose.model<IProperty>('Property', PropertySchema);
export const BlogAdmin = mongoose.model<IBlogAdmin>('BlogAdmin', BlogAdminSchema);
export const BlogPost = mongoose.model<IBlogPost>('BlogPost', BlogPostSchema);
export const BlogCategory = mongoose.model<IBlogCategory>('BlogCategory', BlogCategorySchema);
export const BlogPostCategory = mongoose.model<IBlogPostCategory>('BlogPostCategory', BlogPostCategorySchema);
export const AdminSession = mongoose.model<IAdminSession>('AdminSession', AdminSessionSchema); 