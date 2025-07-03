import { Request, Response } from 'express';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

// Path to cache file
const CACHE_FILE_PATH = path.join(process.cwd(), 'nearby-places-cache.json');

// Permanent caching - no expiration (lifetime caching)
// Setting an extremely large value (100 years) effectively makes it permanent
// We use a constant instead of removing expiration checks to maintain compatibility
const CACHE_EXPIRATION = 100 * 365 * 24 * 60 * 60 * 1000; // 100 years

// Stats for monitoring usage
const stats = {
  apiCalls: 0,
  cacheHits: 0,
  totalRequests: 0
};

// Load the cache from disk
function loadCache(): Record<string, { timestamp: number, data: NearbyPlacesResponse }> {
  try {
    if (fs.existsSync(CACHE_FILE_PATH)) {
      const cacheData = fs.readFileSync(CACHE_FILE_PATH, 'utf-8');
      return JSON.parse(cacheData);
    }
  } catch (error) {
    console.error('Error loading nearby places cache:', error);
  }
  return {};
}

// Save the cache to disk
function saveCache(cache: Record<string, { timestamp: number, data: NearbyPlacesResponse }>): void {
  try {
    fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(cache, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving nearby places cache:', error);
  }
}

// In-memory cache
let nearbyPlacesCache: Record<string, { timestamp: number, data: NearbyPlacesResponse }> = loadCache();

// Define search radii for different amenity types and transit points (in meters)
const SEARCH_RADIUS = 5000; // 5km basic search radius
const SEARCH_RADII = {
  standard: 5000,  // 5km for most amenities
  metro: 10000,    // 10km for metro stations (may be farther away)
  railway: 15000,  // 15km for railway stations (often outside city centers)
  highway: 25000   // 25km for ORR entries (Outer Ring Road covers large area)
};

interface PlaceDetail {
  name: string;
  distance: string;
  duration: string;
  rating?: number;
}

interface PlaceCategory {
  type: string;
  count: number;
  places: PlaceDetail[];
}

interface TransitInfo {
  name: string;
  distance: string;
  duration: string;
  type: string;
}

interface NearbyPlacesResponse {
  amenities: PlaceCategory[];
  transitPoints: TransitInfo[];
}

/**
 * Fetches detailed information about amenities within a certain radius of the property
 * 
 * @param apiKey Google Maps API key
 * @param lat Latitude of the property
 * @param lng Longitude of the property
 * @returns Promise resolving to detailed information about each type of place
 */
async function getNearbyAmenities(apiKey: string, lat: number, lng: number): Promise<PlaceCategory[]> {
  // Define more specific amenity types relevant to property buyers
  const amenityTypes = [
    { type: 'hospital', name: 'Hospitals', radius: SEARCH_RADIUS, minRating: 4.0, minReviews: 10 },
    { 
      type: 'shopping_mall', 
      name: 'Shopping Malls', 
      radius: SEARCH_RADIUS, 
      minRating: 4.0, 
      minReviews: 25,
      keyword: 'premium shopping mall multiplex' // For premium malls with multiplexes
    },
    { type: 'school', name: 'Schools', radius: SEARCH_RADIUS, minRating: 4.0, minReviews: 15 },
    { 
      type: 'restaurant|cafe', // Combined restaurants and cafes
      name: 'Restaurants', 
      radius: SEARCH_RADIUS, 
      minRating: 4.0, 
      minReviews: 30 
    },
    { 
      type: 'supermarket', 
      name: 'Supermarkets', 
      radius: SEARCH_RADIUS, 
      minRating: 4.2, 
      minReviews: 50 
    },
    { 
      type: 'electronics_store', 
      name: 'IT Companies', 
      radius: SEARCH_RADIUS, 
      minRating: 4.0, 
      minReviews: 10,
      keyword: 'tcs infosys tech company' // For multinational IT companies
    }
  ];

  const placeCategories: PlaceCategory[] = [] as PlaceCategory[];
  console.log(`Fetching nearby amenities within ${SEARCH_RADIUS}m of coordinates: ${lat}, ${lng}`);
  
  try {
    const location = `${lat},${lng}`;
    
    // Make requests for each place type with strict radius limits
    for (const amenity of amenityTypes) {
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json`;
      const params: any = {
        location,
        radius: amenity.radius, // Use the specific radius for this amenity type
        type: amenity.type,
        rankby: 'prominence', // Get the most prominent places first
        key: apiKey,
        // Don't limit the number of results
        pagetoken: null
      };
      
      // Add keyword parameter if specified for more specific searches
      if (amenity.keyword) {
        params.keyword = amenity.keyword;
      }
      
      const response = await axios.get(url, { params });
      
      if (response.data.status === 'ZERO_RESULTS') {
        console.log(`No ${amenity.name} found within ${amenity.radius}m radius`);
        placeCategories.push({
          type: amenity.name,
          count: 0,
          places: []
        });
        continue;
      }
      
      const places = response.data.results || [];
      console.log(`Found ${places.length} ${amenity.name} within ${amenity.radius}m radius`);
      
      // Filter by rating if needed and ensure they are truly within radius
      const detailedPlaces: PlaceDetail[] = [];
      
      for (const place of places) {
        // Calculate actual distance
        if (!place.geometry || !place.geometry.location) continue;
        
        const distanceInMeters = calculateDistance(
          lat, 
          lng, 
          place.geometry.location.lat, 
          place.geometry.location.lng
        );
        
        // Check if it's within the radius and meets rating and review count requirements
        const isWithinRadius = distanceInMeters <= amenity.radius;
        const meetsRatingRequirement = !amenity.minRating || 
                                      (place.rating && place.rating >= amenity.minRating);
        const meetsReviewsRequirement = !amenity.minReviews ||
                                      (place.user_ratings_total && place.user_ratings_total >= amenity.minReviews);
        
        if (isWithinRadius && meetsRatingRequirement && meetsReviewsRequirement) {
          // Get the travel time using Distance Matrix API
          const distanceUrl = `https://maps.googleapis.com/maps/api/distancematrix/json`;
          const origin = `${lat},${lng}`;
          const destination = `${place.geometry.location.lat},${place.geometry.location.lng}`;
          
          try {
            const distanceParams = {
              origins: origin,
              destinations: destination,
              mode: 'driving',
              key: apiKey
            };
            
            const distanceResponse = await axios.get(distanceUrl, { params: distanceParams });
            
            if (distanceResponse.data.rows && 
                distanceResponse.data.rows[0].elements && 
                distanceResponse.data.rows[0].elements[0].status === 'OK') {
              
              const element = distanceResponse.data.rows[0].elements[0];
              
              detailedPlaces.push({
                name: place.name,
                distance: element.distance.text,
                duration: element.duration.text,
                rating: place.rating
              });
            } else {
              // Fallback if Distance Matrix API doesn't return valid data
              const distanceInKm = (distanceInMeters / 1000).toFixed(1);
              detailedPlaces.push({
                name: place.name,
                distance: `${distanceInKm} km`,
                duration: 'Unknown',
                rating: place.rating
              });
            }
          } catch (error) {
            // Fallback if Distance Matrix API call fails
            const distanceInKm = (distanceInMeters / 1000).toFixed(1);
            detailedPlaces.push({
              name: place.name,
              distance: `${distanceInKm} km`,
              duration: 'Unknown',
              rating: place.rating
            });
          }
        }
      }
      
      // Sort places by distance
      detailedPlaces.sort((a, b) => {
        const distA = parseFloat(a.distance.replace(" km", ""));
        const distB = parseFloat(b.distance.replace(" km", ""));
        return distA - distB;
      });
      
      placeCategories.push({
        type: amenity.name,
        count: detailedPlaces.length,
        places: detailedPlaces
      });
    }
    
    return placeCategories;
  } catch (error) {
    console.error('Error fetching nearby amenities:', error);
    return amenityTypes.map(amenity => ({ 
      type: amenity.name, 
      count: 0,
      places: [] as PlaceDetail[]
    }));
  }
}

