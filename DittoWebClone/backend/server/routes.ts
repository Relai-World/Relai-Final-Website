import express, { type Express, type Request, type Response, type NextFunction } from "express";
import { createServer, type Server } from "http";
import { propertyChatbotHandler } from "./api/property-chatbot";
import { insertContactInquirySchema } from "@shared/schema";
import { getAllPropertiesHandler } from "./api/all-properties";
import { 
  getAllPropertiesFromDatabaseHandler, 
  getPropertyByIdFromDatabaseHandler,
  getPropertiesWithPrioritizedImagesHandler
} from "./api/all-properties-db";
import { getPropertyById as getPropertyByIdFromSheets } from "./api/google-sheets-fixed";
import { getLocationsFromDatabaseHandler } from "./api/property-locations-db";
import { getFilterOptionsHandler, getPriceRangeHandler } from "./api/filter-options-db";
import { searchImagesHandler, imageSearchCacheStatsHandler } from "./api/image-search";
import { mapImagesHandler, imageCacheStatsHandler } from "./api/google-maps-images";
import { mapsApiKeyHandler } from "./api/maps-api-key";
import { propertyNearbyPlacesHandler, nearbyPlacesCacheStatsHandler } from "./api/property-nearby-places";
import { getUniqueLocationsHandler } from "./api/property-locations";
import { geocodeAllProperties } from "./api/geocode-properties";
import { getResidentialProperties } from "./api/residential-properties";
import { getPlotProperties } from "./api/plots-properties";
import { getPropertyById } from "./api/property-by-id";
// import { getDatabaseStatus } from "./api/database-status";
import { geocodeExactProperties } from "./api/geocode-exact-properties";
import { fetchGooglePlacesRatings, getCachedGoogleRatings } from "./api/google-places-ratings";
import { geocodeAllPropertyLocations } from "./api/property-geocoding";
import { fixWaterProperties } from "./api/fix-water-properties";
import { saveCurrentLocations } from "./api/save-current-locations";
import { getGeocodedLocationsHandler } from "./api/property-geocoded-locations";
import { SmsService } from "./smsService";
import { wizardPropertiesRouter } from "./api/wizard-properties";
import { propertiesRadiusSearchHandler } from "./api/properties-radius-search";
import { geocodeLocationsHandler } from "./api/geocode-locations";
import { geocodeHandler, preloadLocations, getGeocodeCacheStats, getLocationFromCoordinates } from "./api/geocode-simple";
import { refreshGeocoding } from "./api/refresh-geocoding";
import { fixPropertyLocations } from "./api/fix-property-locations";
import { getAirQuality } from "./api/air-quality";
import { radiusSearchHandler } from "./api/radius-search-simple";
import { radiusSearchDbHandler } from "./api/radius-search-db";
import { importDataToDbHandler, getImportStatusHandler } from "./api/import-data-to-db";
import { directImportHandler, checkPropertiesJsonHandler } from "./api/direct-import-from-json";
import { importCsvToDbHandler, getCsvImportStatusHandler } from "./api/import-csv-to-db";
import { n8nBotProxyHandler } from "./api/n8n-bot";
import { blogRouter } from "./api/blog";
import { adminBlogRouter } from "./api/admin-blog";
import { db } from "./db";
import { 
  fetchAndStorePropertyImagesDrizzle, 
  bulkFetchAndStoreImagesDrizzle, 
  getPropertyImagesDrizzle, 
  getImageStatsDrizzle,
  fetchAndStoreAllPropertyImagesSupabase
} from "./api/property-images";
import { proxyImageHandler } from "./api/proxy-image";
import { mongodbStorage } from "./mongodb-storage";
import { 
  transformAndImportProperties, 
  transformPropertyDataOnly, 
  validateProperties 
} from "./api/transform-property-data";
import {
  populateAllPropertyImagesHandler,
  populateSpecificPropertyImagesHandler,
  checkPropertyImagesStatusHandler
} from "./api/populate-images";
import cors from 'cors';
import path from 'path';
import { resolvePath } from './utils/path-utils';

/**
 * Preload all unique locations from the database to minimize API calls 
 * This function runs once at server startup
 */
