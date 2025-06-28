import { Request, Response } from 'express';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { getFallbackPropertyImages } from './property-fallback-images';
import { googleApiLimiter } from '../utils/google-api-rate-limiter';

// Interface for image quality score
export interface ImageQualityResult {
  propertyName: string;
  location: string;
  score: number;
  imageCount: number;
  hasFallbackOnly: boolean;
}

/**
 * Get Google Maps API key from various sources with fallback
 */
function getGoogleMapsApiKey(): string {
  // First try to get GOOGLE_API_KEY from environment variables (new name)
  let apiKey = process.env.GOOGLE_API_KEY;
  
  // If not found, try the old environment variable name
  if (!apiKey) {
    apiKey = process.env.GOOGLE_API_KEY;
  }
  
  // If still not found, try to read from .env file
  if (!apiKey) {
    try {
      const envFilePath = path.join(process.cwd(), '.env');
      if (fs.existsSync(envFilePath)) {
        const envFile = fs.readFileSync(envFilePath, 'utf8');
        
        // Try with new variable name first
        let match = envFile.match(/GOOGLE_API_KEY=([^\s]+)/);
        if (match && match[1]) {
          apiKey = match[1];
          console.log('Retrieved Maps API key from .env file for map images');
        } else {
          // Try with old variable name
          match = envFile.match(/GOOGLE_API_KEY=([^\s]+)/);
          if (match && match[1]) {
            apiKey = match[1];
            console.log('Retrieved Maps API key from .env file for map images (old variable name)');
          }
        }
      }
    } catch (err) {
      console.warn('Could not read .env file for map images:', err);
    }
  }
  
  // If still not found, log an error - don't use a hardcoded key
  if (!apiKey) {
    console.error('No Google Maps API key found. Maps functionality will be limited.');
    apiKey = '';
  }
  
  return apiKey;
}

// Get Google Maps API Key with fallback
let MAPS_API_KEY = getGoogleMapsApiKey();
console.log(`MAPS_API_KEY for images: ${MAPS_API_KEY ? 'Found (length: ' + MAPS_API_KEY.length + ')' : 'Not found'}`);

// Path to cache file
const CACHE_FILE_PATH = path.join(process.cwd(), 'property-images-cache.json');

// Load the cache file
function loadImageCache(): Record<string, string[]> {
  try {
    if (fs.existsSync(CACHE_FILE_PATH)) {
      const cacheData = fs.readFileSync(CACHE_FILE_PATH, 'utf-8');
      return JSON.parse(cacheData);
    }
  } catch (error) {
    console.error('Error loading image cache:', error);
  }
  return {};
}

