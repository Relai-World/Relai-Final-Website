import { connectToMongoDB, disconnectFromMongoDB } from './server/mongodb';
import { Property, ContactInquiry, User, BlogAdmin, BlogPost, BlogCategory } from './shared/mongodb-schemas';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

// Load environment variables
dotenv.config();

// Initialize Supabase client for migration
const supabaseUrl = process.env.SUPABASE_URL || 'https://sshlgndtfgcetserjfow.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzaGxnbmR0ZmdjZXRzZXJqZm93Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzkwOTkzNiwiZXhwIjoyMDYzNDg1OTM2fQ.JgQPgcUhWcIP5NQfXDBGAJbiiJ4ulbhkNhQ5b6t-lG8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateToMongoDB() {
  try {
    console.log('🚀 Starting migration from Supabase to MongoDB...');
    
    // Connect to MongoDB
    await connectToMongoDB();
    console.log('✅ Connected to MongoDB');
    
    // Test Supabase connection
    console.log('🔄 Testing Supabase connection...');
    const { data: testData, error: testError } = await supabase
      .from('document_metadata')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.warn('⚠️  Supabase connection failed, but continuing with migration...');
      console.warn('   This might mean Supabase is no longer available or credentials are invalid');
    } else {
      console.log('✅ Supabase connection successful');
    }
    
    // Migrate properties from document_metadata table
    console.log('\n📊 Migrating properties...');
    try {
      const { data: properties, error } = await supabase
        .from('document_metadata')
        .select('*');
      
      if (error) {
        console.warn('⚠️  Could not fetch properties from Supabase:', error.message);
      } else if (properties && properties.length > 0) {
        let migratedCount = 0;
        let skippedCount = 0;
        
        for (const property of properties) {
          try {
            // Check if property already exists in MongoDB
            const existingProperty = await Property.findOne({ propertyId: property.id?.toString() });
            if (existingProperty) {
              console.log(`⏭️  Skipping property ${property.ProjectName || property.id} - already exists`);
              skippedCount++;
              continue;
            }
            
            // Transform Supabase property to MongoDB format
            const mongoProperty = {
              propertyId: property.id?.toString() || `PROP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              developerName: property.DeveloperName,
              reraNumber: property.RERA_Number,
              projectName: property.ProjectName || 'Unknown Project',
              constructionStatus: property.ConstructionStatus,
              propertyType: property.PropertyType || 'Residential',
              location: property.Location || 'Hyderabad',
              possessionDate: property.PossessionDate,
              isGatedCommunity: property.IsGatedCommunity === 'Yes',
              totalUnits: parseInt(property.TotalUnits) || undefined,
              areaSizeAcres: parseFloat(property.AreaSizeAcres) || undefined,
              configurations: property.Configurations,
              minSizeSqft: parseInt(property.MinSizeSqft) || undefined,
              maxSizeSqft: parseInt(property.MaxSizeSqft) || undefined,
              pricePerSqft: parseFloat(property.PricePerSqft) || undefined,
              pricePerSqftOTP: parseFloat(property.PricePerSqftOTP) || undefined,
              price: parseFloat(property.Price) || 0,
              longitude: parseFloat(property.Longitude) || undefined,
              latitude: parseFloat(property.Latitude) || undefined,
              projectDocumentsLink: property.ProjectDocumentsLink,
              source: property.Source,
              builderContactInfo: property.BuilderContactInfo,
              listingType: property.ListingType,
              loanApprovedBanks: property.LoanApprovedBanks ? property.LoanApprovedBanks.split(',').map((bank: string) => bank.trim()) : undefined,
              nearbyLocations: property.NearbyLocations ? property.NearbyLocations.split(',').map((location: string) => location.trim()) : undefined,
              remarksComments: property.RemarksComments,
              amenities: property.Amenities ? property.Amenities.split(',').map((amenity: string) => amenity.trim()) : undefined,
              faq: property.FAQ ? property.FAQ.split(',').map((question: string) => question.trim()) : undefined,
              name: property.Name || property.ProjectName || 'Unknown Property',
              bedrooms: parseInt(property.Bedrooms) || undefined,
              bathrooms: parseInt(property.Bathrooms) || undefined,
              area: parseInt(property.Area) || parseInt(property.MinSizeSqft) || 0,
              description: property.Description || property.RemarksComments,
              features: property.Features ? property.Features.split(',').map((feature: string) => feature.trim()) : undefined,
              images: property.Images ? property.Images.split(',').map((image: string) => image.trim()) : undefined,
              builder: property.Builder || property.DeveloperName,
              possession: property.Possession || property.PossessionDate,
              rating: parseFloat(property.Rating) || undefined
            };
            
            const newProperty = new Property(mongoProperty);
            await newProperty.save();
            migratedCount++;
            console.log(`✅ Migrated property: ${mongoProperty.projectName}`);
            
          } catch (propertyError) {
            console.error(`❌ Error migrating property ${property.ProjectName || property.id}:`, propertyError);
          }
        }
        
        console.log(`📊 Properties migration completed: ${migratedCount} migrated, ${skippedCount} skipped`);
      } else {
        console.log('ℹ️  No properties found in Supabase to migrate');
      }
    } catch (error) {
      console.warn('⚠️  Could not migrate properties:', error);
    }
    
    // Migrate contact inquiries
    console.log('\n📞 Migrating contact inquiries...');
    try {
      const { data: inquiries, error } = await supabase
        .from('contact_inquiries')
        .select('*');
      
      if (error) {
        console.warn('⚠️  Could not fetch contact inquiries from Supabase:', error.message);
      } else if (inquiries && inquiries.length > 0) {
        let migratedCount = 0;
        
        for (const inquiry of inquiries) {
          try {
            const mongoInquiry = {
              name: inquiry.name,
              phone: inquiry.phone,
              email: inquiry.email,
              meetingTime: new Date(inquiry.meeting_time),
              propertyId: inquiry.property_id,
              propertyName: inquiry.property_name
            };
            
            const newInquiry = new ContactInquiry(mongoInquiry);
            await newInquiry.save();
            migratedCount++;
            console.log(`✅ Migrated contact inquiry: ${inquiry.name}`);
            
          } catch (inquiryError) {
            console.error(`❌ Error migrating contact inquiry ${inquiry.name}:`, inquiryError);
          }
        }
        
        console.log(`📞 Contact inquiries migration completed: ${migratedCount} migrated`);
      } else {
        console.log('ℹ️  No contact inquiries found in Supabase to migrate');
      }
    } catch (error) {
      console.warn('⚠️  Could not migrate contact inquiries:', error);
    }
    
    // Migrate users
    console.log('\n👥 Migrating users...');
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('*');
      
      if (error) {
        console.warn('⚠️  Could not fetch users from Supabase:', error.message);
      } else if (users && users.length > 0) {
        let migratedCount = 0;
        
        for (const user of users) {
          try {
            // Hash the password if it's not already hashed
            let hashedPassword = user.password;
            if (!user.password.startsWith('$2b$')) {
              hashedPassword = await bcrypt.hash(user.password, 10);
            }
            
            const mongoUser = {
              username: user.username,
              password: hashedPassword
            };
            
            const newUser = new User(mongoUser);
            await newUser.save();
            migratedCount++;
            console.log(`✅ Migrated user: ${user.username}`);
            
          } catch (userError) {
            console.error(`❌ Error migrating user ${user.username}:`, userError);
          }
        }
        
        console.log(`👥 Users migration completed: ${migratedCount} migrated`);
      } else {
        console.log('ℹ️  No users found in Supabase to migrate');
      }
    } catch (error) {
      console.warn('⚠️  Could not migrate users:', error);
    }
    
    console.log('\n🎉 Migration completed!');
    console.log('\n📋 Migration Summary:');
    console.log('   - Properties: Migrated from document_metadata table');
    console.log('   - Contact Inquiries: Migrated from contact_inquiries table');
    console.log('   - Users: Migrated from users table');
    console.log('   - Blog data: Will be created fresh (no migration needed)');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    // Close the database connection
    await disconnectFromMongoDB();
  }
}

// Run the migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateToMongoDB()
    .then(() => {
      console.log('\n✅ Migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Migration failed:', error);
      process.exit(1);
    });
}

export { migrateToMongoDB }; 