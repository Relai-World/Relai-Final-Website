import type { Request, Response } from "express";
import { mongodbStorage } from '../mongodb-storage';

export async function refreshGeocoding(req: Request, res: Response) {
  try {
    console.log('🔄 Starting comprehensive geocoding refresh...');
    
    // Get all properties
    const properties = await mongodbStorage.getAllProperties();
    console.log(`📊 Found ${properties.length} properties to geocode`);
    
    let successCount = 0;
    let errorCount = 0;
    
    // Process properties in batches to avoid rate limiting
    const batchSize = 10;
    const batches = [];
    
    for (let i = 0; i < properties.length; i += batchSize) {
      batches.push(properties.slice(i, i + batchSize));
    }
    
    console.log(`📦 Processing ${batches.length} batches of ${batchSize} properties each`);
    
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      console.log(`🔄 Processing batch ${batchIndex + 1}/${batches.length}`);
      
      // Process batch in parallel
      const batchPromises = batch.map(async (property) => {
        try {
          // Use the enhanced geocoding from storage
          const coordinates = await (mongodbStorage as any).getPropertyCoordinatesAsync(
            property.projectName,
            property.location
          );
          
          if (coordinates) {
            await (mongodbStorage as any).updatePropertyCoordinates(
              property.projectName,
              coordinates.latitude,
              coordinates.longitude
            );
            
            console.log(`✅ Updated ${property.projectName}: ${coordinates.latitude}, ${coordinates.longitude}`);
            return { success: true, property: property.projectName };
          } else {
            console.log(`❌ Failed to geocode ${property.projectName}`);
            return { success: false, property: property.projectName, error: 'No coordinates found' };
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error(`❌ Error updating ${property.projectName}:`, errorMessage);
          return { success: false, property: property.projectName, error: errorMessage };
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      
      // Count results
      batchResults.forEach(result => {
        if (result.success) {
          successCount++;
        } else {
          errorCount++;
        }
      });
      
      // Add delay between batches to respect rate limits
      if (batchIndex < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log(`🎉 Geocoding refresh complete! Success: ${successCount}, Errors: ${errorCount}`);
    
    res.json({
      success: true,
      message: 'Geocoding refresh completed',
      results: {
        total: properties.length,
        successful: successCount,
        failed: errorCount
      }
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error in refresh geocoding:', errorMessage);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh geocoding',
      details: errorMessage
    });
  }
}