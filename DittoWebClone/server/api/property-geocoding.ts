import { Request, Response } from 'express';
import { mongodbStorage } from '../mongodb-storage';
import { googleApiLimiter } from '../utils/google-api-rate-limiter';

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

interface GeocodingResult {
  success: boolean;
  location: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  error?: string;
}

interface PropertyLocationResult {
  projectName: string;
  builderName: string;
  location: string;
  lat: number;
  lng: number;
  formatted_address: string;
  status: 'success' | 'not_found' | 'error';
}

// Search for exact property location using project name and builder
async function getExactPropertyLocation(projectName: string, builderName: string, location: string): Promise<PropertyLocationResult | null> {
  if (!GOOGLE_API_KEY) {
    console.error('Google API key not found');
    return null;
  }

  try {
    // Create precise search query with property details
    const searchQuery = `${projectName} by ${builderName} ${location} Hyderabad Telangana`;
    console.log(`🔍 Searching exact location for: ${searchQuery}`);
    
    const response = await googleApiLimiter.addToQueue(async () => {
      return await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchQuery)}&key=${GOOGLE_API_KEY}`
      );
    });
    
    if (!response.ok) {
      console.error(`Geocoding API error: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    if (data.status === 'OK' && data.results.length > 0) {
      const result = data.results[0];
      
      return {
        projectName,
        builderName,
        location,
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        formatted_address: result.formatted_address,
        status: 'success'
      };
    } else {
      // Try fallback search with just property name and location
      const fallbackQuery = `${projectName} ${location} Hyderabad`;
      console.log(`🔄 Trying fallback search: ${fallbackQuery}`);
      
      const fallbackResponse = await googleApiLimiter.addToQueue(async () => {
        return await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fallbackQuery)}&key=${GOOGLE_API_KEY}`
        );
      });
      
      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        if (fallbackData.status === 'OK' && fallbackData.results.length > 0) {
          const result = fallbackData.results[0];
          
          return {
            projectName,
            builderName,
            location,
            lat: result.geometry.location.lat,
            lng: result.geometry.location.lng,
            formatted_address: result.formatted_address,
            status: 'success'
          };
        }
      }
      
      console.log(`⚠ No location found for ${projectName}`);
      return null;
    }
  } catch (error: any) {
    if (googleApiLimiter.handleRateLimitError(error)) {
      console.warn(`Rate limit hit while geocoding ${projectName}, backing off`);
      return null;
    }
    console.error(`Error geocoding ${projectName}:`, error);
    return null;
  }
}

// Geocode all properties with exact locations
export async function geocodeAllPropertyLocations(req: Request, res: Response) {
  try {
    console.log('🗺️ Starting exact property location geocoding...');
    
    // Get all properties from database
    const properties = await mongodbStorage.getAllProperties();
    console.log(`📍 Found ${properties.length} properties to geocode with exact locations`);
    
    const geocodedLocations: PropertyLocationResult[] = [];
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
        const result = await getExactPropertyLocation(
          property.projectName, 
          property.developerName || 'Unknown Builder', 
          property.location
        );
        
        if (result) {
          geocodedLocations.push(result);
          successCount++;
          console.log(`✓ Located ${property.projectName}: ${result.lat}, ${result.lng}`);
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
    
    console.log(`🎯 Exact location geocoding complete: ${successCount} successful, ${failureCount} failed`);
    
    // Save exact coordinates to cache file
    try {
      const fs = await import('fs/promises');
      const cacheFile = 'exact-property-locations-cache.json';
      await fs.writeFile(cacheFile, JSON.stringify(geocodedLocations, null, 2));
      console.log(`💾 Saved ${geocodedLocations.length} exact property locations to cache`);
    } catch (saveError) {
      console.error('Error saving exact locations cache:', saveError);
    }
    
    res.json({
      success: true,
      message: `Geocoded ${successCount} properties with exact locations`,
      locations: geocodedLocations,
      stats: {
        total: properties.length,
        successful: successCount,
        failed: failureCount,
        batches: batches
      }
    });
    
  } catch (error) {
    console.error('Error in exact property location geocoding:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to geocode exact property locations',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}