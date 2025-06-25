// Test script to demonstrate property image fetching
const { Pool } = require('@neondatabase/serverless');
const fetch = require('node-fetch');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function testImageFetch() {
  console.log('Testing property image fetching system...');
  
  try {
    // Test database connection
    const dbTest = await pool.query('SELECT COUNT(*) FROM property_images');
    console.log(`Current images in database: ${dbTest.rows[0].count}`);
    
    // Get a sample property from the main properties data
    const propertyQuery = `
      SELECT "ProjectName", "Location", "DeveloperName" 
      FROM document_metadata 
      WHERE "ProjectName" IS NOT NULL 
      AND "Location" IS NOT NULL 
      LIMIT 1
    `;
    
    const propertyResult = await pool.query(propertyQuery);
    
    if (propertyResult.rows.length > 0) {
      const property = propertyResult.rows[0];
      console.log(`Testing with property: ${property.ProjectName} in ${property.Location}`);
      
      // Simulate Google Maps API image fetching
      const mockImages = [
        {
          property_id: '1',
          image_url: `https://maps.googleapis.com/maps/api/streetview?size=400x300&location=${encodeURIComponent(property.Location + ', Hyderabad')}&key=DEMO`,
          image_type: 'streetview',
          image_order: 1
        },
        {
          property_id: '1', 
          image_url: `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(property.Location + ', Hyderabad')}&zoom=15&size=400x300&maptype=satellite&key=DEMO`,
          image_type: 'satellite',
          image_order: 2
        },
        {
          property_id: '1',
          image_url: `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(property.Location + ', Hyderabad')}&zoom=14&size=400x300&maptype=roadmap&key=DEMO`,
          image_type: 'nearby_places',
          image_order: 3
        }
      ];
      
      // Insert test images into database
      for (const image of mockImages) {
        const insertQuery = `
          INSERT INTO property_images (property_id, image_url, image_type, image_order)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT DO NOTHING
        `;
        
        await pool.query(insertQuery, [
          image.property_id,
          image.image_url,
          image.image_type,
          image.image_order
        ]);
      }
      
      console.log('✅ Successfully inserted test images');
      
      // Verify insertion
      const verifyQuery = 'SELECT COUNT(*) FROM property_images WHERE property_id = $1';
      const verifyResult = await pool.query(verifyQuery, ['1']);
      console.log(`Images for property 1: ${verifyResult.rows[0].count}`);
      
    } else {
      console.log('No properties found in database');
    }
    
  } catch (error) {
    console.error('Error testing image fetch:', error);
  }
}

testImageFetch();