import { 
  User, 
  ContactInquiry, 
  Property, 
  BlogAdmin, 
  BlogPost, 
  BlogCategory, 
  BlogPostCategory, 
  AdminSession,
  IUser,
  IContactInquiry,
  IProperty,
  IBlogAdmin,
  IBlogPost,
  IBlogCategory,
  IBlogPostCategory,
  IAdminSession
} from '../shared/mongodb-schemas';
import { getImagesForProperty } from './api/property-images';

export interface IStorage {
  // User methods
  getUser(id: string): Promise<IUser | null>;
  getUserByUsername(username: string): Promise<IUser | null>;
  createUser(user: { username: string; password: string }): Promise<IUser>;
  
  // Contact inquiry methods
  createContactInquiry(inquiry: {
    name: string;
    phone: string;
    email: string;
    meetingTime: Date;
    propertyName: string;
  }): Promise<IContactInquiry>;
  
  // Property methods
  getAllProperties(filters?: {
    search?: string;
    location?: string;
    propertyType?: string;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    minPricePerSqft?: number;
    maxPricePerSqft?: number;
    configurations?: string;
    constructionStatus?: string;
    communityType?: string;
    possessionTimeline?: string;
  }): Promise<IProperty[]>;
  getPropertyById(id: string): Promise<IProperty | null>;
  createProperty(property: any): Promise<IProperty>;
  importPropertiesFromSpreadsheet(sheetData: any[]): Promise<IProperty[]>;
  updatePropertyImages(id: string, images: string[]): Promise<boolean>;
  updatePropertyCoordinates(id: string, latitude: number, longitude: number): Promise<boolean>;
  getUniquePropertyTypes(): Promise<{ propertyType: string }[]>;
  
  // Blog methods
  getBlogPosts(filters?: {
    status?: string;
    category?: string;
    authorId?: string;
  }): Promise<IBlogPost[]>;
  getBlogPostById(id: string): Promise<IBlogPost | null>;
  getBlogPostBySlug(slug: string): Promise<IBlogPost | null>;
  createBlogPost(post: any): Promise<IBlogPost>;
  updateBlogPost(id: string, updates: any): Promise<IBlogPost | null>;
  deleteBlogPost(id: string): Promise<boolean>;
  
  // Blog admin methods
  getBlogAdminById(id: string): Promise<IBlogAdmin | null>;
  getBlogAdminByUsername(username: string): Promise<IBlogAdmin | null>;
  createBlogAdmin(admin: any): Promise<IBlogAdmin>;
  
  // Session methods
  createAdminSession(session: {
    sessionId: string;
    userId: string;
    expiresAt: Date;
  }): Promise<IAdminSession>;
  getAdminSession(sessionId: string): Promise<IAdminSession | null>;
  deleteAdminSession(sessionId: string): Promise<boolean>;
}

export class MongoDBStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<IUser | null> {
    try {
      return await User.findById(id);
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  }

  async getUserByUsername(username: string): Promise<IUser | null> {
    try {
      return await User.findOne({ username });
    } catch (error) {
      console.error('Error getting user by username:', error);
      return null;
    }
  }

