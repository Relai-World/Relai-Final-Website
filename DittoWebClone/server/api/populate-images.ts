import { Request, Response } from 'express';
import { mongodbStorage } from '../mongodb-storage';
import { getMapImages } from './google-maps-images';

/**
 * API endpoint to populate images for all properties that don't have them
 */
export async function populateAllPropertyImagesHandler(req: Request, res: Response) {
  try {
    console.log('🚀 API: Starting bulk property images population...');
    
    // Get all properties from the database
    const allProperties = await mongodbStorage.getAllProperties();
    console.log(`📊 Found ${allProperties.length} properties to process`);
    
    // Filter properties that don't have images
    const propertiesWithoutImages = allProperties.filter(p => !p.images || p.images.length === 0);
    
    if (propertiesWithoutImages.length === 0) {
      return res.json({
        success: true,
        message: 'All properties already have images!',
        totalProperties: allProperties.length,
        propertiesWithImages: allProperties.length,
        propertiesWithoutImages: 0,
        processed: 0,
        errors: 0
      });
    }
    
    console.log(`🖼️  Found ${propertiesWithoutImages.length} properties without images`);
    
    let processedCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    
    // Process properties in smaller batches to avoid overwhelming the API
    const batchSize = 5;
    const totalBatches = Math.ceil(propertiesWithoutImages.length / batchSize);
    
    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const startIndex = batchIndex * batchSize;
      const endIndex = Math.min(startIndex + batchSize, propertiesWithoutImages.length);
      const batchProperties = propertiesWithoutImages.slice(startIndex, endIndex);
      
      console.log(`🔄 Processing batch ${batchIndex + 1}/${totalBatches} (${batchProperties.length} properties)`);
      
      // Process each property in the current batch
      for (const property of batchProperties) {
        try {
          // Always refresh images, even if they already exist
          if (property.images && property.images.length > 0) {
            console.log(`🔄 Overwriting existing images for ${property.projectName || property.name}`);
          }
          
          // Validate property has required fields
          const propertyName = property.projectName || property.name;
          const location = property.location;
          
          if (!propertyName || !location) {
            console.log(`⚠️  Skipping property with ID ${(property._id as any).toString()} - missing name or location`);
            errorCount++;
            continue;
          }
          
          console.log(`🖼️  Fetching images for: ${propertyName} in ${location}`);
          
          // Fetch images using Google Maps API (max 3 images)
          const images = await getMapImages(propertyName, location, 3);
          
          if (images && images.length > 0) {
            // Update the property in the database
            const updateSuccess = await mongodbStorage.updatePropertyImages(
              (property._id as any).toString(), 
              images.slice(0, 3) // Ensure max 3 images
            );
            
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
          
          // Add delay between API calls to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1500));
          
        } catch (error) {
          console.error(`❌ Error processing property ${property.projectName || property.name}:`, error instanceof Error ? error.message : 'Unknown error');
          errorCount++;
        }
      }
      
      // Add delay between batches
      if (batchIndex < totalBatches - 1) {
        console.log('⏳ Waiting 3 seconds before next batch...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    
    // Get final statistics
    const updatedProperties = await mongodbStorage.getAllProperties();
    const finalPropertiesWithImages = updatedProperties.filter(p => p.images && p.images.length > 0);
    const finalPropertiesWithoutImages = updatedProperties.filter(p => !p.images || p.images.length === 0);
    
    console.log('🎉 Bulk property images population completed!');
    
    res.json({
      success: true,
      message: 'Property images population completed successfully',
      statistics: {
        totalProperties: allProperties.length,
        propertiesWithImages: finalPropertiesWithImages.length,
        propertiesWithoutImages: finalPropertiesWithoutImages.length,
        coverage: `${((finalPropertiesWithImages.length / updatedProperties.length) * 100).toFixed(1)}%`
      },
      processing: {
        processed: processedCount,
        skipped: skippedCount,
        errors: errorCount
      }
    });
    
  } catch (error) {
    console.error('❌ Fatal error in populateAllPropertyImagesHandler:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to populate property images',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * API endpoint to populate images for specific properties
 */
export async function populateSpecificPropertyImagesHandler(req: Request, res: Response) {
  try {
    const { propertyIds } = req.body;
    
    if (!propertyIds || !Array.isArray(propertyIds) || propertyIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Property IDs array is required'
      });
    }
    
    console.log(`🚀 API: Starting image population for ${propertyIds.length} specific properties...`);
    
    let processedCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    const results = [];
    
    for (const propertyId of propertyIds) {
      try {
        const property = await mongodbStorage.getPropertyById(propertyId);
        
        if (!property) {
          console.log(`⚠️  Property with ID ${propertyId} not found`);
          results.push({ propertyId, success: false, error: 'Property not found' });
          errorCount++;
          continue;
        }
        
        // Skip if already has images
        if (property.images && property.images.length > 0) {
          console.log(`⏭️  Property ${property.projectName || property.name} already has ${property.images.length} images`);
          results.push({ 
            propertyId, 
            success: true, 
            skipped: true, 
            message: 'Already has images',
            imageCount: property.images.length 
          });
          skippedCount++;
          continue;
        }
        
        const propertyName = property.projectName || property.name;
        const location = property.location;
        
        if (!propertyName || !location) {
          console.log(`⚠️  Property ${propertyId} missing name or location`);
          results.push({ propertyId, success: false, error: 'Missing property name or location' });
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
            results.push({ 
              propertyId, 
              success: true, 
              imageCount: images.length,
              images: images.slice(0, 3)
            });
          } else {
            console.log(`❌ Failed to update database for: ${propertyName}`);
            results.push({ propertyId, success: false, error: 'Failed to update database' });
            errorCount++;
          }
        } else {
          console.log(`⚠️  No images found for: ${propertyName}`);
          results.push({ propertyId, success: false, error: 'No images found' });
          errorCount++;
        }
        
        // Add delay between API calls
        await new Promise(resolve => setTimeout(resolve, 1500));
        
      } catch (error) {
        console.error(`❌ Error processing property ${propertyId}:`, error instanceof Error ? error.message : 'Unknown error');
        results.push({ propertyId, success: false, error: error instanceof Error ? error.message : 'Unknown error' });
        errorCount++;
      }
    }
    
    console.log('🎉 Specific properties image population completed!');
    
    res.json({
      success: true,
      message: 'Specific properties image population completed',
      statistics: {
        total: propertyIds.length,
        processed: processedCount,
        skipped: skippedCount,
        errors: errorCount
      },
      results
    });
    
  } catch (error) {
    console.error('❌ Fatal error in populateSpecificPropertyImagesHandler:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to populate specific property images',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * API endpoint to check current image status
 */
export async function checkPropertyImagesStatusHandler(req: Request, res: Response) {
  try {
    console.log('🔍 API: Checking property images status...');
    
    const allProperties = await mongodbStorage.getAllProperties();
    const propertiesWithImages = allProperties.filter(p => p.images && p.images.length > 0);
    const propertiesWithoutImages = allProperties.filter(p => !p.images || p.images.length === 0);
    
    // Get sample properties without images
    const samplePropertiesWithoutImages = propertiesWithoutImages.slice(0, 10).map(p => ({
      id: p._id,
      name: p.projectName || p.name,
      location: p.location
    }));
    
    res.json({
      success: true,
      statistics: {
        totalProperties: allProperties.length,
        propertiesWithImages: propertiesWithImages.length,
        propertiesWithoutImages: propertiesWithoutImages.length,
        coverage: `${((propertiesWithImages.length / allProperties.length) * 100).toFixed(1)}%`
      },
      samplePropertiesWithoutImages,
      hasMorePropertiesWithoutImages: propertiesWithoutImages.length > 10
    });
    
  } catch (error) {
    console.error('❌ Error in checkPropertyImagesStatusHandler:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check property images status',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 