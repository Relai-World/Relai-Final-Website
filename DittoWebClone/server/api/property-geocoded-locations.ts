import { Request, Response } from 'express';
import { fetchAllProperties, SheetProperty } from './google-sheets';
import axios from 'axios';

// Get all unique property locations from Google Maps geocoding based on coordinates
export async function getGeocodedLocationsHandler(req: Request, res: Response) {
  try {
    console.log("Getting major area names from Google Maps...");
    
    // Create a set for the final list of area names to display
    const areaSet = new Set<string>();
    
    // Step 1: Add all known major areas to start with
    MAJOR_AREAS.forEach(area => areaSet.add(area));
    console.log(`Added ${MAJOR_AREAS.length} predefined major areas`);
    
    // Step 2: Get properties with coordinates for geocoding
    const properties = await fetchAllProperties();
    const validProperties = properties.filter((p): p is SheetProperty => p !== null);
    const propertiesWithCoordinates = validProperties.filter(p => p.latitude !== 0 && p.longitude !== 0);
    
    console.log(`Found ${propertiesWithCoordinates.length} properties with coordinates for geocoding`);
    
    // Step 3: Look for major areas in the original data
    validProperties.forEach(property => {
      if (property.location) {
        const locationParts = property.location.split(',');
        if (locationParts.length > 0) {
          const primaryLocation = locationParts[0].trim();
          
          // Check if this location contains any known major area names
          for (const majorArea of MAJOR_AREAS) {
            if (primaryLocation.toLowerCase().includes(majorArea.toLowerCase())) {
              areaSet.add(majorArea);
              break;
            }
          }
        }
      }
    });
    
    console.log(`Found ${areaSet.size} areas after checking property location text`);
    
    // Step 4: Use Google Maps API to get more areas from coordinates
    // Create a cache to avoid duplicate API calls
    const coordinateCache: Record<string, boolean> = {};
    
    // Limit the number of properties to geocode to avoid rate limiting and timeout
    const MAX_PROPERTIES = 30;
    const limitedProperties = propertiesWithCoordinates.slice(0, MAX_PROPERTIES);
    
    console.log(`Processing ${limitedProperties.length} properties for major area extraction`);
    
    // Process properties in batches to avoid rate limiting
    const BATCH_SIZE = 5;
    for (let i = 0; i < limitedProperties.length; i += BATCH_SIZE) {
      const batch = limitedProperties.slice(i, Math.min(i + BATCH_SIZE, limitedProperties.length));
      console.log(`Processing geocoding batch ${Math.floor(i/BATCH_SIZE) + 1} of ${Math.ceil(limitedProperties.length/BATCH_SIZE)}`);
      
      for (const property of batch) {
        // Round coordinates to avoid repeated API calls for very similar locations
        const roundedLat = Math.round(property.latitude * 1000) / 1000;
        const roundedLng = Math.round(property.longitude * 1000) / 1000;
        const coordKey = `${roundedLat},${roundedLng}`;
        
        // Skip if we've already processed this coordinate
        if (coordinateCache[coordKey]) {
          continue;
        }
        
        coordinateCache[coordKey] = true;
        
        try {
          // Get area names from Google Maps
          const areaNames = await getLocationFromCoordinates(property.latitude, property.longitude);
          
          // Add each area name to the set
          for (const area of areaNames) {
            if (area && area.trim()) {
              areaSet.add(area.trim());
              console.log(`Added geocoded area: ${area} for ${property.projectName}`);
            }
          }
        } catch (error) {
          console.error(`Error geocoding coordinates for property ${property.id}:`, error);
        }
      }
      
      // Add a delay between batches to avoid rate limiting
      if (i + BATCH_SIZE < limitedProperties.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    // Convert to array and sort alphabetically
    const allAreas = Array.from(areaSet).sort();
    
    console.log(`Final result: ${allAreas.length} major areas from combined sources`);
    
    // Add "Any Location" as the first option
    const areasWithAny = ["Any Location", ...allAreas];
    
    // Return the areas
    res.json({ locations: areasWithAny });
  } catch (error) {
    console.error('Error fetching major area names:', error);
    
    // Fallback to just the list of known major areas in case of an error
    try {
      // Sort the predefined areas alphabetically
      const fallbackAreas = [...MAJOR_AREAS].sort();
      console.log(`Fallback: returning ${fallbackAreas.length} predefined major areas`);
      
      res.json({ locations: ["Any Location", ...fallbackAreas] });
    } catch (fallbackError) {
      res.status(500).json({ 
        error: 'Failed to fetch locations', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }
}

// List of known major areas in Hyderabad
const MAJOR_AREAS = [
  'Hitech City', 'HITEC City', 'Gachibowli', 'Kondapur', 'Kukatpally', 'Madhapur', 'Miyapur', 'Manikonda', 
  'Banjara Hills', 'Jubilee Hills', 'Secunderabad', 'Uppal', 'Tellapur', 'Financial District', 
  'Shamshabad', 'Attapur', 'Mehdipatnam', 'Ameenpur', 'Narsingi', 'Nallagandla', 'Kokapet',
  'Bachupally', 'Nizampet', 'Pocharam', 'Kompally', 'Chandanagar', 'Shamirpet', 'Sainikpuri',
  'Gopanpally', 'Hafeezpet', 'KPHB', 'LB Nagar', 'Nanakramguda', 'Lingampally', 'Amberpet',
  'Toli Chowki', 'Khajaguda', 'Begumpet', 'Yapral', 'Alwal', 'ECIL', 'Bandlaguda', 'Malkajgiri',
  'Kothapet', 'Malakpet', 'Boduppal', 'Ghatkesar', 'Bowenpally', 'Chanda Nagar', 'Yousufguda',
  'Kukatpally', 'Dilsukhnagar', 'Puppalaguda', 'Madinaguda', 'Rajendra Nagar', 'Somajiguda',
  'Chikkadpally', 'Shaikpet', 'Kothaguda', 'Habsiguda', 'Raidurgam', 'Vanasthalipuram', 'Tarnaka'
];

// Helper function to normalize and match area names
function isKnownArea(areaName: string): boolean {
  const normalizedName = areaName.toLowerCase().trim();
  return MAJOR_AREAS.some(area => normalizedName.includes(area.toLowerCase()));
}

// Helper function to get area name from coordinates via Google Maps Geocoding API
export async function getLocationFromCoordinates(latitude: number, longitude: number): Promise<string[]> {
  if (!latitude || !longitude || latitude === 0 || longitude === 0) {
    return [];
  }
  
  try {
    // First try to get the API key from the new environment variable
    let apiKey = process.env.GOOGLE_API_KEY;
    
    // If not found, try the old environment variable name
    if (!apiKey) {
      apiKey = process.env.GOOGLE_API_KEY;
    }
    
    if (!apiKey) {
      console.error('Google Maps API key not found for geocoding');
      return [];
    }
    
    console.log('Using Google Maps API key for geocoding');
    
    console.log(`Geocoding coordinates: ${latitude},${longitude}`);
    
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
    );
    
    if (response.data.status !== 'OK') {
      console.error('Geocoding API error:', response.data.status);
      return [];
    }
    
    const results = response.data.results;
    if (!results || results.length === 0) {
      console.log('No results from geocoding API');
      return [];
    }
    
    // Extract only area names from address components
    const areas: string[] = [];
    const allPotentialAreas: string[] = [];
    
    // Step 1: Try to match with known major areas first
    for (const result of results) {
      for (const component of result.address_components) {
        const componentName = component.long_name;
        
        // Look for any known major areas in the component name
        if (isKnownArea(componentName)) {
          console.log(`Found known major area: ${componentName}`);
          
          // Find the matched area from our list for consistent naming
          const matchedArea = MAJOR_AREAS.find(area => 
            componentName.toLowerCase().includes(area.toLowerCase())
          );
          
          if (matchedArea && !areas.includes(matchedArea)) {
            areas.push(matchedArea);
          }
        }
        
        // Also collect potential areas for fallback
        if (component.types.includes('sublocality_level_1') || 
            component.types.includes('sublocality') ||
            component.types.includes('neighborhood')) {
          allPotentialAreas.push(componentName);
        }
      }
      
      // If we found known major areas, no need to process further
      if (areas.length > 0) {
        break;
      }
    }
    
    // Step 2: If no known areas were found, use the most specific neighborhood/sublocality
    if (areas.length === 0 && allPotentialAreas.length > 0) {
      // Prefer shorter, cleaner area names (typically major areas have shorter names)
      const sortedAreas = allPotentialAreas
        .filter(area => area.length >= 3 && area.length <= 20)  // Avoid very short or very long names
        .sort((a, b) => a.length - b.length);  // Sort by length (shorter first)
      
      if (sortedAreas.length > 0) {
        console.log(`No known major areas found, using most specific area: ${sortedAreas[0]}`);
        areas.push(sortedAreas[0]);
      }
    }
    
    // Step 3: Last resort - extract from formatted address
    if (areas.length === 0 && results[0].formatted_address) {
      const addressParts = results[0].formatted_address.split(',');
      if (addressParts.length >= 2) {
        // Check if the first part looks like an area name (not too long, not a number)
        const potentialArea = addressParts[0].trim();
        if (potentialArea.length <= 25 && !/^\d+/.test(potentialArea)) {
          console.log(`Extracting area from formatted address: ${potentialArea}`);
          areas.push(potentialArea);
        }
      }
    }
    
    console.log(`Final extracted areas: ${areas.join(', ')}`);
    return areas;
  } catch (error) {
    console.error('Error getting location from coordinates:', error);
    return [];
  }
}

// Use original location data as fallback to ensure we have locations
export async function getGeocodedLocations(): Promise<string[]> {
  try {
    const properties = await fetchAllProperties();
    
    // Filter out null properties
    const validProperties = properties.filter((p): p is SheetProperty => p !== null);
    
    // Get original locations from properties (as fallback)
    const originalLocations = validProperties.map(p => p.location.trim()).filter(Boolean);
    
    // Create a map of original locations to remove duplicates
    const originalLocationMap: Record<string, boolean> = {};
    originalLocations.forEach(location => {
      // Extract meaningful location parts (usually the neighborhood/area name)
      const locationParts = location.split(',');
      if (locationParts.length > 0) {
        const primaryLocation = locationParts[0].trim();
        // Filter out numeric values and survey numbers
        if (primaryLocation && 
            !/^\d+$/.test(primaryLocation) && 
            !/^[0-9\/-]+$/.test(primaryLocation) &&
            !primaryLocation.startsWith('Survey No') &&
            !primaryLocation.startsWith('S.No') &&
            !primaryLocation.startsWith('Plot No') &&
            !primaryLocation.toLowerCase().includes('feet road') &&
            !primaryLocation.toLowerCase().includes('of ') &&
            primaryLocation.length > 2) {
          originalLocationMap[primaryLocation] = true;
        }
      } else if (location &&
                 !/^\d+$/.test(location) && 
                 !/^[0-9\/-]+$/.test(location) &&
                 !location.startsWith('Survey No') &&
                 !location.startsWith('S.No') &&
                 !location.startsWith('Plot No') &&
                 !location.toLowerCase().includes('feet road') &&
                 !location.toLowerCase().includes('of ') &&
                 location.length > 2) {
        originalLocationMap[location] = true;
      }
    });
    
    console.log(`Found ${Object.keys(originalLocationMap).length} valid unique locations from original data`);
    
    // Filter properties with valid coordinates for geocoding
    const propertiesWithCoordinates = validProperties.filter(p => p.latitude !== 0 && p.longitude !== 0);
    
    console.log(`Found ${propertiesWithCoordinates.length} properties with valid coordinates for geocoding`);
    
    // Create a map to avoid duplicate API calls for properties in same approximate location
    const coordinateMap: Record<string, boolean> = {};
    const sampleProperties: SheetProperty[] = [];
    
    // Group properties by approximate coordinates (rounded to 3 decimal places)
    propertiesWithCoordinates.forEach(property => {
      const roundedLat = Math.round(property.latitude * 1000) / 1000;
      const roundedLng = Math.round(property.longitude * 1000) / 1000;
      const coordKey = `${roundedLat},${roundedLng}`;
      
      if (!coordinateMap[coordKey]) {
        coordinateMap[coordKey] = true;
        sampleProperties.push(property);
      }
    });
    
    console.log(`Reduced to ${sampleProperties.length} unique coordinate groups for geocoding`);
    
    // Limit the number of API calls to avoid rate limiting
    const MAX_GEOCODING_CALLS = 20; // Reduced to avoid timeouts
    const limitedProperties = sampleProperties.slice(0, MAX_GEOCODING_CALLS);
    
    console.log(`Limited to ${limitedProperties.length} properties for geocoding API calls`);
    
    // Geocode in parallel with a delay between batches to avoid rate limiting
    const locationInfoArray: string[][] = [];
    const BATCH_SIZE = 2; // Reduced batch size
    
    for (let i = 0; i < limitedProperties.length; i += BATCH_SIZE) {
      console.log(`Processing geocoding batch ${i/BATCH_SIZE + 1} of ${Math.ceil(limitedProperties.length/BATCH_SIZE)}`);
      
      const batch = limitedProperties.slice(i, i + BATCH_SIZE);
      
      // Process this batch in parallel
      const batchResults = await Promise.all(
        batch.map(property => {
          console.log(`Geocoding coordinates: ${property.latitude},${property.longitude} for ${property.projectName}`);
          return getLocationFromCoordinates(property.latitude, property.longitude);
        })
      );
      
      console.log(`Batch results:`, batchResults);
      locationInfoArray.push(...batchResults);
      
      // Longer delay between batches to avoid rate limiting
      if (i + BATCH_SIZE < limitedProperties.length) {
        console.log('Waiting before next geocoding batch...');
        await new Promise(resolve => setTimeout(resolve, 500)); // Increased delay
      }
    }
    
    // Flatten and filter the location info
    const geocodedLocations = locationInfoArray.flat().filter(loc => 
      loc && 
      loc.trim() !== '' && 
      !/^\d+$/.test(loc) && 
      loc.length > 2
    );
    
    console.log(`Got ${geocodedLocations.length} valid locations from geocoding API`);
    
    // Add geocoded locations to the map
    geocodedLocations.forEach(location => {
      originalLocationMap[location] = true;
    });
    
    // Convert to array and sort alphabetically
    const allUniqueLocations = Object.keys(originalLocationMap).sort();
    
    console.log(`Final result: ${allUniqueLocations.length} valid unique locations after combining sources`);
    return allUniqueLocations;
  } catch (error) {
    console.error('Error getting geocoded locations:', error);
    // Return filtered original locations from properties as fallback in case of error
    const properties = await fetchAllProperties();
    const validProperties = properties.filter((p): p is SheetProperty => p !== null);
    
    // Extract and filter location names
    const validLocationNames = validProperties
      .map(p => p.location.split(',')[0].trim())
      .filter(loc => 
        loc && 
        !/^\d+$/.test(loc) && 
        !/^[0-9\/-]+$/.test(loc) &&
        !loc.startsWith('Survey No') &&
        !loc.startsWith('S.No') &&
        !loc.startsWith('Plot No') &&
        !loc.toLowerCase().includes('feet road') &&
        !loc.toLowerCase().includes('of ') &&
        loc.length > 2
      );
    
    const uniqueLocations = Array.from(new Set(validLocationNames)).sort();
    
    console.log(`Fallback: returning ${uniqueLocations.length} valid locations from original data`);
    return uniqueLocations;
  }
}