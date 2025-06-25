import { Request, Response } from 'express';
import { googleApiLimiter } from '../utils/google-api-rate-limiter';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_API_KEY;

interface GooglePlaceResult {
  place_id: string;
  name: string;
  rating?: number;
  user_ratings_total?: number;
  formatted_address?: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

interface PropertyRatingResult {
  projectName: string;
  builderName: string;
  location: string;
  googleRating?: number;
  googleReviews?: number;
  googlePlaceId?: string;
  status: 'success' | 'not_found' | 'error';
}

// Search for a property on Google Places and get its rating
async function getPropertyGoogleRating(projectName: string, location: string): Promise<PropertyRatingResult> {
  if (!GOOGLE_MAPS_API_KEY) {
    return {
      projectName,
      builderName: '',
      location,
      status: 'error'
    };
  }

  try {
    // Create search query with property name and location
    const searchQuery = `${projectName} ${location} Hyderabad Telangana apartment building`;
    console.log(`🔍 Searching Google Places for: ${searchQuery}`);
    
    const response = await googleApiLimiter.addToQueue(async () => {
      return await fetch(
        `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${GOOGLE_MAPS_API_KEY}`
      );
    });
    
    if (!response.ok) {
      console.error(`Google Places API error: ${response.status}`);
      return {
        projectName,
        builderName: '',
        location,
        status: 'error'
      };
    }
    
    const data = await response.json();
    
    if (data.status === 'OK' && data.results.length > 0) {
      const place = data.results[0] as GooglePlaceResult;
      
      console.log(`✓ Found ${projectName}: Rating ${place.rating || 'N/A'} (${place.user_ratings_total || 0} reviews)`);
      
      return {
        projectName,
        builderName: '',
        location,
        googleRating: place.rating,
        googleReviews: place.user_ratings_total,
        googlePlaceId: place.place_id,
        status: 'success'
      };
    } else {
      console.log(`⚠ No Google Places result for ${projectName}`);
      return {
        projectName,
        builderName: '',
        location,
        status: 'not_found'
      };
    }
  } catch (error) {
    console.error(`Error fetching Google rating for ${projectName}:`, error);
    return {
      projectName,
      builderName: '',
      location,
      status: 'error'
    };
  }
}

// Fetch Google Places ratings for multiple properties
export async function fetchGooglePlacesRatings(req: Request, res: Response) {
  try {
    console.log('🗺️ Starting Google Places ratings fetch...');
    
    // Get properties from query or fetch from storage
    const { properties } = req.body;
    
    if (!properties || !Array.isArray(properties)) {
      return res.status(400).json({
        success: false,
        error: 'Properties array is required in request body'
      });
    }
    
    console.log(`📍 Fetching Google ratings for ${properties.length} properties`);
    
    const results: PropertyRatingResult[] = [];
    let successCount = 0;
    let notFoundCount = 0;
    let errorCount = 0;
    
    // Process properties in batches to respect API rate limits
    const batchSize = 5;
    const batches = Math.ceil(properties.length / batchSize);
    
    for (let batchIndex = 0; batchIndex < batches; batchIndex++) {
      const start = batchIndex * batchSize;
      const end = Math.min(start + batchSize, properties.length);
      const batch = properties.slice(start, end);
      
      console.log(`Processing batch ${batchIndex + 1}/${batches} (properties ${start + 1} to ${end})`);
      
      for (const property of batch) {
        const result = await getPropertyGoogleRating(property.projectName, property.location);
        results.push(result);
        
        if (result.status === 'success') successCount++;
        else if (result.status === 'not_found') notFoundCount++;
        else errorCount++;
        
        // Add delay between requests to respect API rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Longer delay between batches
      if (batchIndex < batches - 1) {
        console.log('⏳ Waiting before next batch...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log(`🎯 Google Places rating fetch complete: ${successCount} successful, ${notFoundCount} not found, ${errorCount} errors`);
    
    // Save results to cache file
    try {
      const fs = require('fs');
      const cacheFile = 'google-places-ratings-cache.json';
      fs.writeFileSync(cacheFile, JSON.stringify(results, null, 2));
      console.log(`💾 Saved ${results.length} Google Places ratings to cache`);
    } catch (saveError) {
      console.error('Error saving Google Places ratings cache:', saveError);
    }
    
    res.json({
      success: true,
      message: `Fetched Google Places ratings for ${successCount} properties`,
      results: results,
      stats: {
        total: properties.length,
        successful: successCount,
        notFound: notFoundCount,
        errors: errorCount,
        batches: batches
      }
    });
    
  } catch (error) {
    console.error('Error in Google Places ratings fetch:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch Google Places ratings',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Get cached Google Places ratings
export async function getCachedGoogleRatings(req: Request, res: Response) {
  try {
    const fs = require('fs');
    const cacheFile = 'google-places-ratings-cache.json';
    
    if (fs.existsSync(cacheFile)) {
      const data = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
      res.json({
        success: true,
        ratings: data,
        count: data.length
      });
    } else {
      res.json({
        success: true,
        ratings: [],
        count: 0,
        message: 'No cached ratings found'
      });
    }
  } catch (error) {
    console.error('Error reading Google Places ratings cache:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to read cached ratings'
    });
  }
}