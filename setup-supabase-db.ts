import { db } from './server/db';
import * as schema from './shared/schema';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

async function main() {
  try {
    console.log('Starting Supabase database setup...');
    
    // Create tables if they don't exist
    console.log('Creating tables if they don\'t exist...');
    
    // Create users table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );
    `);
    console.log('Created users table');
    
    // Create contact_inquiries table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS contact_inquiries (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT NOT NULL,
        meeting_time TIMESTAMP NOT NULL,
        property_id TEXT NOT NULL,
        property_name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('Created contact_inquiries table');
    
    // Create properties table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS properties (
        id SERIAL PRIMARY KEY,
        developer_name TEXT,
        rera_number TEXT,
        project_name TEXT NOT NULL,
        construction_status TEXT,
        property_type TEXT NOT NULL,
        location TEXT NOT NULL,
        possession_date TEXT,
        is_gated_community BOOLEAN,
        total_units INTEGER,
        area_size_acres DOUBLE PRECISION,
        configurations TEXT,
        min_size_sqft INTEGER,
        max_size_sqft INTEGER,
        price_per_sqft DOUBLE PRECISION,
        price_per_sqft_otp DOUBLE PRECISION,
        price DOUBLE PRECISION NOT NULL,
        longitude DOUBLE PRECISION,
        latitude DOUBLE PRECISION,
        project_documents_link TEXT,
        source TEXT,
        builder_contact_info TEXT,
        listing_type TEXT,
        loan_approved_banks TEXT[],
        nearby_locations TEXT[],
        remarks_comments TEXT,
        amenities TEXT[],
        faq TEXT[],
        name TEXT NOT NULL,
        bedrooms INTEGER,
        bathrooms INTEGER,
        area INTEGER NOT NULL,
        description TEXT,
        features TEXT[],
        images TEXT[],
        builder TEXT,
        possession TEXT,
        rating DOUBLE PRECISION,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('Created properties table');
    
    console.log('Database setup completed successfully!');
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    // Close the database connection
    process.exit(0);
  }
}

main();