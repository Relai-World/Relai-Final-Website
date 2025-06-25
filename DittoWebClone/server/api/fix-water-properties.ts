import { Request, Response } from 'express';
import { mongodbStorage } from '../mongodb-storage';

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

// Identify and fix properties that might be showing in water
export async function fixWaterProperties(req: Request, res: Response) {
  try {
    console.log('🌊 Searching for properties that might be in water...');
    
    if (!GOOGLE_API_KEY) {
      return res.status(400).json({
        success: false,
        error: 'Google API key not found'
      });
    }

    // Get all properties
    const properties = await mongodbStorage.getAllProperties();
    console.log(`📍 Checking ${properties.length} properties for water locations`);
    
    const waterProperties = [];
    const fixedProperties = [];
    
    for (const property of properties) {
      // Check if property coordinates are in water (Hussain Sagar lake area)
      const lat = property.latitude;
      const lng = property.longitude;
      
      // Skip properties without coordinates
      if (!lat || !lng) continue;
      
      // Hussain Sagar lake approximate boundaries
      const isInWater = (
        lat >= 17.415 && lat <= 17.430 && 
        lng >= 78.470 && lng <= 78.485
      ) || (
        // Check for other water bodies or obviously wrong coordinates
        lat < 17.0 || lat > 18.0 || lng < 78.0 || lng > 79.0
      );
      
      if (isInWater) {
        waterProperties.push(property);
        console.log(`🌊 Found water property: ${property.projectName} at ${lat}, ${lng}`);
        
        // Try different search strategies for this property
        const strategies = [
          `${property.projectName} ${property.location} Hyderabad`,
          `${property.projectName} by ${property.developerName || ''} Hyderabad`,
          `${property.developerName || ''} ${property.location} Hyderabad`,
          `${property.projectName} apartments ${property.location}`,
          `${property.projectName} construction ${property.location}`
        ];
        
        let found = false;
        for (const strategy of strategies) {
          if (found) break;
          
          try {
            console.log(`🔍 Trying strategy: ${strategy}`);
            
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(strategy)}&key=${GOOGLE_API_KEY}`
            );
            
            if (response.ok) {
              const data = await response.json();
              if (data.status === 'OK' && data.results.length > 0) {
                const result = data.results[0];
                const newLat = result.geometry.location.lat;
                const newLng = result.geometry.location.lng;
                
                // Verify this is in Hyderabad area (not in water)
                if (newLat >= 17.0 && newLat <= 18.0 && newLng >= 78.0 && newLng <= 79.0) {
                  console.log(`✅ Fixed ${property.projectName}: ${newLat}, ${newLng}`);
                  fixedProperties.push({
                    projectName: property.projectName,
                    oldCoords: { lat, lng },
                    newCoords: { lat: newLat, lng: newLng },
                    strategy: strategy
                  });
                  found = true;
                }
              }
            }
          } catch (error) {
            console.error(`Error with strategy "${strategy}":`, error);
          }
          
          // Add delay between requests
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        if (!found) {
          console.log(`⚠️ Could not fix ${property.projectName}`);
        }
      }
    }
    
    console.log(`🎯 Found ${waterProperties.length} water properties, fixed ${fixedProperties.length}`);
    
    res.json({
      success: true,
      message: `Found ${waterProperties.length} water properties, fixed ${fixedProperties.length}`,
      waterProperties: waterProperties.length,
      fixedProperties: fixedProperties,
      stats: {
        total: properties.length,
        inWater: waterProperties.length,
        fixed: fixedProperties.length
      }
    });
    
  } catch (error) {
    console.error('Error fixing water properties:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fix water properties',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}