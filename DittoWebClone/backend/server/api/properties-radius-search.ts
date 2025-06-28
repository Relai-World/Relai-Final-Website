import { Request, Response } from 'express';
import { fetchAllProperties, SheetProperty } from './google-sheets';
import { getLocationCoordinates } from './geocode-locations';

interface ReferenceCoordinate {
  lat: number;
  lng: number;
  source: string;
}

// Helper function to check if coordinates are valid
function hasValidCoordinates(property: any): boolean {
  if (!property) return false;
  
  // Try to ensure we have valid coordinates
  const lat = typeof property.latitude === 'string' ? parseFloat(property.latitude) : property.latitude;
  const lng = typeof property.longitude === 'string' ? parseFloat(property.longitude) : property.longitude;
  
  // Special case for Gachibowli default coordinates
  const isGachibowliDefaultLat = Math.abs(lat - 17.4400) < 0.0001;
  const isGachibowliDefaultLng = Math.abs(lng - 78.3489) < 0.0001;
  
  // Accept both normal valid coordinates and our Gachibowli default coordinates
  return (lat !== undefined && lng !== undefined && 
         lat !== null && lng !== null &&
         !isNaN(lat) && !isNaN(lng) &&
         ((lat !== 0 && lng !== 0) || (isGachibowliDefaultLat && isGachibowliDefaultLng)));
}

// Helper function to get parsed coordinates
function getCoordinates(property: any): { lat: number, lng: number } {
  const lat = typeof property.latitude === 'string' ? parseFloat(property.latitude) : property.latitude;
  const lng = typeof property.longitude === 'string' ? parseFloat(property.longitude) : property.longitude;
  return { lat, lng };
}

/**
 * Calculate distance between two coordinates in kilometers using Haversine formula
 * Returns Infinity if any coordinates are invalid to avoid false matches
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  // Special case for Gachibowli default coordinates
  const isGachibowliDefaultLat1 = Math.abs(lat1 - 17.4400) < 0.0001;
  const isGachibowliDefaultLng1 = Math.abs(lon1 - 78.3489) < 0.0001;
  const isGachibowliDefaultLat2 = Math.abs(lat2 - 17.4400) < 0.0001;
  const isGachibowliDefaultLng2 = Math.abs(lon2 - 78.3489) < 0.0001;

  // Check for invalid coordinates but allow Gachibowli default coordinates
  if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2) ||
      ((lat1 === 0 || lon1 === 0) && !(isGachibowliDefaultLat1 && isGachibowliDefaultLng1)) ||
      ((lat2 === 0 || lon2 === 0) && !(isGachibowliDefaultLat2 && isGachibowliDefaultLng2))) {
    return Infinity;
  }
  
  // Calculate using Haversine formula
  try {
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
 * Handler for searching properties within a radius of specified coordinates
 */
