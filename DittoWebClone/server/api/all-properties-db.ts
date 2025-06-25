import { Request, Response } from 'express';
import { mongodbStorage } from '../mongodb-storage';
import { assessImageQuality, getMapImages } from './google-maps-images';
import { Property } from '@shared/schema';

// Cache for geocoded location data to improve performance
const locationCache: Record<string, string[]> = {};

/**
 * Calculate distance between two coordinates in kilometers using Haversine formula
 * Returns Infinity if any coordinates are invalid to avoid false matches
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  // Check for invalid coordinates
  if (!lat1 || !lon1 || !lat2 || !lon2 ||
      lat1 === 0 || lon1 === 0 || lat2 === 0 || lon2 === 0 ||
      isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) {
    return Infinity;
  }
  
  // Check for identical coordinates (distance = 0)
  if (lat1 === lat2 && lon1 === lon2) {
    return 0;
  }
  
  // Validate coordinate ranges
  if (Math.abs(lat1) > 90 || Math.abs(lat2) > 90 || Math.abs(lon1) > 180 || Math.abs(lon2) > 180) {
    console.log(`Invalid coordinate range detected: (${lat1},${lon1}) - (${lat2},${lon2})`);
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
    
    // Validate result - sometimes calculations can go wrong
    if (isNaN(distance) || !isFinite(distance) || distance < 0) {
      console.log(`Invalid distance calculation result for (${lat1},${lon1}) - (${lat2},${lon2}): ${distance}`);
      return Infinity;
    }
    
    return distance;
  } catch (error) {
    console.error('Error calculating distance:', error);
    return Infinity;
  }
}

/**
 * Handler for getting all properties from the DATABASE
 */
