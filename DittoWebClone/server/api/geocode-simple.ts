import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface GeocodeResult {
  location: string;
  lat: number;
  lng: number;
}

// Path to store the geocoded locations cache
const cacheFilePath = path.join(__dirname, '../../geocoded-locations-cache.json');

// Cache expiration time in milliseconds (90 days)
// Extended significantly to minimize API calls
const CACHE_EXPIRATION = 90 * 24 * 60 * 60 * 1000;

/**
 * Get Google Maps API key from various sources with fallback
 */
function getGoogleMapsApiKey(): string {
  // First try to get GOOGLE_API_KEY from environment variables (new name)
  let apiKey = process.env.GOOGLE_API_KEY;
  
  // If not found, try the old environment variable name
  if (!apiKey) {
    apiKey = process.env.GOOGLE_API_KEY;
  }
  
  // If still not found, try to read from .env file
  if (!apiKey) {
    try {
      const envFile = fs.readFileSync('./.env', 'utf8');
      
      // Try with new variable name first
      let match = envFile.match(/GOOGLE_API_KEY=([^\s]+)/);
      if (match && match[1]) {
        apiKey = match[1];
        console.log('Retrieved Maps API key from .env file for geocoding');
      } else {
        // Try with old variable name
        match = envFile.match(/GOOGLE_API_KEY=([^\s]+)/);
        if (match && match[1]) {
          apiKey = match[1];
          console.log('Retrieved Maps API key from .env file for geocoding (old variable name)');
        }
      }
    } catch (err) {
      console.warn('Could not read .env file for geocoding:', err);
    }
  }
  
  // If still not found, log an error - don't use a hardcoded key
  if (!apiKey) {
    console.error('No Google Maps API key found. Maps functionality will be limited.');
    apiKey = '';
  }
  
  return apiKey;
}

/**
 * Geocodes a location using Google Maps API
 */
