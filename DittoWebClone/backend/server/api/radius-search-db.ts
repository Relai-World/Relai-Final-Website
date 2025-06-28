import { Request, Response } from 'express';
import { mongodbStorage } from '../mongodb-storage';
import { getCoordinatesForLocation, GeocodeResult } from './geocode-simple';

interface ReferenceCoordinate {
  lat: number;
  lng: number;
  source: string;
}

/**
 * Calculate distance between two coordinates in kilometers using Haversine formula
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  try {
    // Check for invalid coordinates
    if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) {
      return Infinity;
    }
    
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371; // Earth's radius in km
    
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    if (isNaN(distance) || !isFinite(distance) || distance < 0) {
      return Infinity;
    }
    
    return distance;
  } catch (error) {
    console.error(`Error calculating distance: ${error}`);
    return Infinity;
  }
}

// Default coordinates for key areas in Hyderabad
const defaultCoordinates: {[key: string]: {lat: number, lng: number}} = {
  // West Hyderabad
  'gachibowli': { lat: 17.4400, lng: 78.3489 },
  'financial district': { lat: 17.4144, lng: 78.3487 },
  'nanakramguda': { lat: 17.4166, lng: 78.3762 },
  'kokapet': { lat: 17.4168, lng: 78.3293 },
  'kondapur': { lat: 17.4607, lng: 78.3426 },
  'madhapur': { lat: 17.4478, lng: 78.3916 },
  'hitech city': { lat: 17.4456, lng: 78.3772 },
  'jubilee hills': { lat: 17.4314, lng: 78.4241 },
  'banjara hills': { lat: 17.4139, lng: 78.4477 },
  'manikonda': { lat: 17.4049, lng: 78.3862 },
  'tellapur': { lat: 17.4786, lng: 78.2929 },
  'nallagandla': { lat: 17.4656, lng: 78.3312 },
  
  // North Hyderabad
  'kukatpally': { lat: 17.4849, lng: 78.4108 },
  'miyapur': { lat: 17.4924, lng: 78.3818 },
  'bachupally': { lat: 17.5319, lng: 78.3841 },
  'kompally': { lat: 17.5360, lng: 78.4863 },
  'medchal': { lat: 17.6269, lng: 78.4808 },
  'alwal': { lat: 17.5003, lng: 78.5129 },
  
  // East Hyderabad
  'uppal': { lat: 17.3980, lng: 78.5588 },
  'nagole': { lat: 17.3725, lng: 78.5581 },
  'lb nagar': { lat: 17.3465, lng: 78.5490 },
  'kothapet': { lat: 17.3716, lng: 78.5400 },
  'dilsukhnagar': { lat: 17.3685, lng: 78.5273 },
  
  // South Hyderabad
  'shamshabad': { lat: 17.2329, lng: 78.4074 },
  'adibatla': { lat: 17.2022, lng: 78.5535 },
  'maheshwaram': { lat: 17.1979, lng: 78.4341 },
  'tukkuguda': { lat: 17.2486, lng: 78.4956 },
  'shadnagar': { lat: 17.0880, lng: 78.2194 },
  'rajendranagar': { lat: 17.3156, lng: 78.4026 },
  'gandipet': { lat: 17.3895, lng: 78.3203 },
  'kollur': { lat: 17.4774, lng: 78.2724 },
  'patancheru': { lat: 17.5304, lng: 78.2644 }
};

interface ExtendedProperty {
  latitude?: number;
  longitude?: number;
  distance?: number;
  referencePoint?: string;
}

/**
 * Helper function to get coordinates for a property location
 */
function getApproximateCoordinates(location: string): { lat: number, lng: number } | null {
  if (!location) return null;
  
  const locationLower = location.toLowerCase();
  
  // Check if the location contains any of our default areas
  for (const [areaName, coordinates] of Object.entries(defaultCoordinates)) {
    if (locationLower.includes(areaName)) {
      console.log(`Using default coordinates for ${areaName} in location: ${location}`);
      return coordinates;
    }
  }
  
  return null;
}

/**
 * Database version of radius search handler
 */
