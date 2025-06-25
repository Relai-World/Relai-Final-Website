import { Request, Response } from 'express';
import { fetchAllProperties, SheetProperty } from './google-sheets';
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

/**
 * Helper function to check if property has valid coordinates
 */
function hasValidCoordinates(property: any): boolean {
  if (!property) return false;
  
  const lat = typeof property.latitude === 'string' ? parseFloat(property.latitude) : property.latitude;
  const lng = typeof property.longitude === 'string' ? parseFloat(property.longitude) : property.longitude;
  
  // Debug coordinate issues for the first few properties
  if (lng === 0 && lat === 0) {
    console.log(`Invalid coordinates for property: ${property.projectName || property.name}, location: ${property.location}, coords: [${lat}, ${lng}]`);
  }
  
  // Special case handling for any property with a location
  // If property has a location, we'll attempt to use default coordinates from our lookup table
  if (property.location) {
    const locationLower = property.location.toLowerCase();
    
    // Check for location matches with areas in our default locations list
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
    
    // Check if the location contains any of our default areas
    for (const [areaName, _] of Object.entries(defaultCoordinates)) {
      if (locationLower.includes(areaName)) {
        // If we found a match, this property should be included
        // We'll use the default coordinates in the getCoordinates function
        console.log(`Using special handling for ${areaName} area property: ${property.projectName || property.name}`);
        return true;
      }
    }
    
    // Even if no specific area match is found, if we have a location
    // and invalid coordinates, we'll still include it and try to geocode it
    if (lat === 0 || lng === 0 || !lat || !lng || isNaN(lat) || isNaN(lng)) {
      console.log(`Using location-based handling for property: ${property.projectName || property.name} in ${property.location}`);
      return true;
    }
  }
  
  // Standard validation for properties with valid coordinates
  return (
    lat !== undefined && 
    lng !== undefined && 
    lat !== null && 
    lng !== null &&
    !isNaN(lat) && 
    !isNaN(lng) &&
    (lat !== 0 || lng !== 0) // At least one coordinate should be non-zero
  );
}

/**
 * Helper function to get parsed coordinates from property
 */
function getCoordinates(property: any): { lat: number, lng: number } {
  let lat = typeof property.latitude === 'string' ? parseFloat(property.latitude) : property.latitude;
  let lng = typeof property.longitude === 'string' ? parseFloat(property.longitude) : property.longitude;
  
  // Default coordinates for key areas
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
  
  // If coordinates are invalid, try to use defaults based on location
  if (!lat || !lng || lat === 0 || lng === 0 || isNaN(lat) || isNaN(lng)) {
    if (property.location) {
      const locationLower = property.location.toLowerCase();
      
      // Check if the location contains any of our default areas
      for (const [areaName, coordinates] of Object.entries(defaultCoordinates)) {
        if (locationLower.includes(areaName)) {
          console.log(`Using default coordinates for ${areaName} for property: ${property.projectName || property.name}`);
          lat = coordinates.lat;
          lng = coordinates.lng;
          break;
        }
      }
    }
  }
  
  return { lat, lng };
}

/**
 * Handler for searching properties within a radius
 */
export async function radiusSearchHandler(req: Request, res: Response) {
  try {
    // Get parameters
    const { locations, radius } = req.query;
    
    if (!locations) {
      return res.status(400).json({ 
        error: 'Missing locations parameter. Please provide comma-separated list of locations.'
      });
    }
    
    // Parse locations
    const locationList = String(locations).split(',').map(loc => loc.trim());
    console.log(`Searching for properties near: ${locationList.join(', ')}`);
    
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
      const geoResult = await getCoordinatesForLocation(locationName);
      
      if (geoResult) {
        console.log(`Found coordinates for ${locationName}: [${geoResult.lat}, ${geoResult.lng}]`);
        referencePoints.push({
          lat: geoResult.lat,
          lng: geoResult.lng,
          source: `Geocoded location: ${geoResult.location}`
        });
      } else {
        console.log(`Could not geocode location: ${locationName}`);
      }
    }
    
    // If we couldn't find coordinates for any location, return empty result
    if (referencePoints.length === 0) {
      return res.json({ 
        properties: [],
        error: 'Could not geocode any of the provided locations.'
      });
    }
    
    // Get all properties
    const allProperties = await fetchAllProperties();
    
    // Filter to those with valid coordinates
    const propertiesWithCoordinates = allProperties.filter((p): p is SheetProperty => {
      return p !== null && hasValidCoordinates(p);
    });
    
    console.log(`Found ${propertiesWithCoordinates.length} properties with valid coordinates out of ${allProperties.length} total`);
    
    // Get all properties within the radius of any reference point
    const propertiesInRadius = propertiesWithCoordinates.filter(property => {
      // Check if this property is within the radius of any reference point
      for (const refPoint of referencePoints) {
        const coords = getCoordinates(property);
        const distance = calculateDistance(
          refPoint.lat, 
          refPoint.lng, 
          coords.lat, 
          coords.lng
        );
        
        if (distance <= radiusInKm) {
          return true;
        }
      }
      
      return false;
    });
    
    console.log(`Found ${propertiesInRadius.length} properties within ${radiusInKm}km radius`);
    
    // Calculate distance information for each property
    const propertiesWithDistance = propertiesInRadius.map(property => {
      // Find the closest reference point
      let minDistance = Infinity;
      let closestRef = referencePoints[0];
      
      for (const refPoint of referencePoints) {
        const coords = getCoordinates(property);
        const distance = calculateDistance(
          refPoint.lat, 
          refPoint.lng, 
          coords.lat, 
          coords.lng
        );
        
        if (distance < minDistance) {
          minDistance = distance;
          closestRef = refPoint;
        }
      }
      
      return {
        ...property,
        distance: minDistance,
        referencePoint: closestRef.source
      };
    });
    
    // Sort by distance
    const sortedProperties = propertiesWithDistance.sort((a, b) => a.distance - b.distance);
    
    // Return the result with appropriate radius value for display
    const displayRadius = radius === 'exact' ? 'exact' : radiusInKm;
    
    res.json({ 
      properties: sortedProperties,
      referencePoints: referencePoints,
      totalPropertiesInRadius: propertiesInRadius.length,
      radiusKm: displayRadius
    });
  } catch (error) {
    console.error('Error searching properties by radius:', error);
    res.status(500).json({ 
      error: 'Failed to search properties by radius', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}