async function preloadAllLocationsFromDb() {
  console.log("Starting preload of all unique locations from database...");
  try {
    // Get all unique locations from database
    const properties = await mongodbStorage.getAllProperties();
    
    if (!properties || properties.length === 0) {
      console.log("No properties found in database to preload locations");
      return;
    }
    
    // Extract all unique location names, filter out empty strings
    const allLocations = properties
      .map(p => p.location || "")
      .filter(location => location.trim() !== "")
      .filter((loc, index, self) => self.indexOf(loc) === index); // remove duplicates
    
    console.log(`Found ${allLocations.length} unique locations to preload from database`);
    
    // Preload them in batches to respect rate limits
    const batchSize = 25;
    for (let i = 0; i < allLocations.length; i += batchSize) {
      const locationsBatch = allLocations.slice(i, i + batchSize);
      const geocodedCount = await preloadLocations(locationsBatch);
      console.log(`Preloaded batch ${i/batchSize + 1}: ${geocodedCount} locations geocoded`);
      
      // Add a delay between batches to avoid rate limits
      if (i + batchSize < allLocations.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log("Finished preloading all unique locations from database");
  } catch (error) {
    console.error("Error preloading locations from database:", error);
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Start preloading all locations in the background
  // This runs asynchronously so it doesn't block server startup
  preloadAllLocationsFromDb().catch(err => 
    console.error("Background location preloading failed:", err)
  );

  // Allow all origins (for development)
  app.use(cors());

  // API routes
  app.post('/api/property-chatbot', propertyChatbotHandler);
  
  // Properties API - Google Sheets version
  app.get('/api/all-properties-sheets', getAllPropertiesHandler);
  
  // Properties API - Database version
  app.get('/api/all-properties', getAllPropertiesFromDatabaseHandler);
  app.get('/api/all-properties-db', getAllPropertiesFromDatabaseHandler);
  app.get('/api/properties-db', getAllPropertiesFromDatabaseHandler);
  app.get('/api/prioritized-properties', getAllPropertiesFromDatabaseHandler);
  
  // Property Wizard API - uses same filtering logic as All Properties page
  app.use('/api/wizard-properties', wizardPropertiesRouter);
  
  // POST endpoint for property wizard (converts form data to query parameters)
  app.post('/api/properties', async (req: Request, res: Response) => {
    try {
      console.log('POST /api/properties called with body:', req.body);
      const { budget, propertyType, location, communityType, possessionTimeline } = req.body;
      
      // Convert POST body to query parameters for the wizard API
      const queryParams = new URLSearchParams();
      
      if (budget && budget !== 'any') queryParams.append('budget', budget);
      if (propertyType && propertyType !== 'any') queryParams.append('propertyType', propertyType);
      if (location && location !== 'any') queryParams.append('location', location);
      if (communityType && communityType !== 'any') queryParams.append('communityType', communityType);
      if (possessionTimeline && possessionTimeline !== 'any') queryParams.append('possessionTimeline', possessionTimeline);
      
      console.log('Redirecting to wizard API with params:', queryParams.toString());
      
      // Make internal request to wizard API
      const wizardApiUrl = `/api/wizard-properties?${queryParams.toString()}`;
      
      // Build filters object for storage.getAllProperties
      const filters: any = {};
      
      // Convert budget string to minPrice/maxPrice
      if (budget && budget !== 'any') {
        const budgetStr = budget.toLowerCase();
        console.log('Converting budget string:', budgetStr);
        
        if (budgetStr === 'under-50l') {
          filters.maxPrice = 5000000; // 50L
        } else if (budgetStr === 'above-2cr') {
          // For "Above 2Cr", show all properties regardless of budget
          // No budget filters applied
        } else if (budgetStr === '50l-75l') {
          filters.minPrice = 5000000; // 50L
          filters.maxPrice = 7500000; // 75L
        } else if (budgetStr === '75l-1cr') {
          filters.minPrice = 7500000; // 75L
          filters.maxPrice = 10000000; // 1Cr
        } else if (budgetStr === '1cr-1.5cr') {
          filters.minPrice = 10000000; // 1Cr
          filters.maxPrice = 15000000; // 1.5Cr
        } else if (budgetStr === '1.5cr-2cr') {
          filters.minPrice = 15000000; // 1.5Cr
          filters.maxPrice = 20000000; // 2Cr
        }
      }
      
      // Add other filters
      if (propertyType && propertyType !== 'any') {
        filters.propertyType = propertyType;
      }
      if (location && location !== 'any') {
        filters.Area = { $regex: location, $options: 'i' };
      }
      if (communityType && communityType !== 'any') {
        filters.communityType = communityType;
      }
      if (possessionTimeline && possessionTimeline !== 'any') {
        filters.possessionTimeline = possessionTimeline;
      }
      
      console.log('Final filters for wizard:', filters);
      
      // Use storage.getAllProperties with filters
      const properties = await mongodbStorage.getAllProperties(filters);
      
      console.log(`POST /api/properties retrieved ${properties.length} properties`);
      
      res.json({
        properties,
        total: properties.length,
        filters: filters
      });
      
    } catch (error) {
      console.error('Error in POST /api/properties:', error);
      res.status(500).json({ 
        error: 'Failed to fetch properties',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // Plots properties endpoint
  app.get('/api/plots-properties', getPlotProperties);
  
  // Property by ID endpoint
  app.get('/api/property-by-id/:id', getPropertyById);
  app.get('/api/properties/:id', getPropertyById);
  
  app.get('/api/search-images', searchImagesHandler);
  app.get('/api/map-images', mapImagesHandler);
  app.get('/api/maps-api-key', mapsApiKeyHandler);
  app.get('/api/property-nearby-places', propertyNearbyPlacesHandler);
  app.get('/api/property-locations', getUniqueLocationsHandler);
  app.get('/api/property-geocoded-locations', getLocationsFromDatabaseHandler);
  app.get('/api/property-locations-db', getLocationsFromDatabaseHandler);
  app.get('/api/properties-radius-search', propertiesRadiusSearchHandler);
  app.get('/api/geocode-locations', geocodeLocationsHandler);
  app.get('/api/geocode', geocodeHandler);
  app.get('/api/radius-search-sheets', radiusSearchHandler);
  app.get('/api/radius-search', radiusSearchDbHandler);
  app.get('/api/radius-search-db', radiusSearchDbHandler);
  app.get('/api/image-cache-stats', imageCacheStatsHandler);
  app.get('/api/image-search-cache-stats', imageSearchCacheStatsHandler);
  app.get('/api/nearby-places-cache-stats', nearbyPlacesCacheStatsHandler);
  app.get('/api/geocode-cache-stats', getGeocodeCacheStats);
  app.get('/api/geocode-all-properties', geocodeAllProperties);
  app.get('/api/geocode-exact-properties', geocodeExactProperties);
  app.post('/api/google-places-ratings', fetchGooglePlacesRatings);
  app.get('/api/google-places-ratings', getCachedGoogleRatings);
  app.get('/api/geocode-exact-locations', geocodeAllPropertyLocations);
  app.get('/api/fix-water-properties', fixWaterProperties);
  app.get('/api/save-current-locations', saveCurrentLocations);
  app.get('/api/filter-options', getFilterOptionsHandler);
  app.get('/api/filter-options/price-range', getPriceRangeHandler);
  
  // Database import routes
  app.get('/api/import-data-to-db', importDataToDbHandler);
  app.get('/api/import-status', getImportStatusHandler);
  
  // Direct import from local JSON file
  app.get('/api/direct-import', directImportHandler);
  app.get('/api/check-properties-json', checkPropertiesJsonHandler);
  
  // CSV import from local file
  app.get('/api/import-csv-to-db', importCsvToDbHandler);
  app.get('/api/csv-import-status', getCsvImportStatusHandler);
  
  // Get property by ID - Google Sheets version
  app.get('/api/properties-sheets/:id', getPropertyByIdFromSheets);
  
  // Get property by ID - Database version
  app.get('/api/properties/:id', getPropertyByIdFromDatabaseHandler);
  app.get('/api/properties-db/:id', getPropertyByIdFromDatabaseHandler);
  
  // Set property coordinates endpoint
  app.post('/api/properties/:id/set-coords', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { latitude, longitude } = req.body;
      
      if (typeof latitude !== 'number' || typeof longitude !== 'number') {
        return res.status(400).json({ 
          error: 'Invalid coordinates. latitude and longitude must be numbers.' 
        });
      }
      
      const success = await mongodbStorage.updatePropertyCoordinates(id, latitude, longitude);
      
      if (success) {
        res.json({ 
          success: true, 
          message: 'Property coordinates updated successfully',
          propertyId: id,
          coordinates: { latitude, longitude }
        });
      } else {
        res.status(404).json({ 
          error: 'Property not found or coordinates could not be updated' 
        });
      }
    } catch (error) {
      console.error('Error updating property coordinates:', error);
      res.status(500).json({ 
        error: 'Failed to update property coordinates', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });
  
  // Health check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok' });
  });
  
  // Database status endpoint for troubleshooting
  // app.get('/api/database-status', getDatabaseStatus);
  
  // n8n AI Bot proxy endpoint
  app.post('/api/n8n-bot', n8nBotProxyHandler);
  
  // Contact property expert endpoint
  app.post('/api/contact-property-expert', async (req: Request, res: Response) => {
    try {
      const parseResult = insertContactInquirySchema.safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({ 
          error: 'Invalid contact information', 
          details: parseResult.error.format() 
        });
      }
      
      const contactInquiry = await mongodbStorage.createContactInquiry(parseResult.data);
      
      res.status(201).json({ 
        success: true, 
        message: 'Contact request submitted successfully',
        data: contactInquiry
      });
    } catch (error) {
      console.error('Error submitting contact request:', error);
      res.status(500).json({ 
        error: 'Failed to submit contact request', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Refresh geocoding endpoint to fix water locations
  app.post('/api/refresh-geocoding', refreshGeocoding);
  
  // Fix property locations endpoint
  app.post('/api/fix-property-locations', fixPropertyLocations);
  
  // Air quality endpoint
  app.get('/api/air-quality', getAirQuality);

  // Blog routes
  app.use('/api/blog', blogRouter);
  app.use('/api/admin', adminBlogRouter);
  
  // Property Image Storage API routes
  app.post('/api/property-images/:propertyId/fetch', fetchAndStorePropertyImagesDrizzle);
  app.post('/api/property-images/bulk-fetch', bulkFetchAndStoreImagesDrizzle);
  app.post('/api/property-images/fetch-all', fetchAndStoreAllPropertyImagesSupabase);
  app.get('/api/property-images/:propertyId', getPropertyImagesDrizzle);
  app.get('/api/property-images-stats', getImageStatsDrizzle);
  
  // Property Data Transformation API routes
  app.post('/api/transform-properties', transformPropertyDataOnly);
  app.post('/api/transform-and-import-properties', transformAndImportProperties);
  app.post('/api/validate-properties', validateProperties);
  
  // Property Images Population API routes
  app.post('/api/populate-property-images', populateAllPropertyImagesHandler);
  app.post('/api/populate-specific-property-images', populateSpecificPropertyImagesHandler);
  app.get('/api/property-images-status', checkPropertyImagesStatusHandler);
  
  // Proxy image handler
  app.get('/api/proxy-image', proxyImageHandler);

  // Test endpoint to verify image accessibility
  app.get('/api/test-image/:filename', (req: Request, res: Response) => {
    const { filename } = req.params;
    const imagePath = `/property_images/${filename}`;
    
    console.log(`Testing image accessibility for: ${imagePath}`);
    
    res.json({
      message: 'Image test endpoint',
      filename,
      imagePath,
      fullUrl: `${req.protocol}://${req.get('host')}${imagePath}`,
      testUrl: `${req.protocol}://${req.get('host')}/property_images/${filename}`
    });
  });

  // Property images endpoint with CORS headers
  app.get('/property_images/:filename', (req: Request, res: Response, next: NextFunction) => {
    const { filename } = req.params;
    
    // Set CORS headers for images
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    
    console.log(`Serving property image: ${filename}`);
    
    // The static middleware will handle serving the actual file
    // This route just ensures proper headers are set
    next();
  });

  // Add this route near your other /api/geocode routes:
  app.get('/api/reverse-geocode', async (req: Request, res: Response) => {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ error: 'lat and lng query parameters are required' });
    }
    try {
      const areas = await getLocationFromCoordinates(Number(lat), Number(lng));
      console.log('Google reverse geocode API results:', areas);
      res.json({ areas });
    } catch (error) {
      res.status(500).json({ error: 'Failed to reverse geocode coordinates' });
    }
  });

  app.use('/property_images', express.static(resolvePath(import.meta.url, 'public/property_images')));

  const httpServer = createServer(app);
  return httpServer;
}