// Save the cache file
function saveImageCache(cache: Record<string, string[]>): void {
  try {
    fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(cache, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving image cache:', error);
  }
}

// In-memory cache for faster access
let imageCache: Record<string, string[]> = loadImageCache();

// Track API and fallback usage statistics
const stats = {
  apiCalls: 0,
  fallbackUsage: 0,
  cacheHits: 0
};

// Ensure the directory for storing property images exists
const IMAGES_DIR = path.join(process.cwd(), 'public', 'property_images');
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

/**
 * Gets images for a property using Google Maps Platform APIs
 * @param ProjectName Name of the property
 * @param location Location of the property (e.g., "Hyderabad")
 * @param count Number of images to return
 * @param forceRefresh Force refresh the cache for this property
 * @returns Array of image URLs
 */
export async function getMapImages(
  ProjectName: string, 
  location: string = 'Hyderabad',
  count: number = 3,
  forceRefresh: boolean = false
): Promise<string[]> {
  try {
    // Validate inputs to prevent undefined.trim() errors
    if (!ProjectName || typeof ProjectName !== 'string' || ProjectName.trim() === '') {
      console.log('Invalid ProjectName provided to getMapImages:', ProjectName);
      return [];
    }
    
    if (!location || typeof location !== 'string' || location.trim() === '') {
      console.log('Invalid location provided to getMapImages:', location);
      return [];
    }
    
    // Generate a cache key based on project name and location
    const cacheKey = `${ProjectName.trim().toLowerCase()}|${location.trim().toLowerCase()}`;
    
    // Check if we already have cached images for this project
    if (!forceRefresh && imageCache[cacheKey] && imageCache[cacheKey].length > 0) {
      console.log(`Using cached images for project: ${ProjectName} (${imageCache[cacheKey].length} images)`);
      stats.cacheHits++;
      return imageCache[cacheKey];
    }
    
    console.log(`Getting map images for project: ${ProjectName} in ${location}`);
    stats.apiCalls++;
    
    // Format search query for better results
    const query = encodeURIComponent(`${ProjectName} ${location}`);
    
    // Try to get images from Google Places API first
    const placeImages = await getPlacePhotos(query, count);
    
    if (placeImages.length > 0) {
      console.log(`Found ${placeImages.length} place photos for "${ProjectName}"`);
      
      // Save to cache
      imageCache[cacheKey] = placeImages;
      saveImageCache(imageCache);
      
      return placeImages;
    }
    
    // If no place photos, try Street View
    const streetViewImage = await getStreetViewImage(ProjectName, location);
    
    if (streetViewImage) {
      console.log(`Found street view image for "${ProjectName}"`);
      
      // Save to cache
      imageCache[cacheKey] = [streetViewImage];
      saveImageCache(imageCache);
      
      return [streetViewImage];
    }
    
    console.log(`No map images found for project: ${ProjectName}`);
    return [];
  } catch (error) {
    console.error(`Error getting map images:`, error);
    return [];
  }
}

/**
 * Get photos for a place from Google Places API
 * @param query Search query
 * @param maxResults Maximum number of results to return
 * @returns Array of image URLs
 */
async function getPlacePhotos(query: string, maxResults: number = 3): Promise<string[]> {
  try {
    if (!MAPS_API_KEY) {
      console.log('No API key available for Google Maps');
      return [];
    }
    
    // Step 1: Find the place ID using Place Search API with rate limiting
    const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${query}&inputtype=textquery&fields=photos,place_id&key=${MAPS_API_KEY}`;
    
    const searchResponse = await googleApiLimiter.addToQueue(async () => {
      return await axios.get(searchUrl);
    });
    
    
    if (searchResponse.data.status !== 'OK' || 
        !searchResponse.data.candidates || 
        searchResponse.data.candidates.length === 0) {
      console.log(`No place found for query: ${query}`);
      return [];
    }
    
    const placeId = searchResponse.data.candidates[0].place_id;
    
    // Step 2: Get place details to get photo references with rate limiting
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=photos&key=${MAPS_API_KEY}`;
    
    const detailsResponse = await googleApiLimiter.addToQueue(async () => {
      return await axios.get(detailsUrl);
    });
    
    if (detailsResponse.data.status !== 'OK' || 
        !detailsResponse.data.result || 
        !detailsResponse.data.result.photos) {
      console.log(`No photos found for place: ${query}`);
      return [];
    }
    
    // Step 3: Get the actual photos using the photo references
    const photos = detailsResponse.data.result.photos.slice(0, maxResults);
    
    const photoUrls: string[] = [];
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      const photoReference = photo.photo_reference;
      const googleUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoReference}&key=${MAPS_API_KEY}`;
      
      try {
        // Sanitize filename
        const safeQuery = query.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const imageFileName = `${safeQuery}_${i}.jpg`;
        const imagePath = path.join(IMAGES_DIR, imageFileName);
        const publicImagePath = `/property_images/${imageFileName}`;

        // Check if image already exists
        if (!fs.existsSync(imagePath)) {
          // Download and save the image
          const imageResponse = await axios.get(googleUrl, { responseType: 'arraybuffer' });
          fs.writeFileSync(imagePath, imageResponse.data);
          console.log(`[MAPS DEBUG] Saved image to: ${imagePath}`);
        }
        
        photoUrls.push(publicImagePath);

      } catch (error) {
        console.error(`Error downloading photo for ${query}:`, error);
        // Fallback to Google URL if download fails to avoid breaking the image flow entirely
        photoUrls.push(`/api/proxy-image?url=${encodeURIComponent(googleUrl)}`);
      }
    }
    
    return photoUrls;
    
  } catch (error: any) {
    if (googleApiLimiter.handleRateLimitError(error)) {
      console.warn('Rate limit hit in Places API, backing off');
      return [];
    }
    console.error('[MAPS DEBUG] Error getting place photos:', error);
    return [];
  }
}

/**
 * Get Street View image for a location
 * @param ProjectName Name of the property
 * @param location Location of the property
 * @returns Street View image URL or null if not available
 */
async function getStreetViewImage(ProjectName: string, location: string): Promise<string | null> {
  try {
    console.log(`Getting street view for: ${ProjectName}`);
    
    // Use rate limiter for the API call
    const response = await googleApiLimiter.addToQueue(async () => {
      const url = `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${encodeURIComponent(`${ProjectName}, ${location}`)}&key=${MAPS_API_KEY}`;
      return await axios.get(url, { responseType: 'arraybuffer' });
    });

    if (response.status === 200 && response.data) {
      // Sanitize filename
      const safeName = ProjectName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const imageFileName = `streetview_${safeName}.jpg`;
      const imagePath = path.join(IMAGES_DIR, imageFileName);
      const publicImagePath = `/property_images/${imageFileName}`;

      // Save the image
      fs.writeFileSync(imagePath, response.data);
      console.log(`Saved street view image to ${imagePath}`);
      
      return publicImagePath;
    }
    
    return null;
  } catch (error: any) {
    if (googleApiLimiter.handleRateLimitError(error)) {
      console.warn('Rate limit hit in Street View API, backing off');
      return null;
    }
    console.error(`Error getting Street View image for ${ProjectName}:`, error);
    return null;
  }
}

/**
 * API handler for getting map images
 */
export async function mapImagesHandler(req: Request, res: Response) {
  try {
    const { ProjectName, location, count, refresh } = req.query;
    
    if (!ProjectName) {
      return res.status(400).json({ error: 'Project name parameter is required' });
    }

    // Check rate limiter status
    const limiterStatus = googleApiLimiter.getStatus();
    if (limiterStatus.queueLength > 50) {
      return res.status(429).json({
        error: 'System is currently processing many requests. Please try again later.',
        retryAfter: 60,
        cached: true
      });
    }
    
    // Check if we should force refresh the cache
    const forceRefresh = refresh === 'true';
    
    // Get cached or fresh images
    const images = await getMapImages(
      String(ProjectName),
      location ? String(location) : 'Hyderabad',
      count ? parseInt(String(count)) : 3,
      forceRefresh
    );
    
    // Add cache status to response
    const cacheKey = `${String(ProjectName).trim().toLowerCase()}|${(location ? String(location) : 'Hyderabad').trim().toLowerCase()}`;
    const fromCache = !forceRefresh && imageCache[cacheKey] && imageCache[cacheKey].length > 0;
    
    // Use fallback images if no images were found from API
    let finalImages = images;
    let usingFallback = false;
    
    if (finalImages.length === 0) {
      // Extract property type from the project name if possible
      // This is a simple heuristic - you might want to pass the actual property type
      let propertyType = 'default';
      const nameLower = String(ProjectName).toLowerCase();
      
      if (nameLower.includes('apartment') || nameLower.includes('flat')) {
        propertyType = 'apartment';
      } else if (nameLower.includes('villa')) {
        propertyType = 'villa';
      } else if (nameLower.includes('plot') || nameLower.includes('land')) {
        propertyType = 'plot';
      } else if (nameLower.includes('commercial') || nameLower.includes('office') || nameLower.includes('shop')) {
        propertyType = 'commercial';
      } else if (nameLower.includes('penthouse')) {
        propertyType = 'penthouse';
      }
      
      // Get fallback images
      finalImages = getFallbackPropertyImages(propertyType, count ? parseInt(String(count)) : 3);
      usingFallback = true;
      stats.fallbackUsage++;
      
      // Store fallback images in cache too
      imageCache[cacheKey] = finalImages;
      saveImageCache(imageCache);
      
      console.log(`Using fallback images of type "${propertyType}" for project: ${ProjectName}`);
    }
    
    res.json({
      images: finalImages,
      cached: fromCache,
      fallback: usingFallback,
      count: finalImages.length
    });
  } catch (error: any) {
    if (googleApiLimiter.handleRateLimitError(error)) {
      console.warn('Rate limit hit in map images handler, returning cached/fallback response');
      
      // Try to return fallback images when rate limited
      const { count } = req.query;
      const propertyType = 'default';
      const fallbackImages = getFallbackPropertyImages(propertyType, count ? parseInt(String(count)) : 3);
      
      return res.status(200).json({
        images: fallbackImages,
        cached: true,
        fallback: true,
        rateLimited: true,
        count: fallbackImages.length,
        message: 'Using cached images due to high demand'
      });
    }
    
    console.error('Error in map images handler:', error);
    res.status(500).json({ 
      error: 'Failed to get map images', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

/**
 * Assesses the image quality for a property
 * @param ProjectName The name of the property
 * @param location The location of the property
 * @returns A quality score from 0-10
 */
export async function assessImageQuality(ProjectName: string, location: string = 'Hyderabad'): Promise<ImageQualityResult> {
  try {
    // Default result with zero score
    const result: ImageQualityResult = {
      propertyName: ProjectName,
      location,
      score: 0,
      imageCount: 0,
      hasFallbackOnly: false
    };
    
    // Generate cache key for this property
    const cacheKey = `${ProjectName.trim().toLowerCase()}|${location.trim().toLowerCase()}`;
    
    // Check if we have images in the cache
    if (imageCache[cacheKey] && imageCache[cacheKey].length > 0) {
      const images = imageCache[cacheKey];
      result.imageCount = images.length;
      
      // Check if these are fallback images or not
      // Fallback images always use the proxy-image endpoint
      const firstImage = images[0] || '';
      const hasFallbackIndicator = firstImage.includes('fallback-images') || 
                                 (!firstImage.includes('googleapis.com') && 
                                  !firstImage.includes('place/photo') && 
                                  !firstImage.includes('streetview'));
      
      // Set fallback flag
      result.hasFallbackOnly = hasFallbackIndicator;
      
      // Calculate score based on image count and type
      if (hasFallbackIndicator) {
        // Fallback images get a minimal score
        result.score = 1;
      } else {
        // Real Google Maps images get a higher score
        // More images = higher score, max score is 10
        result.score = Math.min(10, images.length * 3); 
      }
    } else {
      // No cached images found
      result.score = 0;
      result.imageCount = 0;
      result.hasFallbackOnly = true;
    }
    
    return result;
  } catch (error) {
    console.error('Error assessing image quality:', error);
    return {
      propertyName: ProjectName,
      location,
      score: 0,
      imageCount: 0,
      hasFallbackOnly: true
    };
  }
}

/**
 * API handler for assessing image quality
 */
export async function assessImageQualityHandler(req: Request, res: Response) {
  try {
    const { ProjectName, location } = req.query;
    
    if (!ProjectName) {
      return res.status(400).json({ error: 'Project name parameter is required' });
    }
    
    const qualityResult = await assessImageQuality(
      String(ProjectName),
      location ? String(location) : 'Hyderabad'
    );
    
    res.json(qualityResult);
  } catch (error: any) {
    console.error('Error in assess image quality handler:', error);
    res.status(500).json({ 
      error: 'Failed to assess image quality', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

/**
 * Helper API to get cache statistics
 */
export async function imageCacheStatsHandler(req: Request, res: Response) {
  try {
    const cacheSize = Object.keys(imageCache).length;
    const totalImages = Object.values(imageCache).reduce((total, images) => total + images.length, 0);
    
    // Calculate savings statistics
    const totalRequests = stats.apiCalls + stats.cacheHits;
    const apiSavingsPercent = totalRequests > 0 ? Math.round((stats.cacheHits / totalRequests) * 100) : 0;
    const fallbackPercent = totalRequests > 0 ? Math.round((stats.fallbackUsage / totalRequests) * 100) : 0;
    
    res.json({
      cache: {
        propertiesInCache: cacheSize,
        totalImagesInCache: totalImages,
        cacheFilePath: CACHE_FILE_PATH
      },
      usage: {
        apiCalls: stats.apiCalls,
        cacheHits: stats.cacheHits,
        fallbackUsage: stats.fallbackUsage,
        totalRequests: totalRequests
      },
      savings: {
        apiSavingsPercent: apiSavingsPercent,
        fallbackPercent: fallbackPercent
      }
    });
  } catch (error: any) {
    console.error('Error getting cache stats:', error);
    res.status(500).json({ error: 'Failed to get cache statistics' });
  }
}