// Function to calculate distance between two coordinates using the Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI/180; // φ, λ in radians
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
}

/**
 * Gets travel time and distance to important transit points
 * 
 * @param apiKey Google Maps API key
 * @param lat Latitude of the property
 * @param lng Longitude of the property
 * @returns Promise resolving to transit point information
 */
async function getTransitConnectivity(apiKey: string, lat: number, lng: number): Promise<TransitInfo[]> {
  const origin = `${lat},${lng}`;
  console.log(`Finding nearest transit points from coordinates: ${lat}, ${lng}`);
  
  // Define transit types to search for with specific search parameters
  const transitSearches = [
    { 
      type: "metro", 
      keyword: "metro station hyderabad", // Be more specific in search
      searchType: "transit_station",
      radius: SEARCH_RADII.metro,
      name: "Nearest Metro Station"
    },
    { 
      type: "train", 
      keyword: "railway station hyderabad",
      searchType: "train_station", 
      radius: SEARCH_RADII.railway,
      name: "Nearest Railway Station"
    },
    { 
      type: "highway", 
      keyword: "ORR entry toll gate hyderabad", // Very specific to find actual ORR entry points
      searchType: "point_of_interest",
      radius: SEARCH_RADII.highway,
      name: "Nearest ORR Entry"
    }
  ];
  
  const transitInfo: TransitInfo[] = [];
  
  try {
    for (const transitSearch of transitSearches) {
      console.log(`Searching for nearest ${transitSearch.keyword}...`);
      
      // Use the Nearby Search API to find the closest transit point of this type
      const nearbyUrl = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
      
      // Use the appropriate search radius for each transit type
      const searchParams = {
        location: origin,
        radius: transitSearch.radius, // Use the specific radius for this transit type
        type: transitSearch.searchType,
        keyword: transitSearch.keyword,
        key: apiKey
      };
      
      const nearbyResponse = await axios.get(nearbyUrl, { params: searchParams });
      
      if (nearbyResponse.data.status === 'ZERO_RESULTS') {
        console.log(`No ${transitSearch.keyword} found within ${transitSearch.radius}m radius`);
        continue;
      }
      
      if (nearbyResponse.data.results && nearbyResponse.data.results.length > 0) {
        console.log(`Found ${nearbyResponse.data.results.length} ${transitSearch.keyword} points`);
        
        // Process all results, not just the nearest one
        for (const place of nearbyResponse.data.results) {
          // Create destination coordinates string
          const destination = `${place.geometry.location.lat},${place.geometry.location.lng}`;
          
          // Get the travel time and distance using Distance Matrix API
          const distanceUrl = `https://maps.googleapis.com/maps/api/distancematrix/json`;
          const distanceParams = {
            origins: origin,
            destinations: destination,
            mode: 'driving',
            key: apiKey
          };
          
          try {
            const distanceResponse = await axios.get(distanceUrl, { params: distanceParams });
            
            if (distanceResponse.data.rows && 
                distanceResponse.data.rows[0].elements && 
                distanceResponse.data.rows[0].elements[0].status === 'OK') {
              
              const element = distanceResponse.data.rows[0].elements[0];
              console.log(`Distance to ${place.name}: ${element.distance.text}, Duration: ${element.duration.text}`);
              
              transitInfo.push({
                name: place.name,
                distance: element.distance.text,
                duration: element.duration.text,
                type: transitSearch.type
              });
            } else {
              console.log(`Could not calculate distance to ${place.name}`);
            }
          } catch (error) {
            console.error(`Error calculating distance to ${place.name}:`, error);
          }
        }
      }
    }
    
    // Sort transit points by distance
    transitInfo.sort((a, b) => {
      const distA = parseFloat(a.distance.replace(" km", "").replace(" m", ""));
      const distB = parseFloat(b.distance.replace(" km", "").replace(" m", ""));
      return distA - distB;
    });
    
    return transitInfo;
  } catch (error) {
    console.error('Error fetching transit connectivity:', error);
    return [];
  }
}

