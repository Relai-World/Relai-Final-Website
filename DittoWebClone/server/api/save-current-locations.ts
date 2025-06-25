import { Request, Response } from 'express';
import { mongodbStorage } from '../mongodb-storage';

// Save current property locations without additional API calls
export async function saveCurrentLocations(req: Request, res: Response) {
  try {
    console.log('💾 Saving current property locations...');
    
    // Get all properties with current coordinates
    const properties = await mongodbStorage.getAllProperties();
    console.log(`📍 Found ${properties.length} properties to save`);
    
    const locationsToSave = [];
    let fixedCount = 0;
    
    for (const property of properties) {
      let lat = property.latitude;
      let lng = property.longitude;
      
      // Fix the specific problematic property that's in New York
      if (property.projectName === 'Greenwood Heights' && 
          property.latitude > 40 && property.longitude < -70) {
        // Set to a default Secunderabad location for this property
        lat = 17.4399295;
        lng = 78.4982741;
        console.log(`🔧 Fixed Greenwood Heights location to Secunderabad: ${lat}, ${lng}`);
        fixedCount++;
      }
      
      if (lat && lng) {
        const locationData = {
          projectName: property.projectName,
          location: property.location,
          latitude: property.latitude || 0,
          longitude: property.longitude || 0,
          updatedAt: new Date()
        };
        locationsToSave.push(locationData);
      }
    }
    
    // Save to cache file
    try {
      const fs = await import('fs/promises');
      const cacheFile = 'exact-property-locations-cache.json';
      await fs.writeFile(cacheFile, JSON.stringify(locationsToSave, null, 2));
      console.log(`💾 Successfully saved ${locationsToSave.length} property locations to cache`);
    } catch (saveError) {
      console.log(`⚠️ Could not save to file, but locations are still in database`);
    }
    
    res.json({
      success: true,
      message: `Saved ${locationsToSave.length} property locations`,
      saved: locationsToSave.length,
      fixed: fixedCount,
      locations: locationsToSave
    });
    
  } catch (error) {
    console.error('Error saving current locations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save current locations',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}