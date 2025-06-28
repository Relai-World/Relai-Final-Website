import { Request, Response } from 'express';
import { getMapImages } from './google-maps-images';
import { Property, IProperty } from '../../shared/mongodb-schemas';
import fs from 'fs';
import path from 'path';

export async function getPropertyById(req: Request, res: Response) {
  try {
    // Disable caching to ensure fresh data is always sent
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    const { id } = req.params;
    console.log(`\n[Property ID: ${id}] Starting property fetch...`);
    
    // Validate ID format
    if (!id || id.trim() === '') {
      console.log('Invalid property ID provided');
      return res.status(400).json({ error: 'Invalid property ID' });
    }
    
    // Fetch specific property by ID from MongoDB
    const property = await Property.findById(id).lean() as IProperty | null;
    
    if (!property) {
      console.log(`No property found with ID: ${id}`);
      return res.status(404).json({ error: 'Property not found' });
    }
    
    console.log(`[Property ID: ${id}] Found property: ${property.projectName || property.ProjectName}`);
    console.log(`[Property ID: ${id}] Configuration details:`, property.configurationDetails);
    console.log(`[Property ID: ${id}] Images count:`, property.images?.length || 0);

    // Process images - ensure they exist and are accessible
    let images = property.images || [];
    
    // If no images in database, try to fetch from Google Maps
    if (!images || images.length === 0) {
      try {
        const propertyName = property.projectName || property.ProjectName;
        const location = property.location || property.Area || 'Hyderabad';
        
        if (propertyName && propertyName.trim() !== '') {
          console.log(`[Property ID: ${id}] Fetching images for: ${propertyName} in ${location}`);
          const mapImages = await getMapImages(propertyName, location, 5, false);
          if (mapImages && mapImages.length > 0) {
            images = mapImages;
            console.log(`[Property ID: ${id}] Found ${images.length} images from Google Maps`);
          }
        }
      } catch (imageError) {
        console.error(`[Property ID: ${id}] Error fetching images:`, imageError);
      }
    }

    // Validate and format image URLs
    const validatedImages = [];
    for (const imageUrl of images) {
      try {
        let formattedUrl = imageUrl;
        
        // If it's already a full URL, return as is
        if (imageUrl.startsWith('http')) {
          formattedUrl = imageUrl;
        }
        // If it's a relative path starting with /, return as is
        else if (imageUrl.startsWith('/')) {
          formattedUrl = imageUrl;
        }
        // If it's a relative path without /, add /
        else if (!imageUrl.startsWith('/')) {
          formattedUrl = `/${imageUrl}`;
        }
        
        // For local property images, check if file exists
        if (formattedUrl.startsWith('/property_images/')) {
          const imagePath = path.join(process.cwd(), 'public', formattedUrl);
          if (fs.existsSync(imagePath)) {
            validatedImages.push(formattedUrl);
            console.log(`[Property ID: ${id}] ✅ Validated image: ${formattedUrl}`);
          } else {
            console.log(`[Property ID: ${id}] ❌ Image file not found: ${imagePath}`);
          }
        } else {
          // For external URLs, just add them
          validatedImages.push(formattedUrl);
          console.log(`[Property ID: ${id}] ✅ Added external image: ${formattedUrl}`);
        }
      } catch (error) {
        console.error(`[Property ID: ${id}] Error validating image ${imageUrl}:`, error);
      }
    }

    // Ensure configurations are properly formatted
    let configurations = property.configurationDetails || property.configurations || [];
    
    // If configurations is a string, try to parse it
    if (typeof configurations === 'string') {
      try {
        configurations = JSON.parse(configurations);
      } catch (error) {
        console.log(`[Property ID: ${id}] Could not parse configurations string:`, configurations);
        configurations = [];
      }
    }
    
    // Ensure configurations is an array
    if (!Array.isArray(configurations)) {
      configurations = [];
    }

    // Return the response in the exact format requested
    const response = {
      _id: {
        $oid: (property._id as any).toString()
      },
      RERA_Number: property.RERA_Number || property.reraNumber || '',
      ProjectName: property.ProjectName || property.projectName || '',
      BuilderName: property.BuilderName || property.developerName || property.builder || '',
      Area: property.Area || property.location || '',
      Possession_date: property.Possession_date || property.possessionDate || property.possession || '',
      Price_per_sft: property.Price_per_sft || property.pricePerSqft || 0,
      configurations: configurations,
      images: validatedImages
    };
    
    console.log(`[Property ID: ${id}] 🎉 Successfully returning property data in requested format`);
    console.log(`[Property ID: ${id}] Configurations count:`, configurations.length);
    console.log(`[Property ID: ${id}] Images count:`, validatedImages.length);
    console.log(`[Property ID: ${id}] Image URLs:`, validatedImages);
    console.log(`[Property ID: ${id}] Response structure:`, {
      hasId: !!response._id,
      hasRERA: !!response.RERA_Number,
      hasProjectName: !!response.ProjectName,
      hasBuilderName: !!response.BuilderName,
      hasArea: !!response.Area,
      hasPossessionDate: !!response.Possession_date,
      hasPrice: !!response.Price_per_sft,
      hasConfigurations: Array.isArray(response.configurations),
      hasImages: Array.isArray(response.images)
    });
    
    res.json({ property: response });
    
  } catch (error: any) {
    console.error('Error fetching property by ID:', error);
    res.status(500).json({ 
      error: 'Failed to fetch property',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}