/**
 * Geocode a property name or address to get coordinates
 * 
 * @param apiKey Google Maps API key
 * @param propertyName Name of the property
 * @param location Optional location context (e.g., "Hyderabad")
 * @returns Promise resolving to lat/lng coordinates
 */
async function geocodeProperty(
  apiKey: string, 
  propertyName: string, 
  location: string = 'Hyderabad'
): Promise<{lat: number, lng: number} | null> {
  try {
    // Add location context to improve geocoding accuracy
    const searchQuery = `${propertyName} ${location}`;
    console.log(`Geocoding property: "${searchQuery}" with API key: ${apiKey.substring(0, 5)}...`);
    
    const url = 'https://maps.googleapis.com/maps/api/geocode/json';
    const params = {
      address: searchQuery,
      key: apiKey
    };
    
    const response = await axios.get(url, { params });
    console.log(`Geocoding response status: ${response.status}`);
    
    if (response.data && response.data.status === "OVER_QUERY_LIMIT") {
      console.error(`Google Maps API quota exceeded: ${response.data.error_message || 'No additional details'}`);
      return null;
    }
    
    if (response.data.results && response.data.results.length > 0) {
      const location = response.data.results[0].geometry.location;
      console.log(`Found coordinates: ${location.lat}, ${location.lng}`);
      return {
        lat: location.lat,
        lng: location.lng
      };
    }
    
    console.log(`No geocoding results found for: ${searchQuery}`);
    return null;
  } catch (error) {
    console.error('Error geocoding property:', error);
    return null;
  }
}

/**
 * Get nearby places cache statistics
 */