export async function radiusSearchDbHandler(req: Request, res: Response) {
  try {
    // Get parameters
    const { locations, radius, filters } = req.query;
    
    if (!locations) {
      return res.status(400).json({ 
        error: 'Missing locations parameter. Please provide comma-separated list of locations.'
      });
    }
    
    // Parse locations
    const locationList = String(locations).split(',').map(loc => loc.trim());
    console.log(`Searching for properties near: ${locationList.join(', ')}`);
    
    // Handle 'any' location specially
    if (locationList.includes('any') || locationList.includes('Any Location')) {
      console.log('Location is "any", using basic property search');
      
      // Parse filters
      let parsedFilters = {};
      if (filters) {
        try {
          parsedFilters = JSON.parse(String(filters));
          console.log('Parsed filters for "any" location:', parsedFilters);
          
          // Make sure minPricePerSqft and maxPricePerSqft are numbers
          if ('minPricePerSqft' in parsedFilters) {
            (parsedFilters as any).minPricePerSqft = Number((parsedFilters as any).minPricePerSqft);
          }
          if ('maxPricePerSqft' in parsedFilters) {
            (parsedFilters as any).maxPricePerSqft = Number((parsedFilters as any).maxPricePerSqft);
          }
        } catch (error) {
          console.error('Error parsing filters JSON:', error);
        }
      }
      
      // Use the regular all properties endpoint with filters
      const properties = await mongodbStorage.getAllProperties(parsedFilters as any);
      
      console.log(`Found ${properties.length} properties for "any" location search`);
      
      // Return the result
      return res.json({ 
        properties: properties,
        referencePoints: [],
        totalPropertiesInRadius: properties.length,
        radiusKm: 'any'
      });
    }
    
    // Parse radius - handle "exact" as a special case
    let radiusInKm = 5; // Default radius
    
    if (radius === 'exact') {
      // For exact location searches, use a very small radius (effectively 0)
      radiusInKm = 0.1; // 100 meters
      console.log('Using exact location search (100m radius)');
    } else {
      radiusInKm = parseInt(String(radius || '5'), 10);
      console.log(`Using radius search with ${radiusInKm}km radius`);
    }
    
    if (radiusInKm <= 0) {
      console.log('Invalid radius, defaulting to exact location search');
      radiusInKm = 0.1; // Fallback to exact location (100m) for invalid radius values
    }
    
    // Geocode each location
    const referencePoints: ReferenceCoordinate[] = [];
    
    for (const locationName of locationList) {
      // Skip "Any Location" values
      if (locationName.toLowerCase() === 'any' || locationName === 'Any Location') {
        continue;
      }
      
      // Try Google Maps geocoding first
      const geoResult = await getCoordinatesForLocation(locationName);
      
      if (geoResult) {
        console.log(`Found coordinates for ${locationName} via Google: [${geoResult.lat}, ${geoResult.lng}]`);
        referencePoints.push({
          lat: geoResult.lat,
          lng: geoResult.lng,
          source: `Geocoded location: ${geoResult.location}`
        });
      } else {
        // Fall back to our default coordinates
        const defaultCoords = getApproximateCoordinates(locationName);
        if (defaultCoords) {
          console.log(`Using default coordinates for ${locationName}: [${defaultCoords.lat}, ${defaultCoords.lng}]`);
          referencePoints.push({
            lat: defaultCoords.lat,
            lng: defaultCoords.lng,
            source: `Default coordinates: ${locationName}`
          });
        } else {
          console.log(`Could not geocode location: ${locationName}`);
        }
      }
    }
    
    // If we couldn't find coordinates for any location, use basic search with location filter
    if (referencePoints.length === 0) {
      console.log('No reference coordinates found, falling back to text search');
      
      // Parse filters
      let parsedFilters: any = {};
      if (filters) {
        try {
          parsedFilters = JSON.parse(String(filters));
        } catch (error) {
          console.error('Error parsing filters JSON:', error);
        }
      }
      
      // Add location to filters
      if (locationList.length > 0 && !locationList.includes('any')) {
        parsedFilters.location = locationList[0]; // Use the first location
      }
      
      // Use the regular all properties endpoint with filters
      const properties = await mongodbStorage.getAllProperties(parsedFilters);
      
      console.log(`Found ${properties.length} properties using location text search`);
      
      // Return the result
      return res.json({ 
        properties: properties,
        referencePoints: [],
        totalPropertiesInRadius: properties.length,
        radiusKm: 'text'
      });
    }
    
    // Get all properties
    let parsedFilters = {};
    if (filters) {
      try {
        parsedFilters = JSON.parse(String(filters));
        
        // Log parsed filters for debugging
        console.log('Radius search parsed filters:', parsedFilters);
        
        // Make sure minPricePerSqft and maxPricePerSqft are numbers
        if ('minPricePerSqft' in parsedFilters) {
          (parsedFilters as any).minPricePerSqft = Number((parsedFilters as any).minPricePerSqft);
        }
        if ('maxPricePerSqft' in parsedFilters) {
          (parsedFilters as any).maxPricePerSqft = Number((parsedFilters as any).maxPricePerSqft);
        }
      } catch (error) {
        console.error('Error parsing filters JSON:', error);
      }
    }
    
    const allProperties = await mongodbStorage.getAllProperties(parsedFilters as any);
    
    // Return the result
    return res.json({ 
      properties: allProperties,
      referencePoints: referencePoints,
      totalPropertiesInRadius: allProperties.length,
      radiusKm: radiusInKm
    });
  } catch (error) {
    console.error(`Error in radiusSearchDbHandler: ${error}`);
    return res.status(500).json({ error: 'An error occurred while processing the request' });
  }
}