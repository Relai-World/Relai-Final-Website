import { Request, Response } from 'express';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

// Google Custom Search Engine ID
const SEARCH_ENGINE_ID = '1451a878666fd4dc0';

// Use the provided API key directly
const API_KEY = 'd8c12be0a1e2754d044b6c6b0a606e62c4a35af4';

// Path to cache file
const CACHE_FILE_PATH = path.join(process.cwd(), 'image-search-cache.json');

// Cache expiration time in milliseconds (7 days)
const CACHE_EXPIRATION = 7 * 24 * 60 * 60 * 1000;

// Stats for monitoring usage
const stats = {
  apiCalls: 0,
  cacheHits: 0,
  totalRequests: 0
};

// Load the cache from disk
function loadCache(): Record<string, { timestamp: number, images: string[] }> {
  try {
    if (fs.existsSync(CACHE_FILE_PATH)) {
      const cacheData = fs.readFileSync(CACHE_FILE_PATH, 'utf-8');
      return JSON.parse(cacheData);
    }
  } catch (error) {
    console.error('Error loading image search cache:', error);
  }
  return {};
}

// Save the cache to disk
function saveCache(cache: Record<string, { timestamp: number, images: string[] }>): void {
  try {
    fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(cache, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving image search cache:', error);
  }
}

// In-memory cache
let imageSearchCache: Record<string, { timestamp: number, images: string[] }> = loadCache();

// Search for images using Google Custom Search API
export async function searchImages(query: string, num: number = 5, forceRefresh: boolean = false): Promise<string[]> {
  try {
    stats.totalRequests++;
    console.log(`Searching images for: ${query}`);
    
    // Normalize the query to create a consistent cache key
    const normalizedQuery = query.toLowerCase().trim();
    const cacheKey = `${normalizedQuery}|${num}`;
    
    // Check cache first if not forcing refresh
    if (!forceRefresh && 
        imageSearchCache[cacheKey] && 
        imageSearchCache[cacheKey].images.length > 0 &&
        Date.now() - imageSearchCache[cacheKey].timestamp < CACHE_EXPIRATION) {
      
      console.log(`Using cached image results for query: "${query}" (${imageSearchCache[cacheKey].images.length} images)`);
      stats.cacheHits++;
      return imageSearchCache[cacheKey].images;
    }
    
    stats.apiCalls++;
    
    // Clean the API_KEY - removing any whitespace or tabs that might have been added
    const cleanApiKey = API_KEY.trim();
    
    // Use axios with explicit parameters instead of building URL string
    const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: {
        key: cleanApiKey,
        cx: SEARCH_ENGINE_ID,
        q: `${query} real estate property building`,
        searchType: 'image',
        num: num
      }
    });
    
    // Log full response data for debugging
    console.log('API Response Status:', response.status);
    
    // Extract image URLs from response
    if (response.data && response.data.items && response.data.items.length > 0) {
      const imageUrls = response.data.items.map((item: any) => item.link);
      console.log(`Found ${imageUrls.length} images for query: ${query}`);
      
      // Store in cache
      imageSearchCache[cacheKey] = {
        timestamp: Date.now(),
        images: imageUrls
      };
      
      // Save cache to disk
      saveCache(imageSearchCache);
      
      return imageUrls;
    } else {
      console.log(`No images found for query: ${query}`);
      return [];
    }
  } catch (error: any) {
    console.error('Error searching images:', error.message);
    // Log detailed error information for debugging
    if (error.response) {
      console.error('Google API Error Response:', error.response.status);
      console.error('Error Details:', error.response.data);
    }
    return [];
  }
}

// API handler for searching images
export async function searchImagesHandler(req: Request, res: Response) {
  try {
    const { query, num, refresh } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }
    
    const forceRefresh = refresh === 'true';
    
    const imageUrls = await searchImages(
      String(query), 
      num ? parseInt(String(num)) : 5,
      forceRefresh
    );
    
    // Calculate cache status
    const normalizedQuery = String(query).toLowerCase().trim();
    const cacheKey = `${normalizedQuery}|${num ? parseInt(String(num)) : 5}`;
    const fromCache = !forceRefresh && 
                      imageSearchCache[cacheKey] && 
                      imageSearchCache[cacheKey].images.length > 0 &&
                      Date.now() - imageSearchCache[cacheKey].timestamp < CACHE_EXPIRATION;
    
    res.json({ 
      images: imageUrls,
      cached: fromCache,
      count: imageUrls.length
    });
  } catch (error: any) {
    console.error('Error in image search handler:', error);
    res.status(500).json({ 
      error: 'Failed to search images', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

// Get image search cache statistics
export async function imageSearchCacheStatsHandler(req: Request, res: Response) {
  try {
    const cacheEntries = Object.keys(imageSearchCache).length;
    const totalImages = Object.values(imageSearchCache).reduce(
      (total, entry) => total + entry.images.length, 0
    );
    
    // Calculate savings
    const totalRequests = stats.apiCalls + stats.cacheHits;
    const apiSavingsPercent = totalRequests > 0 ? Math.round((stats.cacheHits / totalRequests) * 100) : 0;
    
    // Find expired entries
    const now = Date.now();
    const expiredEntries = Object.entries(imageSearchCache).filter(
      ([_, entry]) => now - entry.timestamp > CACHE_EXPIRATION
    ).length;
    
    res.json({
      cache: {
        entriesInCache: cacheEntries,
        expiredEntries,
        totalImagesInCache: totalImages,
        cacheFilePath: CACHE_FILE_PATH
      },
      usage: {
        apiCalls: stats.apiCalls,
        cacheHits: stats.cacheHits,
        totalRequests: stats.totalRequests
      },
      savings: {
        apiSavingsPercent
      }
    });
  } catch (error: any) {
    console.error('Error getting cache stats:', error);
    res.status(500).json({ error: 'Failed to get cache statistics' });
  }
}