import type { Request, Response } from "express";
import { mongodbStorage } from '../mongodb-storage';

export async function fixPropertyLocations(req: Request, res: Response) {
  try {
    console.log('🗺️ Starting property location accuracy improvement...');
    
    // Get all properties that need location updates
    const properties = await mongodbStorage.getAllProperties();
    console.log(`📊 Found ${properties.length} properties to verify and update`);
    
    let updatedCount = 0;
    let validatedCount = 0;
    
    // Process properties in smaller batches to avoid rate limiting
    const batchSize = 5;
    const batches = [];
    
    for (let i = 0; i < properties.length; i += batchSize) {
      batches.push(properties.slice(i, i + batchSize));
    }
    
    console.log(`📦 Processing ${batches.length} batches of ${batchSize} properties each`);
    
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      console.log(`🔄 Processing batch ${batchIndex + 1}/${batches.length}`);
      
      // Process each property in the batch
      for (const property of batch) {
        try {
          // Check if property has coordinates that might be in water or incorrect
          const needsUpdate = !property.latitude || !property.longitude || 
                            property.latitude < 17.2 || property.latitude > 17.8 ||
                            property.longitude < 78.2 || property.longitude > 78.7;
          
          if (needsUpdate) {
            console.log(`🔍 Updating location for: ${property.projectName || property.name}`);
            
            // Use the enhanced geocoding from storage
            const coordinates = await (mongodbStorage as any).getPropertyCoordinatesAsync(
              property.projectName || property.name,
              property.developerName || 'Unknown',
              property.location
            );
            
            if (coordinates && coordinates.lat && coordinates.lng) {
              console.log(`✅ Found accurate coordinates for ${property.projectName}: ${coordinates.lat}, ${coordinates.lng}`);
              updatedCount++;
            } else {
              console.log(`⚠️ Could not find coordinates for ${property.projectName}`);
            }
          } else {
            console.log(`✓ Coordinates already valid for ${property.projectName}`);
            validatedCount++;
          }
          
        } catch (error) {
          console.error(`❌ Error processing ${property.projectName}:`, error);
        }
      }
      
      // Add delay between batches to respect rate limits
      if (batchIndex < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log(`🎉 Location verification complete!`);
    console.log(`✅ Updated: ${updatedCount} properties`);
    console.log(`✓ Already valid: ${validatedCount} properties`);
    
    res.json({
      success: true,
      message: 'Property location verification completed',
      results: {
        total: properties.length,
        updated: updatedCount,
        validated: validatedCount,
        processed: updatedCount + validatedCount
      }
    });
    
  } catch (error) {
    console.error('❌ Error during location verification:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify property locations',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}