export async function propertiesRadiusSearchHandler(req: Request, res: Response) {
  try {
    // Get parameters
    const { locations, radius, filters } = req.query;
    
    if (!locations) {
      return res.status(400).json({ 
        error: 'Missing locations parameter. Please provide comma-separated list of locations.'
      });
    }
    
    // Extract locations and try different case formats to maximize chance of matching
    let rawLocationList = String(locations).split(',').map(loc => loc.trim());
    console.log(`Raw location list: ${rawLocationList.join(', ')}`);
    
    // Create multiple formats for each location to increase match chances
    const locationVariants: { [key: string]: string[] } = {};
    
    for (const loc of rawLocationList) {
      // Original as provided
      const original = loc;
      
      // Lowercase version
      const lowercase = loc.toLowerCase();
      
      // Uppercase version
      const uppercase = loc.toUpperCase();
      
      // Proper case (first letter uppercase, rest lowercase)
      const propercase = loc.charAt(0).toUpperCase() + loc.slice(1).toLowerCase();
      
      // Store all variants
      locationVariants[original] = [original, lowercase, uppercase, propercase];
    }
    
    console.log('Location variants created for matching:', locationVariants);
    
    // Fetch all available geocoded locations to check against
    const { getUniqueLocations } = await import('./property-locations');
    const availableLocations = await getUniqueLocations();
    console.log(`Available geocoded locations: ${availableLocations.join(', ')}`);
    
    // Check if any of our variants match the available locations
    const matchedLocations: string[] = [];
    
    for (const [original, variants] of Object.entries(locationVariants)) {
      // First check for exact matches with available locations
      const exactMatch = availableLocations.find(available => 
        variants.some(variant => variant === available)
      );
      
      if (exactMatch) {
        console.log(`Found exact match for "${original}": "${exactMatch}"`);
        matchedLocations.push(exactMatch);
        continue;
      }
      
      // Then check for partial/contained matches
      const partialMatches = availableLocations.filter(available => 
        variants.some(variant => 
          available.includes(variant) || variant.includes(available)
        )
      );
      
      if (partialMatches.length > 0) {
        console.log(`Found partial matches for "${original}": ${partialMatches.join(', ')}`);
        matchedLocations.push(...partialMatches);
      } else {
        // If no matches at all, keep the original
        console.log(`No match found for "${original}", keeping as-is`);
        matchedLocations.push(original);
      }
    }
    
    const locationList = Array.from(new Set(matchedLocations)); // Remove duplicates
    console.log(`Final location list for searching: ${locationList.join(', ')}`);
    const radiusInKm = parseInt(String(radius || '0'), 10);
    
    // If no radius specified, return empty array
    if (radiusInKm <= 0) {
      return res.json({ properties: [] });
    }
    
    console.log(`Searching for properties within ${radiusInKm}km of ${locationList.join(', ')}`);
    
    // Get coordinates for each location in the list using the geocoding service
    const locationCoordinates = [];
    for (const locationName of locationList) {
      console.log(`Geocoding location: ${locationName}`);
      const coordinates = await getLocationCoordinates(locationName);
      
      if (coordinates) {
        console.log(`Found coordinates for ${locationName}: [${coordinates.lat}, ${coordinates.lng}]`);
        locationCoordinates.push({
          location: locationName,
          coordinates
        });
      } else {
        console.log(`Could not geocode location: ${locationName}`);
      }
    }
    
    // If we found coordinates for any locations, use them as reference points
    if (locationCoordinates.length > 0) {
      console.log(`Found coordinates for ${locationCoordinates.length} locations`);
    } else {
      console.log(`Could not find coordinates for any locations, falling back to property matching`);
    }
    
    // Use geocoded locations as reference points if available
    const geocodedReferenceCoordinates = [];
    
    // If we have geocoded coordinates, use them as our reference points
    if (locationCoordinates.length > 0) {
      console.log(`Using ${locationCoordinates.length} geocoded locations as reference points`);
      
      // Convert to our reference coordinate format
      const referenceCoordinates = locationCoordinates.map(loc => ({
        lat: loc.coordinates.lat,
        lng: loc.coordinates.lng,
        source: `Geocoded location: ${loc.location}`
      }));
      
      // Get all properties
      const allProperties = await fetchAllProperties();
      
      // Get all properties with valid coordinates
      const propertiesWithCoordinates = allProperties.filter((p): p is SheetProperty => {
        return p !== null && hasValidCoordinates(p);
      });
      
      console.log(`Found ${propertiesWithCoordinates.length} properties with valid coordinates out of ${allProperties.length} total`);
      
      // Get all properties within the radius of any geocoded reference point
      const propertiesInRadius = propertiesWithCoordinates.filter(property => {
        // Check if this property is within the radius of any reference point
        for (const refCoord of referenceCoordinates) {
          const coords = getCoordinates(property);
          const distance = calculateDistance(
            refCoord.lat, 
            refCoord.lng, 
            coords.lat, 
            coords.lng
          );
          
          if (distance <= radiusInKm) {
            return true;
          }
        }
        
        return false;
      });
      
      console.log(`Found ${propertiesInRadius.length} properties within ${radiusInKm}km radius of geocoded locations`);
      
      // Calculate distance information for each property
      const propertiesWithDistance = propertiesInRadius.map(property => {
        // Find the closest reference point
        let minDistance = Infinity;
        let closestRef = referenceCoordinates[0];
        
        for (const refCoord of referenceCoordinates) {
          const coords = getCoordinates(property);
          const distance = calculateDistance(
            refCoord.lat, 
            refCoord.lng, 
            coords.lat, 
            coords.lng
          );
          
          if (distance < minDistance) {
            minDistance = distance;
            closestRef = refCoord;
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
      
      // Return the result
      res.json({ 
        properties: sortedProperties,
        referenceCoordinates: referenceCoordinates,
        totalPropertiesInRadius: propertiesInRadius.length,
        radiusKm: radiusInKm,
        method: 'geocoded'
      });
      
      return; // Exit here if we successfully used geocoded coordinates
    }
    
    // Fallback to traditional property-based approach
    console.log('No geocoded coordinates found, falling back to property-based reference points');
    
    // Get all properties
    const allProperties = await fetchAllProperties();
    
    // First, find properties that match the location names exactly
    // Add debug output to help identify the issue
    console.log(`Searching for locations: ${locationList.join(', ')}`);
    
    // Find all properties with coordinates first
    const propertiesWithCoordinates = allProperties.filter((p): p is SheetProperty => {
      if (p === null) return false;
      
      const isValid = hasValidCoordinates(p);
      
      // Log the first 10 properties for debugging
      if (allProperties.indexOf(p) < 10) {
        const coords = getCoordinates(p);
        console.log(`Property: ${p.projectName}, Location: ${p.location}, Coordinates: [${coords.lat}, ${coords.lng}], Valid: ${isValid}`);
      }
      
      // Log any Gachibowli properties specifically
      if (p.location && p.location.toLowerCase().includes('gachibowli')) {
        const coords = getCoordinates(p);
        console.log(`Gachibowli property found: ${p.projectName}, Location: ${p.location}, Coordinates: [${coords.lat}, ${coords.lng}], Valid: ${isValid}`);
      }
      
      return isValid;
    });
    
    console.log(`Found ${propertiesWithCoordinates.length} properties with valid coordinates`);
    
    // Now filter for location match
    const referenceProperties = propertiesWithCoordinates.filter(p => {
      // Log the first 10 properties we're checking to see location formats
      if (propertiesWithCoordinates.indexOf(p) < 10) {
        console.log(`Checking property: "${p.projectName}" with location "${p.location}" and coordinates [${p.latitude}, ${p.longitude}]`);
      }
      
      return locationList.some(loc => {
        // We'll try both normal contains and word matching
        const locationLower = loc.toLowerCase();
        const propertyLocationLower = p.location.toLowerCase();
        
        // Check if property location contains the search location
        const fullMatch = propertyLocationLower.includes(locationLower);
        
        // Check if any word in the property location matches any word in the search location
        const locationWords = locationLower.split(/\s+/);
        const propertyWords = propertyLocationLower.split(/\s+/);
        
        const wordMatch = locationWords.some((locWord: string) => 
          locWord.length > 3 && propertyWords.some((propWord: string) => 
            propWord.includes(locWord) || locWord.includes(propWord)
          )
        );
        
        const match = fullMatch || wordMatch;
        
        // If we found a match, log it for debugging
        if (match) {
          console.log(`Found match for location "${loc}" in property "${p.projectName}" with location "${p.location}"`);
          if (fullMatch) console.log(`  - Full match: "${propertyLocationLower}" contains "${locationLower}"`);
          if (wordMatch) console.log(`  - Word match: Words in "${propertyLocationLower}" match words in "${locationLower}"`);
        }
        
        return match;
      });
    });
    
    // Special case for Gachibowli since we know this location is important
    if (locationList.some(loc => loc.toLowerCase().includes('gachibowli'))) {
      console.log("Searching specifically for Gachibowli properties...");
      console.log("Current referenceProperties length:", referenceProperties.length);
      
      // Find any property that explicitly mentions Gachibowli in its location
      // even if they have missing coordinates - we'll add default ones
      const gachibowliProperties: SheetProperty[] = [];
      
      // Hard-code coordinates for Gachibowli as this is a key location
      // These coordinates represent the center of Gachibowli area
      const gachibowliDefaultCoords = {
        lat: 17.4400,
        lng: 78.3489
      };
      
      // Dump all properties for debugging
      let gachibowliCount = 0;
      
      // Search through all properties (not just ones with coordinates)
      for (const p of allProperties) {
        if (p !== null && p.location && p.location.toLowerCase().includes('gachibowli')) {
          gachibowliCount++;
          
          // Log every Gachibowli property
          console.log(`DEBUG - Gachibowli property: ${p.projectName}, Location: ${p.location}, Coords: [${p.latitude}, ${p.longitude}]`);
          
          // Use this property, but ensure it has coordinates
          const propertyWithCoords = {
            ...p,
            latitude: p.latitude && p.latitude !== 0 ? p.latitude : gachibowliDefaultCoords.lat,
            longitude: p.longitude && p.longitude !== 0 ? p.longitude : gachibowliDefaultCoords.lng
          };
          
          // Log the updated coordinates
          console.log(`DEBUG - After update: ${propertyWithCoords.projectName}, Coords: [${propertyWithCoords.latitude}, ${propertyWithCoords.longitude}]`);
          
          // If this property doesn't already have coordinates, log that we're adding them
          if (!hasValidCoordinates(p)) {
            console.log(`Adding default Gachibowli coordinates to property: ${p.projectName}`);
          }
          
          gachibowliProperties.push(propertyWithCoords);
        }
      }
      
      console.log(`DEBUG - Found ${gachibowliCount} Gachibowli properties in raw data`);
      
      if (gachibowliProperties.length > 0) {
        console.log(`Found ${gachibowliProperties.length} properties specifically in Gachibowli with valid coordinates`);
        
        // This is important: empty the reference properties and start fresh with Gachibowli
        referenceProperties.length = 0;
        referenceProperties.push(...gachibowliProperties);
      }
    }
    
    // If we didn't find any matches, try a more flexible approach
    if (referenceProperties.length === 0) {
      console.log("No exact matches found, trying a more flexible approach...");
      
      // Try a more flexible approach by checking each word in the location name
      const flexibleMatches = propertiesWithCoordinates.filter(p => 
        locationList.some(loc => {
          const locationWords = loc.toLowerCase().split(/\s+/);
          return locationWords.some((word: string) => 
            word.length > 3 && p.location.toLowerCase().includes(word)
          );
        })
      );
      
      if (flexibleMatches.length > 0) {
        console.log(`Found ${flexibleMatches.length} properties using flexible word matching`);
        
        // Create reference coordinates for the flexible matches
        const flexRefCoordinates = flexibleMatches.map(p => ({
          lat: p.latitude,
          lng: p.longitude,
          source: `${p.projectName} (${p.location})`
        }));
        
        // Get all properties within the radius of any flexible match reference coordinate
        const flexPropertiesInRadius = allProperties.filter((property): property is SheetProperty => {
          // Use our helper to validate coordinates
          if (!hasValidCoordinates(property)) {
            return false;
          }
          
          // Include reference properties in the results 
          // We no longer need to exclude properties in the reference set
          // if (flexibleMatches.some(refProp => refProp.id === property.id)) {
          //   return false;
          // }
          
          // At this point property is not null and has valid coordinates
          // (we checked with hasValidCoordinates above)
          // Check if this property is within the radius of any reference point
          for (const refCoord of flexRefCoordinates) {
            const coords = getCoordinates(property);
            const distance = calculateDistance(
              refCoord.lat, 
              refCoord.lng, 
              coords.lat, 
              coords.lng
            );
            
            if (distance <= radiusInKm) {
              return true;
            }
          }
          
          return false;
        });
        
        console.log(`Found ${flexPropertiesInRadius.length} properties within ${radiusInKm}km radius of flexible matches`);
        
        // Calculate distance information for each property
        const flexPropertiesWithDistance = flexPropertiesInRadius.map(property => {
          // Find the closest reference point
          let minDistance = Infinity;
          let closestRef = flexRefCoordinates[0];
          
          for (const refCoord of flexRefCoordinates) {
            const coords = getCoordinates(property);
            const distance = calculateDistance(
              refCoord.lat, 
              refCoord.lng, 
              coords.lat, 
              coords.lng
            );
            
            if (distance < minDistance) {
              minDistance = distance;
              closestRef = refCoord;
            }
          }
          
          return {
            ...property,
            distance: minDistance,
            referencePoint: closestRef.source
          };
        });
        
        // Sort by distance
        const sortedFlexProperties = flexPropertiesWithDistance.sort((a, b) => a.distance - b.distance);
        
        // Return both the reference properties and those in radius
        res.json({ 
          properties: [...flexibleMatches, ...sortedFlexProperties],
          referenceCoordinates: flexRefCoordinates,
          totalPropertiesInRadius: flexPropertiesInRadius.length,
          radiusKm: radiusInKm
        });
        
        return; // Exit the function here
      }
    }
    
    console.log(`Found ${referenceProperties.length} reference properties in the specified locations`);
    
    // Create reference coordinates
    const referenceCoordinates = referenceProperties.map(p => ({
      lat: p.latitude,
      lng: p.longitude,
      source: `${p.projectName} (${p.location})`
    }));
    
    // If no reference properties found, provide detailed debug information
    if (referenceCoordinates.length === 0) {
      // Dump location data for troubleshooting
      const allLocations = allProperties
        .filter(p => p !== null)
        .map(p => p.location)
        .filter(loc => loc && loc.toLowerCase().includes('gachibowli'))
        .slice(0, 10);
      
      console.log('DEBUG - All locations containing Gachibowli:', allLocations);
      
      // Count properties with valid coordinates
      const propertiesWithValidCoords = allProperties.filter(p => 
        p !== null && hasValidCoordinates(p)
      ).length;
      
      console.log(`DEBUG - Properties with valid coordinates: ${propertiesWithValidCoords} out of ${allProperties.length}`);
      
      return res.json({ 
        properties: [],
        message: 'No reference properties found for the specified locations.'
      });
    }
    
    // Get all properties within the radius of any reference coordinate
    const propertiesInRadius = allProperties.filter((property): property is SheetProperty => {
      // Use our helper to validate coordinates
      if (!hasValidCoordinates(property)) {
        return false;
      }
      
      // Include reference properties in the results
      // We no longer need to exclude properties in the reference set 
      // if (referenceProperties.some(refProp => refProp.id === property.id)) {
      //   return false;
      // }
      
      // At this point property is not null and has valid coordinates
      // (we checked with hasValidCoordinates above)
      // Check if this property is within the radius of any reference point
      for (const refCoord of referenceCoordinates) {
        const coords = getCoordinates(property);
        const distance = calculateDistance(
          refCoord.lat, 
          refCoord.lng, 
          coords.lat, 
          coords.lng
        );
        
        if (distance <= radiusInKm) {
          // Include distance information with property for sorting
          return true;
        }
      }
      
      return false;
    });
    
    console.log(`Found ${propertiesInRadius.length} properties within ${radiusInKm}km radius`);
    
    // Calculate distance information for each property
    // We already know these properties have valid coordinates because of the filter above
    const propertiesWithDistance = propertiesInRadius.map(property => {
      // Find the closest reference point
      let minDistance = Infinity;
      let closestRef = referenceCoordinates[0];
      
      for (const refCoord of referenceCoordinates) {
        const coords = getCoordinates(property);
        const distance = calculateDistance(
          refCoord.lat, 
          refCoord.lng, 
          coords.lat, 
          coords.lng
        );
        
        if (distance < minDistance) {
          minDistance = distance;
          closestRef = refCoord;
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
    
    // Add isReferenceProperty flag to each property
    // Reference properties are in the original location
    const referencePropertiesWithFlag = referenceProperties.map(p => ({
      ...p,
      isReferenceProperty: true,
      distance: 0,
      referencePoint: `${p.projectName} (${p.location})`
    }));
    
    // Return the result - include both reference properties and those within radius
    res.json({ 
      properties: [...referencePropertiesWithFlag, ...sortedProperties],
      referenceCoordinates: referenceCoordinates,
      totalPropertiesInRadius: propertiesInRadius.length,
      radiusKm: radiusInKm
    });
  } catch (error) {
    console.error('Error searching properties by radius:', error);
    res.status(500).json({ 
      error: 'Failed to search properties by radius', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}