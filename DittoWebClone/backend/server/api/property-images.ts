import { Request, Response } from 'express';
import { mongodbStorage } from '../mongodb-storage';
import { getMapImages } from './google-maps-images';

// Utility function to get base URL, can be configured via ENV for non-HTTP contexts
function getBaseUrl(): string {
  return process.env.BASE_URL || 'http://localhost:5001';
}

/**
 * Fetches and stores images for ALL properties found in MongoDB.
 */
export async function fetchAndStoreAllPropertyImagesSupabase(req: Request, res: Response) {
  try {
    console.log('Starting bulk image fetch and store operation for ALL MongoDB properties...');

    // Get all properties from MongoDB
    const allProperties = await mongodbStorage.getAllProperties();

    if (!allProperties || allProperties.length === 0) {
      return res.json({ message: "No properties found in MongoDB to process" });
    }

    console.log(`Found ${allProperties.length} properties to process from MongoDB.`);

    let processedCount = 0;
    let errorCount = 0;
    const baseUrl = getBaseUrl(); 
    console.log(`Using API Base URL: ${baseUrl}`);

    for (const property of allProperties) {
      if (!property.projectName || !property.location) {
        console.warn(`Skipping MongoDB property due to missing projectName or location:`, property);
        errorCount++;
        continue;
      }
      
      try {
        // Skip if property already has images
        if (property.images && property.images.length > 0) {
          console.log(`Skipping MongoDB property ${property.projectName} (ID: ${property._id}) - already has images:`, property.images);
          continue;
        }

        const propertyLocation = `${property.projectName}, ${property.location}`;
        console.log(`Processing MongoDB property: ${propertyLocation} (ID: ${property._id})`);
        
        const apiUrl = `${baseUrl}/api/map-images?propertyName=${encodeURIComponent(property.projectName)}&location=${encodeURIComponent(propertyLocation)}`;
        console.log(`Fetching map images from: ${apiUrl}`);

        const mapImagesResponse = await fetch(apiUrl);

        let imagesToStore: string[] = [];

        if (mapImagesResponse.ok) {
          const mapData = await mapImagesResponse.json();
          if (mapData.images && Array.isArray(mapData.images) && mapData.images.length > 0) {
            imagesToStore = mapData.images;
            console.log(`Found ${imagesToStore.length} images from /api/map-images for ${property.projectName}`);
          } else {
            console.log(`No images returned from /api/map-images for ${property.projectName}. Will use fallback.`);
          }
        } else {
           console.warn(`Failed to fetch from ${apiUrl}. Status: ${mapImagesResponse.status}. Will use fallback.`);
        }

        if (imagesToStore.length === 0) {
          console.log(`Using fallback images for ${property.projectName}`);
          const encodedLoc = encodeURIComponent(propertyLocation);
          imagesToStore = [
            `${baseUrl}/api/proxy-image?url=https://maps.googleapis.com/maps/api/staticmap?center=${encodedLoc}&zoom=12&size=600x400&maptype=roadmap&markers=color:red%7C${encodedLoc}`,
            `${baseUrl}/api/proxy-image?url=https://maps.googleapis.com/maps/api/staticmap?center=${encodedLoc}&zoom=14&size=600x400&maptype=satellite`,
            `${baseUrl}/api/proxy-image?url=https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${encodedLoc}&fov=90`
          ];
        }

        // Update property with the array of image URLs
        const updateSuccess = await mongodbStorage.updatePropertyImages((property._id as any).toString(), imagesToStore.slice(0, 3));

        if (!updateSuccess) {
          throw new Error(`Failed to update images field in MongoDB for property ID ${(property._id as any)}`);
        }

        processedCount++;
        console.log(`✅ [${processedCount}] Stored ${imagesToStore.length} images for MongoDB property: ${property.projectName} (ID: ${(property._id as any)})`);
        console.log(`Images stored:`, imagesToStore.slice(0, 3));
        await new Promise(resolve => setTimeout(resolve, 250)); // Slightly increased delay

      } catch (error) {
        errorCount++;
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`❌ Error processing MongoDB property ${property.projectName || `ID: ${(property._id as any)}`}:`, errorMessage, error);
      }
    }

    res.json({
      message: 'MongoDB bulk image fetch and store for ALL properties completed.',
      totalPropertiesFound: allProperties.length,
      processed: processedCount,
      errors: errorCount
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('CRITICAL Error in MongoDB bulk image fetch and store:', errorMessage, error);
    res.status(500).json({
      error: 'Failed to process images for MongoDB properties',
      details: errorMessage
    });
  }
}

export async function getImagesForProperty(id: string): Promise<string[]> {
  try {
    const property = await mongodbStorage.getPropertyById(id);
    return property?.images || [];
  } catch (error) {
    console.error(`Error fetching images for property ${id}:`, error);
    return [];
  }
}

/**
 * Fetches and stores images for a specific property (MongoDB).
 */
export async function fetchAndStorePropertyImagesDrizzle(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'Property ID is required' });
    }

    const property = await mongodbStorage.getPropertyById(id);

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Only fetch images if we have a valid property name
    if (!property.projectName && !property.ProjectName) {
      return res.status(400).json({ 
        error: 'Property name is required for image fetching',
        propertyName: property.projectName || property.ProjectName
      });
    }

    // Get images from Google Maps API
    const propertyName = property.projectName || property.ProjectName;
    const location = property.location || property.Area || 'Hyderabad';
    
    if (!propertyName || !location) {
      return res.status(400).json({ 
        error: 'Property name and location are required for image fetching',
        propertyName: propertyName,
        location: location
      });
    }
    
    const images = await getMapImages(propertyName, location, 3);

    if (images.length === 0) {
      return res.status(404).json({ 
        error: 'No images found for this property',
        propertyName: propertyName,
        location: location
      });
    }

    // Update property with new images
    const updateSuccess = await mongodbStorage.updatePropertyImages(id, images);

    if (!updateSuccess) {
      return res.status(500).json({ error: 'Failed to update images in database' });
    }

    res.json({
      success: true,
      message: 'Images fetched and stored successfully',
      images: images,
      propertyId: id
    });

  } catch (error) {
    console.error('Error in fetchAndStorePropertyImagesDrizzle:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Bulk fetch and store images for multiple properties (MongoDB).
 */
export async function bulkFetchAndStoreImagesDrizzle(req: Request, res: Response) {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ error: 'Property IDs array is required' });
    }

    console.log(`Starting bulk image fetch for ${ids.length} properties`);

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (const id of ids) {
      try {
        const property = await mongodbStorage.getPropertyById(id);
        
        if (!property) {
          results.push({ id, success: false, error: 'Property not found' });
          errorCount++;
          continue;
        }

        // Only fetch images if we have a valid property name
        if (!property.projectName && !property.ProjectName) {
          results.push({ id, success: false, error: 'Property name is required for image fetching' });
          errorCount++;
          continue;
        }

        const propertyName = property.projectName || property.ProjectName;
        const location = property.location || property.Area || 'Hyderabad';
        
        if (!propertyName || !location) {
          results.push({ id, success: false, error: 'Property name and location are required for image fetching' });
          errorCount++;
          continue;
        }
        
        const images = await getMapImages(propertyName, location, 3);

        if (images.length > 0) {
          // Update property with new images
          const updateSuccess = await mongodbStorage.updatePropertyImages(id, images);
          
          if (updateSuccess) {
            results.push({ id, success: true, imagesCount: images.length });
            successCount++;
          } else {
            results.push({ id, success: false, error: 'Failed to update images' });
            errorCount++;
          }
        } else {
          results.push({ id, success: false, error: 'No images found' });
          errorCount++;
        }

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.push({ id, success: false, error: errorMessage });
        errorCount++;
      }
    }

    return res.json({
      success: true,
      message: 'Bulk image fetch completed',
      total: ids.length,
      successful: successCount,
      errors: errorCount,
      results
    });

  } catch (error) {
    console.error('Error in bulkFetchAndStoreImagesDrizzle:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get images for a specific property (MongoDB).
 */
export async function getPropertyImagesDrizzle(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'Property ID is required' });
    }

    const property = await mongodbStorage.getPropertyById(id);

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    res.json({
      propertyId: id,
      images: property.images || [],
      count: property.images ? property.images.length : 0
    });

  } catch (error) {
    console.error('Error in getPropertyImagesDrizzle:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get image statistics (MongoDB).
 */
export async function getImageStatsDrizzle(req: Request, res: Response) {
  try {
    const allProperties = await mongodbStorage.getAllProperties();
    
    const stats = {
      totalProperties: allProperties.length,
      propertiesWithImages: 0,
      propertiesWithoutImages: 0,
      totalImages: 0,
      averageImagesPerProperty: 0
    };

    for (const property of allProperties) {
      if (property.images && property.images.length > 0) {
        stats.propertiesWithImages++;
        stats.totalImages += property.images.length;
      } else {
        stats.propertiesWithoutImages++;
      }
    }

    stats.averageImagesPerProperty = stats.propertiesWithImages > 0 
      ? Math.round(stats.totalImages / stats.propertiesWithImages * 100) / 100 
      : 0;

    res.json(stats);

  } catch (error) {
    console.error('Error in getImageStatsDrizzle:', error);
    res.status(500).json({
      error: 'Failed to get image statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export async function refreshAllPropertyImages() {
  try {
    console.log('🔄 Starting refresh of all property images...');
    
    const baseUrl = getBaseUrl();
    const allProperties = await mongodbStorage.getAllProperties();
    console.log(`📊 Found ${allProperties.length} properties to process`);
    
    let processedCount = 0;
    let errorCount = 0;
    
    for (const property of allProperties) {
      if (!property.projectName || !property.location) {
        console.warn(`Skipping MongoDB property due to missing projectName or location:`, property);
        errorCount++;
        continue;
      }
      
      // Skip if property already has images
      if (property.images && property.images.length > 0) {
        console.log(`Skipping MongoDB property ${property.projectName} (ID: ${property._id}) - already has images:`, property.images);
        continue;
      }

      const propertyLocation = `${property.projectName}, ${property.location}`;
      console.log(`Processing MongoDB property: ${propertyLocation} (ID: ${property._id})`);
      
      const apiUrl = `${baseUrl}/api/map-images?propertyName=${encodeURIComponent(property.projectName)}&location=${encodeURIComponent(propertyLocation)}`;
      
      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const images = data.images || [];
        
        if (images.length > 0) {
          // Store only the first 3 images
          const imagesToStore = images.slice(0, 3);
          console.log(`Found ${images.length} images for ${propertyLocation}, storing ${imagesToStore.length}`);
          
          // Update property with the array of image URLs
          const updateSuccess = await mongodbStorage.updatePropertyImages((property._id as any).toString(), imagesToStore.slice(0, 3));

          if (!updateSuccess) {
            throw new Error(`Failed to update images field in MongoDB for property ID ${(property._id as any)}`);
          }

          processedCount++;
          console.log(`✅ [${processedCount}] Stored ${imagesToStore.length} images for MongoDB property: ${property.projectName} (ID: ${(property._id as any)})`);
          console.log(`Images stored:`, imagesToStore.slice(0, 3));
          await new Promise(resolve => setTimeout(resolve, 250)); // Slightly increased delay
        } else {
          console.log(`❌ No images found for ${propertyLocation} (ID: ${(property._id as any)})`);
          errorCount++;
        }
      } catch (error) {
        errorCount++;
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`❌ Error processing MongoDB property ${property.projectName || `ID: ${(property._id as any)}`}:`, errorMessage, error);
      }
    }
    
    console.log(`🎉 Image refresh completed! Processed: ${processedCount}, Errors: ${errorCount}`);
    return { processed: processedCount, errors: errorCount };
    
  } catch (error) {
    console.error('❌ Error in refreshAllPropertyImages:', error);
    throw error;
  }
}

export async function getPropertyImages(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'Property ID is required' });
    }
    
    const property = await mongodbStorage.getPropertyById(id);
    
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    
    // If property has no images, try to fetch them
    if (!property.images || property.images.length === 0) {
      // Only fetch images if we have a valid property name
      const propertyName = property.projectName || property.ProjectName;
      const location = property.location || property.Area || 'Hyderabad';
      
      if (propertyName && propertyName.trim() !== '' && location && location.trim() !== '') {
        const images = await getMapImages(propertyName, location, 3);
        
        if (images && images.length > 0) {
          const imagesToStore = images.slice(0, 3);
          const updateSuccess = await mongodbStorage.updatePropertyImages(id, imagesToStore);
          
          if (updateSuccess) {
            return res.json({
              images: imagesToStore,
              source: 'google_maps',
              cached: false
            });
          }
        }
      } else {
        console.log(`Skipping image fetch for property with invalid name: ${property.projectName || property.ProjectName}`);
      }
    }
    
    return res.json({
      images: property.images || [],
      source: 'database',
      cached: true
    });
    
  } catch (error) {
    console.error('Error in getPropertyImages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function bulkRefreshImages(req: Request, res: Response) {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ error: 'Property IDs array is required' });
    }
    
    console.log(`Starting bulk image fetch for ${ids.length} properties`);
    
    const results = [];
    let successCount = 0;
    let errorCount = 0;
    
    for (const id of ids) {
      try {
        const property = await mongodbStorage.getPropertyById(id);
        
        if (!property) {
          results.push({ id, success: false, error: 'Property not found' });
          errorCount++;
          continue;
        }
        
        // Only fetch images if we have a valid property name
        if (!property.projectName && !property.ProjectName) {
          results.push({ id, success: false, error: 'Property name is required for image fetching' });
          errorCount++;
          continue;
        }
        
        const propertyName = property.projectName || property.ProjectName;
        const location = property.location || property.Area || 'Hyderabad';
        
        if (!propertyName || !location) {
          results.push({ id, success: false, error: 'Property name and location are required for image fetching' });
          errorCount++;
          continue;
        }
        
        const images = await getMapImages(propertyName, location, 3);
        
        if (images && images.length > 0) {
          const imagesToStore = images.slice(0, 3);
          const updateSuccess = await mongodbStorage.updatePropertyImages(id, imagesToStore);
          
          if (updateSuccess) {
            results.push({ id, success: true, imagesCount: images.length });
            successCount++;
          } else {
            results.push({ id, success: false, error: 'Failed to update images' });
            errorCount++;
          }
        } else {
          results.push({ id, success: false, error: 'No images found' });
          errorCount++;
        }
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.push({ id, success: false, error: errorMessage });
        errorCount++;
      }
    }
    
    return res.json({
      results,
      summary: {
        total: ids.length,
        success: successCount,
        errors: errorCount
      }
    });
    
  } catch (error) {
    console.error('Error in bulkRefreshImages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function refreshPropertyImages(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'Property ID is required' });
    }
    
    const property = await mongodbStorage.getPropertyById(id);
    
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    
    // Only fetch images if we have a valid property name
    if (!property.projectName && !property.ProjectName) {
      return res.status(400).json({ 
        error: 'Property name is required for image fetching',
        propertyName: property.projectName || property.ProjectName
      });
    }
    
    const propertyName = property.projectName || property.ProjectName;
    const location = property.location || property.Area || 'Hyderabad';
    
    if (!propertyName || !location) {
      return res.status(400).json({ 
        error: 'Property name and location are required for image fetching',
        propertyName: propertyName,
        location: location
      });
    }
    
    const images = await getMapImages(propertyName, location, 3);
    
    if (images && images.length > 0) {
      const imagesToStore = images.slice(0, 3);
      const updateSuccess = await mongodbStorage.updatePropertyImages(id, imagesToStore);
      
      if (updateSuccess) {
        return res.json({
          success: true,
          images: imagesToStore,
          id: id
        });
      } else {
        return res.status(500).json({ error: 'Failed to update images in database' });
      }
    } else {
      return res.json({
        success: false,
        message: 'No images found for this property',
        id: id
      });
    }
    
  } catch (error) {
    console.error('Error in refreshPropertyImages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}