  async createUser(user: { username: string; password: string }): Promise<IUser> {
    try {
      const newUser = new User(user);
      return await newUser.save();
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Contact inquiry methods
  async createContactInquiry(inquiry: {
    name: string;
    phone: string;
    email: string;
    meetingTime: Date;
    propertyName: string;
  }): Promise<IContactInquiry> {
    try {
      const newInquiry = new ContactInquiry(inquiry);
      return await newInquiry.save();
    } catch (error) {
      console.error('Error creating contact inquiry:', error);
      throw error;
    }
  }

  // Property methods
  async getAllProperties(filters?: {
    search?: string;
    location?: string;
    propertyType?: string;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    minPricePerSqft?: number;
    maxPricePerSqft?: number;
    configurations?: string;
    constructionStatus?: string;
    communityType?: string;
    possessionTimeline?: string;
  }): Promise<IProperty[]> {
    try {
      let query: any = {};

      // Apply filters
      if (filters?.search) {
        query.$or = [
          { name: { $regex: filters.search, $options: 'i' } },
          { projectName: { $regex: filters.search, $options: 'i' } },
          { location: { $regex: filters.search, $options: 'i' } },
          { developerName: { $regex: filters.search, $options: 'i' } }
        ];
      }

      // Robust location filtering: match both 'Area' and 'location' fields (case-insensitive)
      if (filters?.location && String(filters.location) !== 'any') {
        // If there is already an $or in the query, merge with AND logic for configurations
        query.$and = query.$and || [];
        query.$and.push({
          $or: [
            { Area: { $regex: filters.location, $options: 'i' } },
            { location: { $regex: filters.location, $options: 'i' } }
          ]
        });
      }

      if (filters?.propertyType) {
        query.propertyType = { $regex: filters.propertyType, $options: 'i' };
      }

      if (filters?.minPrice || filters?.maxPrice) {
        // Filter based on configurations array BaseProjectPrice
        if (filters.minPrice && filters.maxPrice) {
          query['configurations.BaseProjectPrice'] = {
            $gte: filters.minPrice,
            $lte: filters.maxPrice
          };
        } else if (filters.minPrice) {
          query['configurations.BaseProjectPrice'] = { $gte: filters.minPrice };
        } else if (filters.maxPrice) {
          query['configurations.BaseProjectPrice'] = { $lte: filters.maxPrice };
        }
      }

      if (filters?.bedrooms) {
        query.bedrooms = filters.bedrooms;
      }

      if (filters?.minPricePerSqft || filters?.maxPricePerSqft) {
        query.pricePerSqft = {};
        if (filters.minPricePerSqft) query.pricePerSqft.$gte = filters.minPricePerSqft;
        if (filters.maxPricePerSqft) query.pricePerSqft.$lte = filters.maxPricePerSqft;
      }

      if (filters?.configurations) {
        query.$and = query.$and || [];
        query.$and.push({
          'configurations.type': { $regex: filters.configurations, $options: 'i' }
        });
      }

      if (filters?.constructionStatus) {
        query.constructionStatus = { $regex: filters.constructionStatus, $options: 'i' };
      }

      // Community type filtering
      if (filters?.communityType) {
        query.communityType = { $regex: filters.communityType, $options: 'i' };
      }

      // Possession timeline filtering
      if (filters?.possessionTimeline) {
        query.Possession_date = { $regex: filters.possessionTimeline, $options: 'i' };
      }

      // Debug log for the final MongoDB query
      console.log('MongoDB getAllProperties query:', JSON.stringify(query, null, 2));

      return await Property.find(query).sort({ createdAt: -1 });
    } catch (error) {
      console.error('Error getting all properties:', error);
      return [];
    }
  }

  async getPropertyById(id: string): Promise<IProperty | null> {
    try {
      return await Property.findById(id);
    } catch (error) {
      console.error('Error getting property by ID:', error);
      return null;
    }
  }

  async createProperty(property: any): Promise<IProperty> {
    try {
      const newProperty = new Property(property);
      return await newProperty.save();
    } catch (error) {
      console.error('Error creating property:', error);
      throw error;
    }
  }

  async importPropertiesFromSpreadsheet(sheetData: any[]): Promise<IProperty[]> {
    try {
      const properties: IProperty[] = [];
      
      for (const row of sheetData) {
        try {
          // Transform CSV data to match our schema
          const propertyData = {
            developerName: row.developerName || row.DeveloperName,
            reraNumber: row.reraNumber || row.RERA_Number,
            projectName: row.projectName || row.ProjectName,
            constructionStatus: row.constructionStatus || row.ConstructionStatus,
            propertyType: row.propertyType || row.PropertyType,
            location: row.location || row.Location,
            possessionDate: row.possessionDate || row.PossessionDate,
            isGatedCommunity: row.isGatedCommunity === 'Yes' || row.IsGatedCommunity === 'Yes',
            totalUnits: parseInt(row.totalUnits || row.TotalUnits) || undefined,
            areaSizeAcres: parseFloat(row.areaSizeAcres || row.AreaSizeAcres) || undefined,
            configurations: row.configurations || row.Configurations,
            minSizeSqft: parseInt(row.minSizeSqft || row.MinSizeSqft) || undefined,
            maxSizeSqft: parseInt(row.maxSizeSqft || row.MaxSizeSqft) || undefined,
            pricePerSqft: parseFloat(row.pricePerSqft || row.PricePerSqft) || undefined,
            pricePerSqftOTP: parseFloat(row.pricePerSqftOTP || row.PricePerSqftOTP) || undefined,
            price: parseFloat(row.price || row.Price) || 0,
            longitude: parseFloat(row.longitude || row.Longitude) || undefined,
            latitude: parseFloat(row.latitude || row.Latitude) || undefined,
            projectDocumentsLink: row.projectDocumentsLink || row.ProjectDocumentsLink,
            source: row.source || row.Source,
            builderContactInfo: row.builderContactInfo || row.BuilderContactInfo,
            listingType: row.listingType || row.ListingType,
            loanApprovedBanks: row.loanApprovedBanks ? row.loanApprovedBanks.split(',').map((bank: string) => bank.trim()) : undefined,
            nearbyLocations: row.nearbyLocations ? row.nearbyLocations.split(',').map((location: string) => location.trim()) : undefined,
            remarksComments: row.remarksComments || row.RemarksComments,
            amenities: row.amenities ? row.amenities.split(',').map((amenity: string) => amenity.trim()) : undefined,
            faq: row.faq ? row.faq.split(',').map((question: string) => question.trim()) : undefined,
            name: row.name || row.Name || row.projectName || row.ProjectName,
            bedrooms: parseInt(row.bedrooms || row.Bedrooms) || undefined,
            bathrooms: parseInt(row.bathrooms || row.Bathrooms) || undefined,
            area: parseInt(row.area || row.Area) || parseInt(row.minSizeSqft || row.MinSizeSqft) || 0,
            description: row.description || row.Description || row.remarksComments || row.RemarksComments,
            features: row.features ? row.features.split(',').map((feature: string) => feature.trim()) : undefined,
            images: [],
            builder: row.builder || row.Builder || row.developerName || row.DeveloperName,
            possession: row.possession || row.Possession || row.possessionDate || row.PossessionDate,
            rating: parseFloat(row.rating || row.Rating) || undefined
          };

          const newProperty = new Property(propertyData);
          const savedProperty = await newProperty.save();
          properties.push(savedProperty);
        } catch (rowError) {
          console.error('Error processing row:', rowError, 'Row data:', row);
          // Continue with next row
        }
      }

      return properties;
    } catch (error) {
      console.error('Error importing properties from spreadsheet:', error);
      throw error;
    }
  }

  async updatePropertyImages(id: string, images: string[]): Promise<boolean> {
    try {
      const result = await Property.updateOne(
        { _id: id },
        { $set: { images } }
      );
      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Error updating property images:', error);
      return false;
    }
  }

  async updatePropertyCoordinates(id: string, latitude: number, longitude: number): Promise<boolean> {
    try {
      const result = await Property.updateOne(
        { _id: id },
        { $set: { latitude, longitude } }
      );
      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Error updating property coordinates:', error);
      return false;
    }
  }

  async getUniquePropertyTypes(): Promise<{ propertyType: string }[]> {
    try {
      const propertyTypes = await Property.distinct('propertyType');
      return propertyTypes.map(type => ({ propertyType: type }));
    } catch (error) {
      console.error('Error getting unique property types:', error);
      return [];
    }
  }

  // Blog methods
  async getBlogPosts(filters?: {
    status?: string;
    category?: string;
    authorId?: string;
  }): Promise<IBlogPost[]> {
    try {
      let query: any = {};

      if (filters?.status) {
        query.status = filters.status;
      }

      if (filters?.category) {
        query.category = filters.category;
      }

      if (filters?.authorId) {
        query.authorId = filters.authorId;
      }

      return await BlogPost.find(query).populate('authorId').sort({ createdAt: -1 });
    } catch (error) {
      console.error('Error getting blog posts:', error);
      return [];
    }
  }

  async getBlogPostById(id: string): Promise<IBlogPost | null> {
    try {
      return await BlogPost.findById(id).populate('authorId');
    } catch (error) {
      console.error('Error getting blog post by ID:', error);
      return null;
    }
  }

  async getBlogPostBySlug(slug: string): Promise<IBlogPost | null> {
    try {
      return await BlogPost.findOne({ slug }).populate('authorId');
    } catch (error) {
      console.error('Error getting blog post by slug:', error);
      return null;
    }
  }

  async createBlogPost(post: any): Promise<IBlogPost> {
    try {
      const newPost = new BlogPost(post);
      return await newPost.save();
    } catch (error) {
      console.error('Error creating blog post:', error);
      throw error;
    }
  }

  async updateBlogPost(id: string, updates: any): Promise<IBlogPost | null> {
    try {
      return await BlogPost.findByIdAndUpdate(id, updates, { new: true });
    } catch (error) {
      console.error('Error updating blog post:', error);
      return null;
    }
  }

  async deleteBlogPost(id: string): Promise<boolean> {
    try {
      const result = await BlogPost.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('Error deleting blog post:', error);
      return false;
    }
  }

  // Blog admin methods
  async getBlogAdminById(id: string): Promise<IBlogAdmin | null> {
    try {
      return await BlogAdmin.findById(id);
    } catch (error) {
      console.error('Error getting blog admin by ID:', error);
      return null;
    }
  }

  async getBlogAdminByUsername(username: string): Promise<IBlogAdmin | null> {
    try {
      return await BlogAdmin.findOne({ username });
    } catch (error) {
      console.error('Error getting blog admin by username:', error);
      return null;
    }
  }

  async createBlogAdmin(admin: any): Promise<IBlogAdmin> {
    try {
      const newAdmin = new BlogAdmin(admin);
      return await newAdmin.save();
    } catch (error) {
      console.error('Error creating blog admin:', error);
      throw error;
    }
  }

  // Session methods
  async createAdminSession(session: {
    sessionId: string;
    userId: string;
    expiresAt: Date;
  }): Promise<IAdminSession> {
    try {
      const newSession = new AdminSession(session);
      return await newSession.save();
    } catch (error) {
      console.error('Error creating admin session:', error);
      throw error;
    }
  }

  async getAdminSession(sessionId: string): Promise<IAdminSession | null> {
    try {
      return await AdminSession.findOne({ sessionId });
    } catch (error) {
      console.error('Error getting admin session:', error);
      return null;
    }
  }

  async deleteAdminSession(sessionId: string): Promise<boolean> {
    try {
      const result = await AdminSession.deleteOne({ sessionId });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting admin session:', error);
      return false;
    }
  }
}

// Export singleton instance
export const mongodbStorage = new MongoDBStorage(); 