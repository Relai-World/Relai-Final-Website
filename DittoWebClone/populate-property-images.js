const mongoose = require('mongoose');
const { getMapImages } = require('./server/api/google-maps-images');
const { mongodbStorage } = require('./server/mongodb-storage');

// MongoDB connection string - update this with your actual connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/relai';

async function populatePropertyImages() {
  try {
    console.log('🚀 Starting property images population script...');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Get all properties from the database
    const allProperties = await mongodbStorage.getAllProperties();
    console.log(`📊 Found ${allProperties.length} properties to process`);
    
    let processedCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    
    // Process properties in batches to avoid overwhelming the API
    const batchSize = 10;
    const totalBatches = Math.ceil(allProperties.length / batchSize);
    
    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const startIndex = batchIndex * batchSize;
      const endIndex = Math.min(startIndex + batchSize, allProperties.length);
      const batchProperties = allProperties.slice(startIndex, endIndex);
      
      console.log(`\n🔄 Processing batch ${batchIndex + 1}/${totalBatches} (properties ${startIndex + 1}-${endIndex})`);
      
      // Process each property in the current batch
      for (const property of batchProperties) {
        try {
          // Skip properties that already have images
          if (property.images && property.images.length > 0) {
            console.log(`⏭️  Skipping ${property.projectName || property.name} - already has ${property.images.length} images`);
            skippedCount++;
            continue;
          }
          
          // Validate property has required fields
          const propertyName = property.projectName || property.name;
          const location = property.location;
          
          if (!propertyName || !location) {
            console.log(`⚠️  Skipping property with ID ${property._id} - missing name or location`);
            errorCount++;
            continue;
          }
          
          console.log(`🖼️  Fetching images for: ${propertyName} in ${location}`);
          
          // Fetch images using Google Maps API (max 3 images)
          const images = await getMapImages(propertyName, location, 3);
          
          if (images && images.length > 0) {
            // Update the property in the database
            const updateSuccess = await mongodbStorage.updatePropertyImages(
              property._id.toString(), 
              images.slice(0, 3) // Ensure max 3 images
            );
            
            if (updateSuccess) {
              processedCount++;
              console.log(`✅ [${processedCount}] Added ${images.length} images to: ${propertyName}`);
              console.log(`   Images: ${images.slice(0, 3).join(', ')}`);
            } else {
              console.log(`❌ Failed to update database for: ${propertyName}`);
              errorCount++;
            }
          } else {
            console.log(`⚠️  No images found for: ${propertyName}`);
            errorCount++;
          }
          
          // Add delay between API calls to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (error) {
          console.error(`❌ Error processing property ${property.projectName || property.name}:`, error.message);
          errorCount++;
        }
      }
      
      // Add delay between batches
      if (batchIndex < totalBatches - 1) {
        console.log('⏳ Waiting 2 seconds before next batch...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    // Print final statistics
    console.log('\n🎉 Property images population completed!');
    console.log('📈 Statistics:');
    console.log(`   Total properties: ${allProperties.length}`);
    console.log(`   Processed: ${processedCount}`);
    console.log(`   Skipped (already had images): ${skippedCount}`);
    console.log(`   Errors: ${errorCount}`);
    
    // Get updated statistics
    const updatedProperties = await mongodbStorage.getAllProperties();
    const propertiesWithImages = updatedProperties.filter(p => p.images && p.images.length > 0);
    const propertiesWithoutImages = updatedProperties.filter(p => !p.images || p.images.length === 0);
    
    console.log('\n📊 Final Database Status:');
    console.log(`   Properties with images: ${propertiesWithImages.length}`);
    console.log(`   Properties without images: ${propertiesWithoutImages.length}`);
    console.log(`   Coverage: ${((propertiesWithImages.length / updatedProperties.length) * 100).toFixed(1)}%`);
    
  } catch (error) {
    console.error('❌ Fatal error in populatePropertyImages:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Function to check current image status
async function checkImageStatus() {
  try {
    console.log('🔍 Checking current image status...');
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const allProperties = await mongodbStorage.getAllProperties();
    const propertiesWithImages = allProperties.filter(p => p.images && p.images.length > 0);
    const propertiesWithoutImages = allProperties.filter(p => !p.images || p.images.length === 0);
    
    console.log('\n📊 Current Image Status:');
    console.log(`   Total properties: ${allProperties.length}`);
    console.log(`   Properties with images: ${propertiesWithImages.length}`);
    console.log(`   Properties without images: ${propertiesWithoutImages.length}`);
    console.log(`   Coverage: ${((propertiesWithImages.length / allProperties.length) * 100).toFixed(1)}%`);
    
    if (propertiesWithoutImages.length > 0) {
      console.log('\n📋 Properties without images:');
      propertiesWithoutImages.slice(0, 10).forEach((property, index) => {
        console.log(`   ${index + 1}. ${property.projectName || property.name} (${property.location})`);
      });
      if (propertiesWithoutImages.length > 10) {
        console.log(`   ... and ${propertiesWithoutImages.length - 10} more`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking image status:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Function to populate images for specific properties
async function populateImagesForProperties(propertyIds) {
  try {
    console.log(`🚀 Starting image population for ${propertyIds.length} specific properties...`);
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    let processedCount = 0;
    let errorCount = 0;
    
    for (const propertyId of propertyIds) {
      try {
        const property = await mongodbStorage.getPropertyById(propertyId);
        
        if (!property) {
          console.log(`⚠️  Property with ID ${propertyId} not found`);
          errorCount++;
          continue;
        }
        
        // Skip if already has images
        if (property.images && property.images.length > 0) {
          console.log(`⏭️  Property ${property.projectName || property.name} already has ${property.images.length} images`);
          continue;
        }
        
        const propertyName = property.projectName || property.name;
        const location = property.location;
        
        if (!propertyName || !location) {
          console.log(`⚠️  Property ${propertyId} missing name or location`);
          errorCount++;
          continue;
        }
        
        console.log(`🖼️  Fetching images for: ${propertyName}`);
        const images = await getMapImages(propertyName, location, 3);
        
        if (images && images.length > 0) {
          const updateSuccess = await mongodbStorage.updatePropertyImages(propertyId, images.slice(0, 3));
          
          if (updateSuccess) {
            processedCount++;
            console.log(`✅ [${processedCount}] Added ${images.length} images to: ${propertyName}`);
          } else {
            console.log(`❌ Failed to update database for: ${propertyName}`);
            errorCount++;
          }
        } else {
          console.log(`⚠️  No images found for: ${propertyName}`);
          errorCount++;
        }
        
        // Add delay between API calls
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Error processing property ${propertyId}:`, error.message);
        errorCount++;
      }
    }
    
    console.log('\n🎉 Specific properties image population completed!');
    console.log(`   Processed: ${processedCount}`);
    console.log(`   Errors: ${errorCount}`);
    
  } catch (error) {
    console.error('❌ Fatal error in populateImagesForProperties:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Main execution
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'check':
      checkImageStatus();
      break;
    case 'populate':
      populatePropertyImages();
      break;
    case 'populate-specific':
      const propertyIds = process.argv.slice(3);
      if (propertyIds.length === 0) {
        console.log('❌ Please provide property IDs as arguments');
        console.log('Usage: node populate-property-images.js populate-specific <id1> <id2> ...');
        process.exit(1);
      }
      populateImagesForProperties(propertyIds);
      break;
    default:
      console.log('📖 Usage:');
      console.log('   node populate-property-images.js check                    - Check current image status');
      console.log('   node populate-property-images.js populate                 - Populate images for all properties');
      console.log('   node populate-property-images.js populate-specific <ids>  - Populate images for specific properties');
      console.log('');
      console.log('Examples:');
      console.log('   node populate-property-images.js check');
      console.log('   node populate-property-images.js populate');
      console.log('   node populate-property-images.js populate-specific 507f1f77bcf86cd799439011 507f1f77bcf86cd799439012');
  }
}

module.exports = {
  populatePropertyImages,
  checkImageStatus,
  populateImagesForProperties
}; 