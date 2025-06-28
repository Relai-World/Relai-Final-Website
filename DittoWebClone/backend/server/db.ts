import { connectToMongoDB, disconnectFromMongoDB, mongoose } from './mongodb';
import * as models from '../shared/mongodb-schemas';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Export MongoDB connection functions
export { connectToMongoDB, disconnectFromMongoDB, mongoose };

// Export all models
export const {
  User,
  ContactInquiry,
  Property,
  BlogAdmin,
  BlogPost,
  BlogCategory,
  BlogPostCategory,
  AdminSession
} = models;

// Export models as db object for compatibility
export const db = {
  User,
  ContactInquiry,
  Property,
  BlogAdmin,
  BlogPost,
  BlogCategory,
  BlogPostCategory,
  AdminSession
};

// Initialize MongoDB connection
export async function initializeDatabase() {
  try {
    await connectToMongoDB();
    console.log('✅ MongoDB database initialized successfully!');
  } catch (error) {
    console.error('❌ Failed to initialize MongoDB database:', error);
    throw error;
  }
}

// Graceful shutdown function
export async function closeDatabase() {
  try {
    await disconnectFromMongoDB();
    console.log('✅ MongoDB database connection closed');
  } catch (error) {
    console.error('❌ Error closing MongoDB database connection:', error);
  }
}