export async function getAllPropertiesFromDatabaseHandler(req: Request, res: Response) {
  try {
    console.log('Fetching properties from database...');
    console.log('Request query parameters:', req.query);
    
    // Parse filter parameters
    const { 
      search, 
      location, 
      propertyType, 
      minPrice, 
      maxPrice, 
      bedrooms,
      minPricePerSqft,
      maxPricePerSqft,
      configurations,
      constructionStatus,
      possession,
      latitude,
      longitude,
      radius
    } = req.query;
    
    // Prepare filters for database query
    const filters: any = {};
    if (search && search !== 'any' && search !== '' && search !== 'null') filters.search = String(search);
    if (location && location !== 'null' && location !== 'any' && location !== '') filters.location = String(location);
    if (propertyType && propertyType !== 'null' && propertyType !== 'any' && propertyType !== '') filters.propertyType = String(propertyType);
    
    // Handle both price and pricePerSqft filters (for compatibility)
    if (minPricePerSqft && minPricePerSqft !== 'null' && minPricePerSqft !== 'any' && minPricePerSqft !== '') filters.minPricePerSqft = Number(minPricePerSqft);
    if (maxPricePerSqft && maxPricePerSqft !== 'null' && maxPricePerSqft !== 'any' && maxPricePerSqft !== '') filters.maxPricePerSqft = Number(maxPricePerSqft);
    
    // Legacy price filters (total price)
    if (minPrice && minPrice !== 'null' && minPrice !== 'any' && minPrice !== '') filters.minPrice = Number(minPrice);
    if (maxPrice && maxPrice !== 'null' && maxPrice !== 'any' && maxPrice !== '') filters.maxPrice = Number(maxPrice);
    
    if (bedrooms && bedrooms !== 'null' && bedrooms !== 'any' && bedrooms !== '') filters.bedrooms = Number(bedrooms);
    
    // Add configuration and construction status filters
    if (configurations && configurations !== 'null' && configurations !== 'any' && configurations !== '') {
      filters.configurations = String(configurations);
    }
    if (constructionStatus && constructionStatus !== 'null' && constructionStatus !== 'any' && constructionStatus !== '') {
      filters.constructionStatus = String(constructionStatus);
    }
    
    // Add possession timeline filter
    if (possession && possession !== 'null' && possession !== 'any' && possession !== '' && possession !== 'not-decided') {
      filters.possession = String(possession);
    }
    
    // Get properties from database
    const properties = await mongodbStorage.getAllProperties(filters);
    
    console.log(`Retrieved ${properties.length} properties from database`);
    
    // If there are no properties, return empty array
    if (!properties || properties.length === 0) {
      return res.json({ properties: [] });
    }
    
    // --- START: NEW LOGIC TO ADD IMAGES ---
    // For properties that don't have images, fetch at least one
    const propertiesWithImages = await Promise.all(
      properties.map(async (property) => {
        if (!property.images || property.images.length === 0) {
          try {
            // Handle both field name variations (projectName vs ProjectName)
            const propertyName = property.projectName || property.ProjectName || property.name;
            const location = property.location || property.Area || 'Hyderabad';
            
            // Only fetch images if we have a valid property name
            if (propertyName && propertyName.trim() !== '') {
              // Fetch only one image for the thumbnail
              const mapImages = await getMapImages(propertyName, location, 1); 
              if (mapImages && mapImages.length > 0) {
                property.images = mapImages;
                // Optional: You could update the storage here as well, but it might slow down the request.
                // For now, just adding it to the response is enough.
              }
            } else {
              console.log(`Skipping image fetch for property with invalid name: ${property.projectName || property.ProjectName || property.name}`);
            }
          } catch (e) {
            console.error(`Could not fetch thumbnail for ${property.projectName || property.ProjectName}:`, e);
          }
        }
        return property;
      })
    );
    // --- END: NEW LOGIC TO ADD IMAGES ---
    
    // Apply additional filtering based on location if coordinates and radius are provided
    let filteredProperties = propertiesWithImages;
    
    if (latitude && longitude && radius) {
      const lat = parseFloat(String(latitude));
      const lng = parseFloat(String(longitude));
      const searchRadius = parseFloat(String(radius));
      
      if (!isNaN(lat) && !isNaN(lng) && !isNaN(searchRadius)) {
        console.log(`Filtering by location radius: (${lat}, ${lng}) - ${searchRadius}km`);
        
        // For now, we don't do real filtering by radius since we don't have coordinates
        // We keep all properties but in the future we can add coordinates to our properties table
        console.log("Location-based filtering is not fully implemented in database storage yet.");
        
        // In the future, we can uncomment and adapt the following code:
        /*
        filteredProperties = filteredProperties.map(property => {
          // Extract geocoordinates from property
          const propLat = property.latitude || 0;
          const propLng = property.longitude || 0;
          
          // Calculate distance
          const distance = calculateDistance(lat, lng, propLat, propLng);
          
          // Return property with distance
          return {
            ...property,
            distance
          };
        });
        
        // Filter by radius
        filteredProperties = filteredProperties.filter(property => property.distance <= searchRadius);
        
        // Sort by distance
        filteredProperties.sort((a, b) => a.distance - b.distance);
        */
        
        console.log(`Found ${filteredProperties.length} properties within ${searchRadius}km radius`);
      }
    }
    
    // Return the properties
    // Transform properties to use sample data field names for frontend
    const transformedProperties = filteredProperties.map((property: any) => ({
      id: property._id,
      RERA_Number: property.RERA_Number || property.reraNumber,
      ProjectName: property.ProjectName || property.projectName,
      BuilderName: property.BuilderName || property.developerName,
      Area: property.Area || property.location,
      Possession_date: property.Possession_date || property.possessionDate,
      Price_per_sft: property.Price_per_sft || property.pricePerSqft,
      configurations: Array.isArray(property.configurations) ? JSON.stringify(property.configurations) : property.configurations,
      images: property.images,
      // Add any other fields you want to expose from the sample data
      ...property
    }));
    res.json({
      properties: transformedProperties,
      total: transformedProperties.length
    });
  } catch (error) {
    console.error('Error fetching properties from database:', error);
    res.status(500).json({ 
      error: 'Failed to fetch properties', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

/**
 * Get property by ID from the database
 */
export async function getPropertyByIdFromDatabaseHandler(req: Request, res: Response) {
  try {
    const propertyId = req.params.id;
    const { refresh } = req.query;
    const forceRefresh = refresh === 'true';
    
    if (forceRefresh) {
      console.log(`Force refresh requested for property: ${propertyId}`);
    }
    
    if (!propertyId) {
      return res.status(400).json({ error: 'Property ID is required' });
    }
    
    console.log(`API handler: Looking up property with ID: ${propertyId}`);
    
    const property = await mongodbStorage.getPropertyById(propertyId);
    
    if (!property) {
      console.error(`Property not found for ID: ${propertyId}`);
      return res.status(404).json({ error: 'Property not found' });
    }
    
    console.log(`API handler: Found property: ${property.projectName || property.ProjectName || property.name}, sending to client`);
    
    // Import the getMapImages function
    const { getMapImages } = await import('./google-maps-images');
    
    // Check if property needs images or if we're forcing a refresh
    if (!property.images || property.images.length === 0 || forceRefresh) {
      try {
        console.log(`Fetching images for property detail: ${property.projectName || property.ProjectName || property.name}`);
        
        // Use Google Maps API to get property images
        // Handle both field name variations (projectName vs ProjectName)
        const propertyName = property.projectName || property.ProjectName || property.name;
        const location = property.location || property.Area || 'Hyderabad';
        
        // Only fetch images if we have a valid property name
        if (propertyName && propertyName.trim() !== '') {
          const mapImages = await getMapImages(propertyName, location, 5, forceRefresh);
          
          if (mapImages && mapImages.length > 0) {
            console.log(`✓ Found ${mapImages.length} images for property detail: ${propertyName}`);
            property.images = mapImages;
            
            // Update the images in the database for future use
            try {
              const propertyIdValue = (property._id as any).toString();
              if (propertyIdValue) {
                await mongodbStorage.updatePropertyImages(propertyIdValue, mapImages);
                console.log(`✓ Updated image cache in database for: ${propertyName}`);
              } else {
                console.error(`Cannot update images in database: Missing property ID for ${propertyName}`);
              }
            } catch (dbError) {
              console.error(`Failed to update images in database: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`);
            }
          } else {
            console.log(`× No images found for property detail: ${propertyName}`);
          }
        } else {
          console.log(`Skipping image fetch for property detail with invalid name: ${property.projectName || property.ProjectName || property.name}`);
        }
      } catch (imageError) {
        console.error(`Error fetching images for property detail: ${imageError instanceof Error ? imageError.message : 'Unknown error'}`);
      }
    } else {
      console.log(`Using existing images for property: ${property.projectName || property.ProjectName || property.name} (${property.images.length} images)`);
    }
    
    // In getPropertyByIdFromDatabaseHandler, transform the property as well
    const transformedProperty = {
      id: property._id,
      RERA_Number: property.RERA_Number || property.reraNumber,
      ProjectName: property.ProjectName || property.projectName,
      BuilderName: property.BuilderName || property.developerName,
      Area: property.Area || property.location,
      Possession_date: property.Possession_date || property.possessionDate,
      Price_per_sft: property.Price_per_sft || property.pricePerSqft,
      configurations: Array.isArray(property.configurations) ? JSON.stringify(property.configurations) : property.configurations,
      images: property.images,
      // Add any other fields you want to expose from the sample data
      ...property
    };
    res.json({ property: transformedProperty });
  } catch (error) {
    console.error('Error fetching property by ID from database:', error);
    res.status(500).json({ 
      error: 'Failed to fetch property', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

/**
 * Get all properties from the database, prioritizing those with better quality images
 */
export async function getPropertiesWithPrioritizedImagesHandler(req: Request, res: Response) {
  try {
    console.log('Fetching properties with prioritized image quality...');
    
    // Parse filter parameters - same as regular getAllProperties
    const { 
      search, 
      location, 
      propertyType, 
      minPrice, 
      maxPrice, 
      bedrooms,
      minPricePerSqft,
      maxPricePerSqft,
      configurations,
      constructionStatus
    } = req.query;
    
    // Prepare filters for database query
    const filters: any = {};
    if (search) filters.search = String(search);
    if (location && location !== 'null' && location !== 'any') filters.location = String(location);
    if (propertyType && propertyType !== 'null' && propertyType !== 'any') filters.propertyType = String(propertyType);
    
    // Handle price filters
    if (minPricePerSqft && minPricePerSqft !== 'null') filters.minPricePerSqft = Number(minPricePerSqft);
    if (maxPricePerSqft && maxPricePerSqft !== 'null') filters.maxPricePerSqft = Number(maxPricePerSqft);
    if (minPrice && minPrice !== 'null') filters.minPrice = Number(minPrice);
    if (maxPrice && maxPrice !== 'null') filters.maxPrice = Number(maxPrice);
    if (bedrooms && bedrooms !== 'null') filters.bedrooms = Number(bedrooms);
    
    // Configuration filters
    if (configurations && configurations !== 'null' && configurations !== 'any') {
      filters.configurations = String(configurations);
    }
    if (constructionStatus && constructionStatus !== 'null' && constructionStatus !== 'any') {
      filters.constructionStatus = String(constructionStatus);
    }
    
    // Get properties from database with the filters
    const properties = await mongodbStorage.getAllProperties(filters);
    
    console.log(`Retrieved ${properties.length} properties from database, now prioritizing by image quality...`);
    
    // If there are no properties, return empty array
    if (!properties || properties.length === 0) {
      return res.json({ properties: [] });
    }
    
    // We'll use a batch process to assess image quality for all properties
    // This is more efficient than making individual API calls for each property
    
    // Map to store image quality scores for each property
    const imageScoreMap = new Map<string, number>();
    const totalBatches = Math.min(10, Math.ceil(properties.length / 20)); // Process in batches of 20, max 10 batches

    console.log(`Processing ${properties.length} properties in ${totalBatches} batches for image quality assessment`);
    
    // Process just the first 200 properties (10 batches of 20) to keep response time reasonable
    const propertiesLimit = Math.min(properties.length, 200);
    const propertiesToProcess = properties.slice(0, propertiesLimit);
    
    // Assess image quality for each property in batches
    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const start = batchIndex * 20;
      const end = Math.min(start + 20, propertiesLimit);
      const batchProperties = propertiesToProcess.slice(start, end);
      
      console.log(`Processing batch ${batchIndex + 1}/${totalBatches} (${batchProperties.length} properties)`);
      
      // Process properties in this batch
      const batchPromises = batchProperties.map(async (property) => {
        try {
          // Use the property name and location to assess image quality
          const propertyName = property.projectName || property.name || '';
          const location = property.location || 'Hyderabad';
          
          if (!propertyName) {
            console.log(`Skipping property with ID ${(property._id as any).toString()} due to missing name`);
            return;
          }
          
          const qualityResult = await assessImageQuality(propertyName, location);
          
          // Store the score in our map using property ID as key
          const propertyKey = String((property._id as any).toString());
          if (propertyKey) {
            imageScoreMap.set(propertyKey, qualityResult.score);
          }
          
        } catch (error) {
          console.error(`Error assessing image quality for property ${(property._id as any).toString()}:`, error);
          // Default to zero score on error
          const propertyKey = String((property._id as any).toString());
          if (propertyKey) {
            imageScoreMap.set(propertyKey, 0);
          }
        }
      });
      
      // Wait for all properties in this batch to be processed
      await Promise.all(batchPromises);
    }
    
    console.log(`Completed image quality assessment for ${imageScoreMap.size} properties`);
    
    // Sort properties by image quality score (higher scores first)
    const sortedProperties = [...properties].sort((a, b) => {
      const propertyKeyA = String((a._id as any).toString());
      const propertyKeyB = String((b._id as any).toString());
      
      // Default scores to 0 if not found
      const scoreA = imageScoreMap.get(propertyKeyA) || 0;
      const scoreB = imageScoreMap.get(propertyKeyB) || 0;
      
      // Sort by score in descending order
      return scoreB - scoreA;
    });
    
    console.log(`Returning ${sortedProperties.length} properties sorted by image quality`);
    
    // Return the sorted properties
    res.json({
      properties: sortedProperties,
      total: sortedProperties.length,
      imageQualityEnabled: true
    });
  } catch (error) {
    console.error('Error fetching properties with prioritized images:', error);
    res.status(500).json({ 
      error: 'Failed to fetch properties with prioritized images', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}