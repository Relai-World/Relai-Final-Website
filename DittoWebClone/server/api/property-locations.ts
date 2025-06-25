import { Request, Response } from 'express';
import { fetchAllProperties, SheetProperty } from './google-sheets';

// Get all unique property locations from Google Sheets
export async function getUniqueLocationsHandler(req: Request, res: Response) {
  try {
    // Extract unique locations from the properties
    const uniqueLocations = await getUniqueLocations();
    
    // Add "Any Location" as the first option
    const locationsWithAny = ["Any Location", ...uniqueLocations];
    
    res.json({ locations: locationsWithAny });
  } catch (error) {
    console.error('Error fetching unique locations:', error);
    res.status(500).json({ 
      error: 'Failed to fetch locations', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

// Helper function to extract unique locations from Google Sheets data
export async function getUniqueLocations(): Promise<string[]> {
  const properties = await fetchAllProperties();
  
  // Filter out null properties and extract locations
  const allLocations = properties
    .filter((p): p is SheetProperty => p !== null)
    .map(property => property.location)
    .filter(location => location && location.trim() !== '');
  
  // Process each location to extract main areas
  const processedLocations: string[] = [];
  
  allLocations.forEach(location => {
    // Split by common delimiters and extract the most relevant location parts
    const parts = location.split(/,|\s*-\s*|\s+in\s+|\s+at\s+|\s+near\s+/i)
      .map(part => part.trim())
      .filter(part => part.length > 0);
    
    // Add all relevant parts (typically the first 1-2 parts are most relevant)
    if (parts.length > 0) {
      // Add the first part (primary location)
      processedLocations.push(parts[0]);
      
      // Add second part if it looks like a distinct location and not just a descriptor
      if (parts.length > 1 && 
          !parts[1].toLowerCase().includes('hyderabad') && 
          !parts[1].match(/north|south|east|west|central/i)) {
        processedLocations.push(parts[1]);
      }
    }
  });
  
  // Create an object to act as a set for removing duplicates
  const locationMap: Record<string, boolean> = {};
  processedLocations.forEach(location => {
    locationMap[location] = true;
  });
  
  // Convert object keys to array and sort alphabetically
  const uniqueLocations = Object.keys(locationMap).sort();
  
  return uniqueLocations;
}