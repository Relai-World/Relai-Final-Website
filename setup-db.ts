import { pool, db } from './server/db';
import { properties, users } from './shared/schema';
import { sql } from 'drizzle-orm';

async function setupDatabase() {
  try {
    console.log('Setting up database...');
    
    // Create tables based on our schema
    console.log('Creating tables...');
    
    // Create users table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );
    `);
    console.log('✓ Users table created');
    
    // Drop existing properties table if it exists
    await db.execute(sql`DROP TABLE IF EXISTS properties;`);
    console.log('✓ Old properties table dropped');
    
    // Create new properties table with expanded schema
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS properties (
        id SERIAL PRIMARY KEY,
        property_id TEXT NOT NULL UNIQUE,
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
    console.log('✓ New properties table created');
    
    console.log('Database setup complete!');
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    // Close the pool
    await pool.end();
  }
}

setupDatabase();