export async function nearbyPlacesCacheStatsHandler(req: Request, res: Response) {
  try {
    const cacheEntries = Object.keys(nearbyPlacesCache).length;
    
    // Calculate savings
    const totalRequests = stats.apiCalls + stats.cacheHits;
    const apiSavingsPercent = totalRequests > 0 ? Math.round((stats.cacheHits / totalRequests) * 100) : 0;
    
    // With permanent caching, no entries expire
    // But we'll keep the concept for monitoring purposes 
    // (number would be 0 since we're using 100-year expiration)
    const expiredEntries = 0;
    
    res.json({
      cache: {
        entriesInCache: cacheEntries,
        expiredEntries,
        cacheFilePath: CACHE_FILE_PATH
      },
      usage: {
        apiCalls: stats.apiCalls,
        cacheHits: stats.cacheHits,
        totalRequests: stats.totalRequests
      },
      savings: {
        apiSavingsPercent,
        estimatedCostSavings: `$${((stats.cacheHits * 0.02).toFixed(2))}` // Assuming $0.02 per API call
      }
    });
  } catch (error: any) {
    console.error('Error getting cache stats:', error);
    res.status(500).json({ error: 'Failed to get cache statistics' });
  }
}

/**
 * Handler for fetching nearby places and transportation information
 */
export async function propertyNearbyPlacesHandler(req: Request, res: Response) {
  const { lat, lng, propertyName, location, refresh } = req.query;
  console.log(`Nearby places request params:`, { lat, lng, propertyName, location, refresh });
  
  stats.totalRequests++;
  const forceRefresh = refresh === 'true';
  
  // Get API key from environment
  // First try to get the API key from the new environment variable
  let apiKey = process.env.GOOGLE_API_KEY;
  
  // If not found, try the old environment variable name
  if (!apiKey) {
    apiKey = process.env.GOOGLE_API_KEY;
  }
  
  if (!apiKey) {
    console.error('No Google Maps API key found for nearby places. Places functionality will be limited.');
    res.status(500).json({ error: 'Maps API key not available' });
    return;
  }
  
  console.log('Using Google Maps API key for nearby places');
  
  try {
    let latitude: number;
    let longitude: number;
    
    // Use provided coordinates if available
    if (lat && lng) {
      latitude = parseFloat(lat as string);
      longitude = parseFloat(lng as string);
    } 
    // Otherwise, try to geocode the property name
    else if (propertyName) {
      const geocodeResult = await geocodeProperty(
        apiKey, 
        propertyName as string, 
        (location as string) || 'Hyderabad'
      );
      
      if (!geocodeResult) {
        return res.status(404).json({
          error: 'Could not geocode property location'
        });
      }
      
      latitude = geocodeResult.lat;
      longitude = geocodeResult.lng;
    } 
    // No coordinates or property name provided
    else {
      return res.status(400).json({
        error: 'Missing required parameters: either lat/lng coordinates or propertyName'
      });
    }
    
    // Generate a cache key based on coordinates
    // Round to 4 decimal places for consistent caching (~11m precision)
    const roundedLat = parseFloat(latitude.toFixed(4));
    const roundedLng = parseFloat(longitude.toFixed(4));
    const cacheKey = `${roundedLat},${roundedLng}`;
    
    // Check if we have this in cache
    // With permanent caching, we don't need to check expiration
    // Only bypass cache if a refresh is explicitly requested
    if (!forceRefresh && nearbyPlacesCache[cacheKey]) {
      
      console.log(`Using cached nearby places for coordinates: ${roundedLat}, ${roundedLng}`);
      stats.cacheHits++;
      
      return res.json({
        ...nearbyPlacesCache[cacheKey].data,
        cached: true
      });
    }
    
    console.log(`Cache miss or refresh requested for coordinates: ${roundedLat}, ${roundedLng}`);
    stats.apiCalls++;
    
    // Run both requests in parallel
    const [amenities, transitPoints] = await Promise.all([
      getNearbyAmenities(apiKey, latitude, longitude),
      getTransitConnectivity(apiKey, latitude, longitude)
    ]);
    
    const result: NearbyPlacesResponse = {
      amenities,
      transitPoints
    };
    
    // Store in cache
    nearbyPlacesCache[cacheKey] = {
      timestamp: Date.now(),
      data: result
    };
    
    // Save cache to disk
    saveCache(nearbyPlacesCache);
    
    res.json({
      ...result,
      cached: false
    });
  } catch (error) {
    console.error('Error in property nearby places handler:', error);
    res.status(500).json({
      error: 'Failed to fetch nearby places information'
    });
  }
}