import { Request, Response } from 'express';
import { mongodbStorage } from '../mongodb-storage';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_API_KEY;

interface PropertyCoordinates {
  projectName: string;
  location: string;
  lat: number;
  lng: number;
}

// Geocode exact property location
async function geocodePropertyLocation(projectName: string, location: string): Promise<{lat: number, lng: number} | null> {
  if (!GOOGLE_MAPS_API_KEY) {
    console.error('Google Maps API key not found');
    return null;
  }

  try {
    // Create detailed address for better geocoding accuracy
    const detailedAddress = `${projectName}, ${location}, Hyderabad, Telangana, India`;
    console.log(`Geocoding: ${detailedAddress}`);
    
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(detailedAddress)}&key=${GOOGLE_MAPS_API_KEY}`
    );
    
    if (!response.ok) {
      console.error(`Geocoding API error: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    if (data.status === 'OK' && data.results.length > 0) {
      const result = {
        lat: data.results[0].geometry.location.lat,
        lng: data.results[0].geometry.location.lng
      };
      
      console.log(`✓ Geocoded ${projectName}: ${result.lat}, ${result.lng}`);
      return result;
    } else {
      console.log(`⚠ Geocoding failed for ${projectName}: ${data.status}`);
      return null;
    }
  } catch (error) {
    console.error(`Error geocoding ${projectName}:`, error);
    return null;
  }
}

export async function geocodeExactProperties(req: Request, res: Response) {
  try {
    console.log('🗺️ Starting exact property geocoding process...');
    
    // Get all properties from database
    const properties = await mongodbStorage.getAllProperties();
    console.log(`📍 Found ${properties.length} properties to geocode with exact coordinates`);
    
    const geocodedProperties: PropertyCoordinates[] = [];
    let successCount = 0;
    let failureCount = 0;
    
    // Process properties in batches to respect API rate limits
    const batchSize = 10;
    const batches = Math.ceil(properties.length / batchSize);
    
    for (let batchIndex = 0; batchIndex < batches; batchIndex++) {
      const start = batchIndex * batchSize;
      const end = Math.min(start + batchSize, properties.length);
      const batch = properties.slice(start, end);
      
      console.log(`Processing batch ${batchIndex + 1}/${batches} (properties ${start + 1} to ${end})`);
      
      for (const property of batch) {
        const coords = await geocodePropertyLocation(property.projectName, property.location);
        
        if (coords) {
          geocodedProperties.push({
            projectName: property.projectName,
            location: property.location,
            lat: coords.lat,
            lng: coords.lng
          });
          successCount++;
        } else {
          failureCount++;
        }
        
        // Add delay between requests to respect API rate limits
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // Longer delay between batches
      if (batchIndex < batches - 1) {
        console.log('⏳ Waiting before next batch...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log(`🎯 Geocoding complete: ${successCount} successful, ${failureCount} failed`);
    
    // Save geocoded coordinates to cache file
    try {
      const fs = require('fs');
      const cacheFile = 'property-coordinates-cache.json';
      fs.writeFileSync(cacheFile, JSON.stringify(geocodedProperties, null, 2));
      console.log(`💾 Saved ${geocodedProperties.length} property coordinates to cache`);
    } catch (saveError) {
      console.error('Error saving coordinates cache:', saveError);
    }
    
    res.json({
      success: true,
      message: `Geocoded ${successCount} properties with exact coordinates`,
      properties: geocodedProperties,
      stats: {
        total: properties.length,
        successful: successCount,
        failed: failureCount,
        batches: batches
      }
    });
    
  } catch (error) {
    console.error('Error in exact property geocoding:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to geocode exact property locations',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}