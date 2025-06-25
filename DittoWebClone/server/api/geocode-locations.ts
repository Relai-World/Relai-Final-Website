import axios from 'axios';
import { getUniqueLocations } from './property-locations';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface GeocodeResult {
  location: string;
  lat: number;
  lng: number;
}

/**
 * Geocodes a location using Google Maps API
 * @param location The location name to geocode
 * @returns Promise resolving to lat/lng coordinates
 */
async function geocodeLocation(location: string): Promise<{lat: number, lng: number} | null> {
  try {
    // Get API key from environment
    const apiKey = process.env.GOOGLE_API_KEY;
    
    if (!apiKey) {
      console.error('GOOGLE_API_KEY is not defined in environment');
      return null;
    }

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

// Path to store the geocoded locations cache
const cacheFilePath = path.join(__dirname, '../../geocoded-locations-cache.json');

/**
 * Geocodes all unique locations and saves them to a cache file
 */
export async function geocodeAllLocations(): Promise<GeocodeResult[]> {
  // Check if cache exists and is up-to-date
  try {
    if (fs.existsSync(cacheFilePath)) {
      const cacheData = JSON.parse(fs.readFileSync(cacheFilePath, 'utf8'));
      console.log(`Loaded ${cacheData.length} geocoded locations from cache.`);
      return cacheData;
    }
  } catch (error) {
    console.error('Error reading cache file:', error);
  }

  // If no cache, geocode all locations
  const allLocations = await getUniqueLocations();
  console.log(`Geocoding ${allLocations.length} unique locations...`);

  const geocodedLocations: GeocodeResult[] = [];
  
  // Add default geocoded locations for important areas we know
  const defaultLocations = [
    { location: 'Gachibowli', lat: 17.4400, lng: 78.3489 },
    { location: 'Financial District', lat: 17.4144, lng: 78.3487 },
    { location: 'Kokapet', lat: 17.4168, lng: 78.3293 },
    { location: 'Manikonda', lat: 17.4049, lng: 78.3862 },
    { location: 'Kondapur', lat: 17.4607, lng: 78.3426 },
    { location: 'Kukatpally', lat: 17.4849, lng: 78.4108 },
    { location: 'Miyapur', lat: 17.4924, lng: 78.3818 },
    { location: 'Madhapur', lat: 17.4478, lng: 78.3916 },
    { location: 'Hitech City', lat: 17.4456, lng: 78.3772 },
    { location: 'Jubilee Hills', lat: 17.4314, lng: 78.4241 },
    { location: 'Banjara Hills', lat: 17.4139, lng: 78.4477 }
  ];
  
  // Add default locations first
  geocodedLocations.push(...defaultLocations);
  
  // Create a Set to keep track of already processed locations
  const processedLocations = new Set(defaultLocations.map(l => l.location.toLowerCase()));

  // Process all remaining locations
  for (const location of allLocations) {
    // Skip if we already have this location (case insensitive)
    if (processedLocations.has(location.toLowerCase())) {
      continue;
    }
    
    processedLocations.add(location.toLowerCase());
    
    // Geocode the location
    console.log(`Geocoding location: ${location}`);
    const coords = await geocodeLocation(location);
    
    // Add to results if successful
    if (coords) {
      geocodedLocations.push({
        location,
        lat: coords.lat,
        lng: coords.lng
      });
      
      // Save progress after each successful geocoding
      fs.writeFileSync(cacheFilePath, JSON.stringify(geocodedLocations, null, 2));
    }
    
    // Respect Google Maps API rate limits
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  // Save the final results
  fs.writeFileSync(cacheFilePath, JSON.stringify(geocodedLocations, null, 2));
  console.log(`Geocoded ${geocodedLocations.length} locations successfully.`);
  
  return geocodedLocations;
}

/**
 * Gets the geocoded coordinates for a specific location name
 * @param locationName The location to find coordinates for
 * @returns The coordinates or null if not found
 */
export async function getLocationCoordinates(locationName: string): Promise<{lat: number, lng: number} | null> {
  try {
    // First check if we have a cache file
    let geocodedLocations: GeocodeResult[] = [];
    
    if (fs.existsSync(cacheFilePath)) {
      geocodedLocations = JSON.parse(fs.readFileSync(cacheFilePath, 'utf8'));
    } else {
      // Generate the cache if it doesn't exist
      geocodedLocations = await geocodeAllLocations();
    }
    
    // Look for exact match first
    const exactMatch = geocodedLocations.find(loc => 
      loc.location.toLowerCase() === locationName.toLowerCase()
    );
    
    if (exactMatch) {
      return { lat: exactMatch.lat, lng: exactMatch.lng };
    }
    
    // Try partial match
    const partialMatch = geocodedLocations.find(loc => 
      loc.location.toLowerCase().includes(locationName.toLowerCase()) ||
      locationName.toLowerCase().includes(loc.location.toLowerCase())
    );
    
    if (partialMatch) {
      return { lat: partialMatch.lat, lng: partialMatch.lng };
    }
    
    // If no match found, geocode this specific location
    return await geocodeLocation(locationName);
  } catch (error) {
    console.error(`Error getting coordinates for location ${locationName}:`, error);
    return null;
  }
}

/**
 * API endpoint handler to geocode all locations
 */
export async function geocodeLocationsHandler(req: any, res: any) {
  try {
    const geocodedLocations = await geocodeAllLocations();
    res.json({ locations: geocodedLocations });
  } catch (error) {
    console.error('Error geocoding locations:', error);
    res.status(500).json({ error: 'Failed to geocode locations' });
  }
}