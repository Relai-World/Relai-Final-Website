import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { searchImages } from './image-search';
import { getPropertyImages } from './property-images';
import { getMapImages } from './google-maps-images';
import { getFallbackPropertyImages } from './property-fallback-images';

// Google Sheet ID for property data
export const SHEET_ID = '1hjNRFIQBvZXZZSjUH6iZyq7Sypu-zeQ2q4hfnmHRLR0';

// Create an authenticated Google Sheets connection
export async function getGoogleSheet() {
  try {
    console.log('Loading service account from file...');
    
    // Use the service account file directly
    const serviceAccountPath = './server/service-account.json';
    
    // Import fs module for file reading
    const fs = require('fs');
    
    // Read service account file
    const serviceAccountContent = fs.readFileSync(serviceAccountPath, 'utf8');
    const serviceAccount = JSON.parse(serviceAccountContent);
    
    console.log(`Using Google service account email: ${serviceAccount.client_email}`);
    
    // Create service account auth object
    const serviceAccountAuth = new JWT({
      email: serviceAccount.client_email,
      key: serviceAccount.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    // Create a new Google Spreadsheet instance
    const doc = new GoogleSpreadsheet(SHEET_ID, serviceAccountAuth);
    
    // Load document info and worksheets
    await doc.loadInfo();
    console.log(`Successfully loaded document: ${doc.title}`);
    
    return doc;
  } catch (error) {
    console.error('Error connecting to Google Sheets:', error);
    throw error;
  }
}

// Fetch all properties from Google Sheets
export async function fetchAllProperties() {
  try {
    console.log('Fetching properties from Google Sheets...');
    
    // Get the spreadsheet
    const doc = await getGoogleSheet();
    
    // Get the first sheet (assumes property data is in the first sheet)
    const sheet = doc.sheetsByIndex[0];
    console.log(`Working with sheet: ${sheet.title}`);
    
    // Load all rows
    const rows = await sheet.getRows();
    console.log(`Found ${rows.length} rows of data`);
    
    // Process rows into property objects
    const properties = rows.map((row, index) => {
      try {
        // Get the actual column headers from the first row for debugging
        if (index === 0) {
          // Log the column headers if available - using any to bypass type checking
          const anyRow = row as any;
          if (anyRow._sheet && anyRow._sheet.headerValues) {
            console.log("Available columns:", anyRow._sheet.headerValues);
          }
        }
      
        // Extract basic identifiers
        const rowId = row.get('id') || row.get('ID') || row.get('ProjectID');
        const projectName = row.get('ProjectName') || row.get('name') || '';
        const developerName = row.get('DeveloperName') || row.get('builder') || '';
        
        // Generate a more unique ID using multiple property attributes when 'id' is not available
        // This ensures that properties with different names/locations have different IDs
        let uniqueId;
        if (rowId) {
          // If there's an ID in the sheet, use it
          uniqueId = String(rowId).trim();
        } else {
          // Otherwise create a more unique ID based on multiple property attributes and index
          const namePart = projectName ? projectName.substring(0, 10).trim().replace(/\s+/g, '-').toLowerCase() : '';
          const locationPart = row.get('Location') ? row.get('Location').substring(0, 10).trim().replace(/\s+/g, '-').toLowerCase() : '';
          uniqueId = `prop-${namePart}-${locationPart}-${index}`.replace(/--+/g, '-');
        }
        
        // Parse arrays
        const parseArray = (value: string | null | undefined): string[] => {
          if (!value) return [];
          return String(value).split(',').map(item => item.trim()).filter(Boolean);
        };
        
        // Parse amenities/features
        const amenities = parseArray(row.get('Amenities') || row.get('features'));
        
        // Parse nearby locations
        const nearbyLocations = parseArray(row.get('NearbyLocations'));
        
        // Parse FAQ
        const faq = parseArray(row.get('FAQ'));
        
        // Parse loan approved banks
        const loanApprovedBanks = parseArray(row.get('LoanApprovedBanks'));
        
        // Parse images
        const images = parseArray(row.get('images') || row.get('ProjectImages'));
                
        // Create property object with all available fields
        return {
          // Basic identifiers
          id: uniqueId,
          developerName: developerName,
          reraNumber: row.get('RERA_Number') || '',
          
          // Project identity & status
          projectName: projectName,
          constructionStatus: row.get('ConstructionStatus') || '',
          propertyType: row.get('PropertyType') || row.get('propertyType') || '',
          location: row.get('Location') || row.get('location') || '',
          possessionDate: row.get('PossessionDate') || row.get('possession') || '',
          
          // Community and scale
          isGatedCommunity: (row.get('IsGatedCommunity') || '').toLowerCase() === 'yes' || 
                            (row.get('IsGatedCommunity') || '').toLowerCase() === 'true',
          totalUnits: parseInt(row.get('TotalUnits') || '0', 10),
          areaSizeAcres: parseFloat(row.get('AreaSizeAcres') || '0'),
          
          // Configuration & dimensions
          configurations: row.get('Configurations') || '',
          minSizeSqft: parseInt(row.get('MinSizeSqft') || row.get('area') || '0', 10),
          maxSizeSqft: parseInt(row.get('MaxSizeSqft') || row.get('area') || '0', 10),
          pricePerSqft: parseFloat(row.get('PricePerSqft') || '0'),
          pricePerSqftOTP: parseFloat(row.get('PricePerSqftOTP') || '0'),
          price: parseFloat(row.get('price') || '0'),
          
          // Geo & source info
          longitude: parseFloat(row.get('Longitude') || '0'),
          latitude: parseFloat(row.get('Latitude') || '0'),
          projectDocumentsLink: row.get('ProjectDocumentsLink') || '',
          source: row.get('Source') || '',
          
          // Contact & sales info
          builderContactInfo: row.get('BuilderContactInfo') || '',
          listingType: row.get('ListingType') || '',
          loanApprovedBanks: loanApprovedBanks,
          
          // Contextual & supporting info
          nearbyLocations: nearbyLocations,
          remarksComments: row.get('RemarksComments') || '',
          amenities: amenities,
          faq: faq,
          
          // Legacy fields to maintain compatibility with existing code
          name: projectName,
          bedrooms: parseInt(row.get('bedrooms') || '0'),
          bathrooms: parseInt(row.get('bathrooms') || '0'),
          area: parseInt(row.get('area') || row.get('MinSizeSqft') || '0'),
          description: row.get('description') || row.get('RemarksComments') || '',
          features: amenities,
          images: images,
          builder: developerName,
          possession: row.get('possession') || row.get('PossessionDate') || '',
          rating: parseFloat(row.get('rating') || '0'),
        };
      } catch (error) {
        console.error(`Error processing row ${index}:`, error);
        return null;
      }
    }).filter(Boolean); // Remove any null entries
    
    console.log(`Successfully processed ${properties.length} properties`);
    
    // Fetch images for properties that don't have any
    // This is done in a non-blocking way to avoid delaying the initial response
    setTimeout(async () => {
      try {
        let imagesAddedCount = 0;
        
        for (const property of properties) {
          if (property && (!property.images || property.images.length === 0)) {
            try {
              // Use Google Maps API to get real property images
              console.log(`Getting map images for property: "${property.projectName}" in ${property.location}`);
              
              // Only fetch images if we have a valid property name
              if (property.projectName && property.projectName.trim() !== '') {
                const mapImages = await getMapImages(property.projectName, property.location, 3);
                
                if (mapImages && mapImages.length > 0) {
                  console.log(`✓ Successfully found ${mapImages.length} map images for: ${property.projectName}`);
                  property.images = mapImages;
                  imagesAddedCount++;
                  
                  // Log progress every 5 properties
                  if (imagesAddedCount % 5 === 0) {
                    console.log(`Added images to ${imagesAddedCount} properties so far...`);
                  }
                } else {
                  console.log(`× No map images found for ${property.projectName}, using fallback images instead`);
                  // Use fallback images based on property type
                  property.images = getFallbackPropertyImages(property.propertyType, 5);
                  console.log(`✓ Applied ${property.images.length} fallback images for ${property.projectName}`);
                }
              } else {
                console.log(`Skipping image fetch for property with invalid name: ${property.projectName}`);
                // Use fallback images based on property type
                property.images = getFallbackPropertyImages(property.propertyType, 5);
              }
            } catch (error) {
              console.error(`Error getting images for property ${property.id}:`, error);
              console.log(`Using fallback images for ${property.projectName} due to error`);
              // Use fallback images based on property type
              property.images = getFallbackPropertyImages(property.propertyType, 5);
            }
          }
        }
        
        console.log(`Finished adding images to ${imagesAddedCount} properties`);
      } catch (error) {
        console.error('Error in background image fetching:', error);
      }
    }, 100);
    
    return properties;
  } catch (error) {
    console.error('Error fetching properties from Google Sheets:', error);
    throw error;
  }
}

// Define property type for type safety based on the provided column descriptions
export type SheetProperty = {
  // Basic identifiers
  id: string;
  developerName: string;
  reraNumber: string;
  
  // Project identity & status
  projectName: string;
  constructionStatus: string;
  propertyType: string;
  location: string;
  possessionDate: string;
  
  // Community and scale
  isGatedCommunity: boolean;
  totalUnits: number;
  areaSizeAcres: number;
  
  // Configuration & dimensions
  configurations: string;
  minSizeSqft: number;
  maxSizeSqft: number;
  pricePerSqft: number;
  pricePerSqftOTP: number;
  price: number; // Total price (calculated or provided)
  
  // Geo & source info
  longitude: number;
  latitude: number;
  projectDocumentsLink: string;
  source: string;
  
  // Contact & sales info
  builderContactInfo: string;
  listingType: string;
  loanApprovedBanks: string[];
  
  // Contextual & supporting info
  nearbyLocations: string[];
  remarksComments: string;
  amenities: string[];
  faq: string[];
  
  // Legacy fields to maintain compatibility with existing code
  name: string; // Same as projectName
  bedrooms: number;
  bathrooms: number;
  area: number; // Same as minSizeSqft or maxSizeSqft
  description: string; // Same as remarksComments
  features: string[]; // Same as amenities
  images: string[];
  builder: string; // Same as developerName
  possession: string; // Same as possessionDate
  rating: number;
};

// Apply filters to property data
export function filterProperties(properties: (SheetProperty | null)[], filters: {
  search?: string;
  location?: string;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  minPricePerSqft?: number;
  maxPricePerSqft?: number;
  configurations?: string;
  constructionStatus?: string;
}) {
  // First, filter out any null values and cast to SheetProperty[]
  let filteredProperties = properties.filter((p): p is SheetProperty => p !== null);
  
  // Apply search filter (searches across name, location, and description)
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filteredProperties = filteredProperties.filter(property => 
      property.name.toLowerCase().includes(searchTerm) ||
      property.location.toLowerCase().includes(searchTerm) ||
      property.description.toLowerCase().includes(searchTerm)
    );
  }
  
  // We're removing location filtering from here as it will be handled in the getAllPropertiesHandler
  // This ensures we can use both the original location data and Google Maps geocoded data
  // if (filters.location) {
  //   const locationTerm = filters.location.toLowerCase();
  //   filteredProperties = filteredProperties.filter(property => {
  //     return property.location.toLowerCase().includes(locationTerm);
  //   });
  // }
  
  // Apply property type filter - handle multiple property types
  if (filters.propertyType) {
    // Split the property type filter by comma to handle multiple types
    const propertyTypes = filters.propertyType.split(',').map(type => type.trim());
    console.log(`Filtering by property types: ${propertyTypes.join(', ')}`);
    
    // Log some sample property types from the database for debugging
    const samplePropertyTypes = Array.from(new Set(filteredProperties.slice(0, 20).map(p => p.propertyType)));
    console.log(`Sample property types in database: ${samplePropertyTypes.join(', ')}`);
    console.log(`Total properties before filtering: ${filteredProperties.length}`);
    
    // Count properties by type for debugging
    const propertyTypeCounts: Record<string, number> = {};
    filteredProperties.forEach(property => {
      const type = property.propertyType;
      propertyTypeCounts[type] = (propertyTypeCounts[type] || 0) + 1;
    });
    console.log(`Property type counts:`, propertyTypeCounts);
    
    filteredProperties = filteredProperties.filter(property => {
      // Check if the property type matches any of the requested types
      const matches = propertyTypes.includes(property.propertyType);
      if (matches) {
        console.log(`Property "${property.name}" matches type filter: ${property.propertyType}`);
      }
      return matches;
    });
    
    console.log(`After property type filter: ${filteredProperties.length} properties`);
  }
  
  // Apply min price filter
  if (typeof filters.minPrice === 'number' && filters.minPrice !== undefined) {
    const minPrice = filters.minPrice;
    filteredProperties = filteredProperties.filter(property =>
      property.price >= minPrice
    );
  }
  
  // Apply max price filter
  if (typeof filters.maxPrice === 'number' && filters.maxPrice !== undefined) {
    const maxPrice = filters.maxPrice;
    filteredProperties = filteredProperties.filter(property =>
      property.price <= maxPrice
    );
  }
  
  // Apply bedrooms filter
  if (typeof filters.bedrooms === 'number' && filters.bedrooms !== undefined) {
    const bedroomsCount = filters.bedrooms;
    filteredProperties = filteredProperties.filter(property =>
      property.bedrooms === bedroomsCount
    );
  }
  
  // Apply min price per sqft filter
  if (typeof filters.minPricePerSqft === 'number' && filters.minPricePerSqft !== undefined) {
    const minPricePerSqft = filters.minPricePerSqft;
    filteredProperties = filteredProperties.filter(property =>
      property.pricePerSqft >= minPricePerSqft
    );
  }
  
  // Apply max price per sqft filter
  if (typeof filters.maxPricePerSqft === 'number' && filters.maxPricePerSqft !== undefined) {
    const maxPricePerSqft = filters.maxPricePerSqft;
    filteredProperties = filteredProperties.filter(property =>
      property.pricePerSqft <= maxPricePerSqft
    );
  }
  
  // Apply configurations filter
  if (filters.configurations) {
    const configFilter = filters.configurations;
    filteredProperties = filteredProperties.filter(property =>
      property.configurations && property.configurations.includes(configFilter as string)
    );
  }
  
  // Apply construction status filter
  if (filters.constructionStatus) {
    const statusFilter = filters.constructionStatus;
    filteredProperties = filteredProperties.filter(property =>
      property.constructionStatus === statusFilter
    );
  }
  
  return filteredProperties;
}

// Get a specific property by ID
export async function getPropertyById(propertyId: string): Promise<SheetProperty | undefined> {
  try {
    const properties = await fetchAllProperties();
    // First filter out null values then find the property
    const nonNullProperties = properties.filter((p): p is SheetProperty => p !== null);
    const property = nonNullProperties.find(property => property.id === propertyId);
    
    if (property) {
      // If property has no images, get them using Maps API
      if (!property.images || property.images.length === 0) {
        try {
          console.log(`Getting map images for property: "${property.projectName}" in ${property.location}`);
          
          // Only fetch images if we have a valid property name
          if (property.projectName && property.projectName.trim() !== '') {
            // Use Google Maps API to get real property images
            const mapImages = await getMapImages(property.projectName, property.location, 5);
            
            if (mapImages && mapImages.length > 0) {
              console.log(`✓ Successfully found ${mapImages.length} map images for: ${property.projectName}`);
              property.images = mapImages;
            } else {
              console.log(`× No map images found for ${property.projectName}, using fallback images instead`);
              // Use fallback images based on property type
              property.images = getFallbackPropertyImages(property.propertyType, 5);
              console.log(`✓ Applied ${property.images.length} fallback images for ${property.projectName}`);
            }
          } else {
            console.log(`Skipping image fetch for property with invalid name: ${property.projectName}`);
            // Use fallback images based on property type
            property.images = getFallbackPropertyImages(property.propertyType, 5);
          }
        } catch (error) {
          console.error(`Error getting images for property ${property.id}:`, error);
          console.log(`Using fallback images for ${property.projectName} due to error`);
          // Use fallback images based on property type
          property.images = getFallbackPropertyImages(property.propertyType, 5);
        }
      }
    }
    
    return property;
  } catch (error) {
    console.error('Error fetching property by ID:', error);
    throw error;
  }
}