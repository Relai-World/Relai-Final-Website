import { Request, Response } from 'express';
import { mongodbStorage } from '../mongodb-storage';
import { getLocationFromCoordinates } from './property-geocoded-locations';

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

// Get all unique property locations from database and major areas
export async function getLocationsFromDatabaseHandler(req: Request, res: Response) {
  try {
    console.log("Getting property locations from database...");
    
    // Create a set for the final list of area names to display
    const areaSet = new Set<string>();
    
    // Step 1: Add all known major areas to start with
    MAJOR_AREAS.forEach(area => areaSet.add(area));
    console.log(`Added ${MAJOR_AREAS.length} predefined major areas`);
    
    // Step 2: Get properties from database
    const properties = await mongodbStorage.getAllProperties();
    
    // Step 3: Extract locations from properties
    for (const property of properties) {
      if (property.location) {
        const locationParts = property.location.split(',');
        if (locationParts.length > 0) {
          // Get primary location (first part)
          const primaryLocation = locationParts[0].trim();
          
          // Filter out numeric values, survey numbers, etc.
          if (primaryLocation && 
              !/^\d+$/.test(primaryLocation) && 
              !/^[0-9\/-]+$/.test(primaryLocation) &&
              !primaryLocation.startsWith('Survey No') &&
              !primaryLocation.startsWith('S.No') &&
              !primaryLocation.startsWith('Plot No') &&
              !primaryLocation.toLowerCase().includes('feet road') &&
              !primaryLocation.toLowerCase().includes('of ') &&
              primaryLocation.length > 2) {
            
            areaSet.add(primaryLocation);
          }
          
          // Also check if this location contains any known major area names
          for (const majorArea of MAJOR_AREAS) {
            if (property.location.toLowerCase().includes(majorArea.toLowerCase())) {
              areaSet.add(majorArea);
              break;
            }
          }
        }
      }
    }
    
    console.log(`Found ${areaSet.size} areas after checking property locations`);
    
    // Convert to array and sort alphabetically
    const allAreas = Array.from(areaSet).sort();
    
    // Add "Any Location" as the first option
    const areasWithAny = ["Any Location", ...allAreas];
    
    // Return the areas
    res.json({ locations: areasWithAny });
  } catch (error) {
    console.error('Error fetching locations from database:', error);
    
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