import { Request, Response } from 'express';
import { mongodbStorage } from '../mongodb-storage';

// Google Maps Geocoding API
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_API_KEY;

interface GeocodeResult {
  lat: number;
  lng: number;
}

// Cache for geocoded locations to avoid repeated API calls
const geocodeCache = new Map<string, GeocodeResult>();

async function geocodeLocation(location: string): Promise<GeocodeResult | null> {
  // Check cache first
  if (geocodeCache.has(location)) {
    return geocodeCache.get(location)!;
  }

  try {
    // Add "Hyderabad" to the location for better geocoding accuracy
    const searchLocation = `${location}, Hyderabad, Telangana, India`;
    
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchLocation)}&key=${GOOGLE_MAPS_API_KEY}`
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
      
      // Cache the result
      geocodeCache.set(location, result);
      console.log(`Geocoded ${location}: ${result.lat}, ${result.lng}`);
      return result;
    } else {
      console.error(`Geocoding failed for ${location}: ${data.status}`);
      return null;
    }
  } catch (error) {
    console.error(`Error geocoding ${location}:`, error);
    return null;
  }
}

export async function geocodeAllProperties(req: Request, res: Response) {
  try {
    console.log('Starting geocoding process for all properties...');
    
    // Get all properties from database
    const properties = await mongodbStorage.getAllProperties();
    console.log(`Found ${properties.length} properties to geocode`);
    
    // Get unique locations
    const locationSet = new Set(properties.map(p => p.location));
    const uniqueLocations = Array.from(locationSet);
    console.log(`Found ${uniqueLocations.length} unique locations`);
    
    const geocodedLocations: Record<string, GeocodeResult> = {};
    let successCount = 0;
    let failureCount = 0;
    
    // Geocode each unique location
    for (let i = 0; i < uniqueLocations.length; i++) {
      const location = uniqueLocations[i];
      console.log(`Geocoding location ${i + 1}/${uniqueLocations.length}: ${location}`);
      
      const coords = await geocodeLocation(location);
      if (coords) {
        geocodedLocations[location] = coords;
        successCount++;
      } else {
        failureCount++;
      }
      
      // Add a small delay to respect API rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`Geocoding complete: ${successCount} successful, ${failureCount} failed`);
    
    // Return the geocoded locations
    res.json({
      success: true,
      message: `Geocoded ${successCount} locations successfully`,
      locations: geocodedLocations,
      stats: {
        total: uniqueLocations.length,
        successful: successCount,
        failed: failureCount
      }
    });
    
  } catch (error) {
    console.error('Error in geocoding process:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to geocode properties',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}