export async function geocodeLocation(location: string): Promise<{lat: number, lng: number} | null> {
  try {
    // Get API key with fallback mechanism
    const apiKey = getGoogleMapsApiKey();

    // Add "Hyderabad" to the search to improve results precision
    const searchTerm = location.toLowerCase().includes('hyderabad') ? location : `${location}, Hyderabad`;

    // Geocode the location
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json`,
      {
        params: {
          address: searchTerm,
          key: apiKey
        }
      }
    );

    // Check if we got a valid response
    if (response.data.status === 'OK' && response.data.results.length > 0) {
      const { lat, lng } = response.data.results[0].geometry.location;
      return { lat, lng };
    } else {
      console.error(`Failed to geocode location: ${location}`, response.data.status);
      return null;
    }
  } catch (error) {
    console.error(`Error geocoding location ${location}:`, error);
    return null;
  }
}

// Default geocoded locations for important areas we know
const defaultLocations: GeocodeResult[] = [
  // West Hyderabad
  { location: 'Gachibowli', lat: 17.4400, lng: 78.3489 },
  { location: 'Financial District', lat: 17.4144, lng: 78.3487 },
  { location: 'Kokapet', lat: 17.4168, lng: 78.3293 },
  { location: 'Manikonda', lat: 17.4049, lng: 78.3862 },
  { location: 'Kondapur', lat: 17.4607, lng: 78.3426 },
  { location: 'Madhapur', lat: 17.4478, lng: 78.3916 },
  { location: 'Hitech City', lat: 17.4456, lng: 78.3772 },
  { location: 'Jubilee Hills', lat: 17.4314, lng: 78.4241 },
  { location: 'Banjara Hills', lat: 17.4139, lng: 78.4477 },
  { location: 'Nanakramguda', lat: 17.4166, lng: 78.3762 },
  { location: 'Tellapur', lat: 17.4786, lng: 78.2929 },
  { location: 'Nallagandla', lat: 17.4656, lng: 78.3312 },
  
  // North Hyderabad
  { location: 'Kukatpally', lat: 17.4849, lng: 78.4108 },
  { location: 'Miyapur', lat: 17.4924, lng: 78.3818 },
  { location: 'Bachupally', lat: 17.5319, lng: 78.3841 },
  { location: 'Kompally', lat: 17.5360, lng: 78.4863 },
  { location: 'Medchal', lat: 17.6269, lng: 78.4808 },
  { location: 'Alwal', lat: 17.5003, lng: 78.5129 },
  
  // East Hyderabad
  { location: 'Uppal', lat: 17.3980, lng: 78.5588 },
  { location: 'Nagole', lat: 17.3725, lng: 78.5581 },
  { location: 'LB Nagar', lat: 17.3465, lng: 78.5490 },
  { location: 'Kothapet', lat: 17.3716, lng: 78.5400 },
  { location: 'Dilsukhnagar', lat: 17.3685, lng: 78.5273 },
  
  // South Hyderabad
  { location: 'Shamshabad', lat: 17.2329, lng: 78.4074 },
  { location: 'Adibatla', lat: 17.2022, lng: 78.5535 },
  { location: 'Maheshwaram', lat: 17.1979, lng: 78.4341 },
  { location: 'Tukkuguda', lat: 17.2486, lng: 78.4956 },
  { location: 'Shadnagar', lat: 17.0880, lng: 78.2194 },
  { location: 'Rajendranagar', lat: 17.3156, lng: 78.4026 },
  { location: 'Gandipet', lat: 17.3895, lng: 78.3203 },
  { location: 'Kollur', lat: 17.4774, lng: 78.2724 },
  { location: 'Patancheru', lat: 17.5304, lng: 78.2644 }
];

/**
 * Gets the geocoded coordinates for a location name
 */
export async function getCoordinatesForLocation(locationName: string): Promise<GeocodeResult | null> {
  try {
    // First check if location exists in default locations
    const defaultLocation = defaultLocations.find(
      loc => loc.location.toLowerCase() === locationName.toLowerCase()
    );
    
    if (defaultLocation) {
      return defaultLocation;
    }
    
    // Then check if we have a cache file
    let geocodedLocations: GeocodeResult[] = [];
    
    if (fs.existsSync(cacheFilePath)) {
      geocodedLocations = JSON.parse(fs.readFileSync(cacheFilePath, 'utf8'));
      
      // Look for exact match first
      const exactMatch = geocodedLocations.find(
        loc => loc.location.toLowerCase() === locationName.toLowerCase()
      );
      
      if (exactMatch) {
        return exactMatch;
      }
      
      // Try partial match
      const partialMatch = geocodedLocations.find(
        loc => loc.location.toLowerCase().includes(locationName.toLowerCase()) ||
               locationName.toLowerCase().includes(loc.location.toLowerCase())
      );
      
      if (partialMatch) {
        return partialMatch;
      }
    }
    
    // If no match found, geocode this specific location
    const coordinates = await geocodeLocation(locationName);
    
    if (coordinates) {
      const result = {
        location: locationName,
        lat: coordinates.lat,
        lng: coordinates.lng
      };
      
      // Save to cache
      geocodedLocations.push(result);
      fs.writeFileSync(cacheFilePath, JSON.stringify(geocodedLocations, null, 2));
      
      return result;
    }
    
    return null;
  } catch (error) {
    console.error(`Error getting coordinates for ${locationName}:`, error);
    return null;
  }
}

/**
 * Preload a batch of locations to minimize API calls later
 * This function will geocode multiple locations at once and save them to cache
 */
export async function preloadLocations(locations: string[]): Promise<number> {
  console.log(`Preloading ${locations.length} locations for geocoding cache`);
  let geocodedCount = 0;
  let geocodedLocations: GeocodeResult[] = [];
  
  // First load existing cache to avoid duplicates
  if (fs.existsSync(cacheFilePath)) {
    geocodedLocations = JSON.parse(fs.readFileSync(cacheFilePath, 'utf8'));
  }
  
  // Keep track of existing locations to avoid redundant API calls
  const existingLocationNames = new Set(
    [...defaultLocations, ...geocodedLocations].map(loc => 
      loc.location.toLowerCase()
    )
  );
  
  // Filter out locations that are already in default list or cache
  const locationsToGeocode = locations.filter(
    loc => !existingLocationNames.has(loc.toLowerCase())
  );
  
  console.log(`After filtering, ${locationsToGeocode.length} locations need geocoding`);
  
  // Process each location with a delay to respect API rate limits
  for (const location of locationsToGeocode) {
    try {
      // Skip empty locations
      if (!location.trim()) continue;
      
      // Use the geocoding function with a slight delay to avoid rate limits
      const coordinates = await geocodeLocation(location);
      
      if (coordinates) {
        const result = {
          location: location,
          lat: coordinates.lat,
          lng: coordinates.lng
        };
        
        // Add to our collection
        geocodedLocations.push(result);
        geocodedCount++;
        
        // Save after each successful geocoding to avoid data loss
        fs.writeFileSync(cacheFilePath, JSON.stringify(geocodedLocations, null, 2));
        
        console.log(`Successfully geocoded and cached: ${location}`);
        
        // Add a small delay to avoid hitting API rate limits
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    } catch (error) {
      console.error(`Error preloading location ${location}:`, error);
      // Continue with next location even if one fails
    }
  }
  
  return geocodedCount;
}

/**
 * API endpoint to get cache statistics about geocoded locations
 */
export async function getGeocodeCacheStats(req: any, res: any) {
  try {
    // Default locations (hardcoded)
    const defaultCount = defaultLocations.length;
    
    // Cached locations from file
    let cachedLocations: GeocodeResult[] = [];
    if (fs.existsSync(cacheFilePath)) {
      cachedLocations = JSON.parse(fs.readFileSync(cacheFilePath, 'utf8'));
    }
    
    // Count how many of Hyderabad's main areas are covered
    const hyderabadMainAreas = [
      'gachibowli', 'madhapur', 'kondapur', 'kukatpally', 'hitech city', 
      'financial district', 'banjara hills', 'jubilee hills', 'miyapur', 
      'ameerpet', 'kphb', 'manikonda', 'kokapet', 'narsingi', 'tellapur',
      'uppal', 'lb nagar', 'secunderabad', 'begumpet', 'bachupally'
    ];
    
    const coveredMainAreas = hyderabadMainAreas.filter(area => {
      return cachedLocations.some(loc => 
        loc.location.toLowerCase().includes(area.toLowerCase())
      );
    });
    
    // Calculate API cost savings based on geocoding API pricing ($5 per 1000 requests)
    const geocodingCostPer1000 = 5.0;
    const costSavings = (cachedLocations.length / 1000) * geocodingCostPer1000;
    
    // Simple response with just the counts
    const stats = {
      totalLocations: defaultCount + cachedLocations.length,
      defaultLocations: defaultCount,
      cachedLocations: cachedLocations.length,
      cacheExpiration: `${CACHE_EXPIRATION / (24 * 60 * 60 * 1000)} days`,
      mainAreasCoverage: {
        covered: coveredMainAreas.length,
        total: hyderabadMainAreas.length,
        coveragePercent: Math.round((coveredMainAreas.length / hyderabadMainAreas.length) * 100)
      },
      costEfficiency: {
        estimatedSavings: `$${costSavings.toFixed(2)}`,
        requestsCached: cachedLocations.length
      }
    };
    
    console.log("Geocode cache stats:", stats);
    
    // Set explicit headers to ensure it's treated as JSON
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(stats));
  } catch (error) {
    console.error('Error getting geocode cache stats:', error);
    res.status(500).json({ error: 'Failed to get geocode cache statistics' });
  }
}

export async function geocodeHandler(req: any, res: any) {
  try {
    const { location, batch } = req.query;
    
    // Handle batch geocoding request
    if (batch && Array.isArray(batch) && batch.length > 0) {
      const geocodedCount = await preloadLocations(batch);
      return res.json({ 
        success: true, 
        message: `Preloaded ${geocodedCount} locations to geocoding cache`,
        totalProcessed: batch.length
      });
    }
    
    // Handle single location geocoding 
    if (!location) {
      return res.status(400).json({ error: 'Location parameter is required' });
    }
    
    const result = await getCoordinatesForLocation(String(location));
    
    if (result) {
      res.json(result);
    } else {
      res.status(404).json({ error: 'Could not geocode the location' });
    }
  } catch (error) {
    console.error('Error geocoding location:', error);
    res.status(500).json({ error: 'Failed to geocode location' });
  }
}