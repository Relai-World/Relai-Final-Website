import { connectToMongoDB, disconnectFromMongoDB } from './server/mongodb';
import { 
  User, 
  ContactInquiry, 
  Property, 
  BlogAdmin, 
  BlogPost, 
  BlogCategory, 
  BlogPostCategory, 
  AdminSession 
} from './shared/mongodb-schemas';
import bcrypt from 'bcrypt';

async function setupMongoDB() {
  try {
    console.log('🚀 Starting MongoDB database setup...');
    
    // Connect to MongoDB
    await connectToMongoDB();
    
    // Create indexes for better performance
    console.log('📊 Creating database indexes...');
    
    // User indexes
    await User.createIndexes();
    console.log('✅ User indexes created');
    
    // Contact inquiry indexes
    await ContactInquiry.createIndexes();
    console.log('✅ Contact inquiry indexes created');
    
    // Property indexes
    await Property.createIndexes();
    console.log('✅ Property indexes created');
    
    // Blog indexes
    await BlogAdmin.createIndexes();
    await BlogPost.createIndexes();
    await BlogCategory.createIndexes();
    await BlogPostCategory.createIndexes();
    await AdminSession.createIndexes();
    console.log('✅ Blog indexes created');
    
    // Create a default admin user if none exists
    const existingAdmin = await BlogAdmin.findOne({ username: 'admin' });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const defaultAdmin = new BlogAdmin({
        username: 'admin',
        password: hashedPassword,
        email: 'admin@relai.com',
        role: 'admin'
      });
      await defaultAdmin.save();
      console.log('✅ Default admin user created (username: admin, password: admin123)');
    } else {
      console.log('ℹ️  Admin user already exists');
    }
    
    // Create default blog categories
    const defaultCategories = [
      { name: 'Real Estate', slug: 'real-estate', description: 'Real estate related articles' },
      { name: 'Property Investment', slug: 'property-investment', description: 'Investment advice and tips' },
      { name: 'Market Trends', slug: 'market-trends', description: 'Real estate market analysis' },
      { name: 'Home Buying Guide', slug: 'home-buying-guide', description: 'Guide for home buyers' }
    ];
    
    for (const category of defaultCategories) {
      const existingCategory = await BlogCategory.findOne({ slug: category.slug });
      if (!existingCategory) {
        const newCategory = new BlogCategory(category);
        await newCategory.save();
        console.log(`✅ Created blog category: ${category.name}`);
      }
    }
    
    console.log('🎉 MongoDB database setup completed successfully!');
    console.log('\n📋 Database Summary:');
    console.log('   - Collections: users, contact_inquiries, properties, blog_admins, blog_posts, blog_categories, blog_post_categories, admin_sessions');
    console.log('   - Default admin: admin / admin123');
    console.log('   - Default categories: Real Estate, Property Investment, Market Trends, Home Buying Guide');
    
  } catch (error) {
    console.error('❌ Error setting up MongoDB database:', error);
    throw error;
  } finally {
    // Close the database connection
    await disconnectFromMongoDB();
  }
}

// Run the setup if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupMongoDB()
    .then(() => {
      console.log('\n✅ MongoDB setup completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ MongoDB setup failed:', error);
      process.exit(1);
    });
}

export { setupMongoDB }; 