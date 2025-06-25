import { Request, Response } from 'express';
import { Property } from '../../shared/mongodb-schemas';
import { getLocationFromCoordinates } from './property-geocoded-locations';
import { getMapImages } from './google-maps-images';
import { mongodbStorage } from '../mongodb-storage';

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
    console.error(`Error calculating distance: ${error}`);
    return Infinity;
  }
}

// API handler for getting all properties directly from the database
export async function getAllPropertiesHandler(req: Request, res: Response) {
  try {
    // Parse query parameters for filtering
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
      radiusKm
    } = req.query;

    // Build filters object for MongoDB
    const filters: any = {};

    // Apply filters
    if (search) {
      filters.search = String(search);
    }
    if (propertyType && String(propertyType) !== 'any') {
      filters.propertyType = String(propertyType);
    }
    if (minPrice) {
      filters.minPrice = Number(minPrice);
    }
    if (maxPrice) {
      filters.maxPrice = Number(maxPrice);
    }
    if (bedrooms) {
      filters.bedrooms = Number(bedrooms);
    }
    if (minPricePerSqft) {
      filters.minPricePerSqft = Number(minPricePerSqft);
    }
    if (maxPricePerSqft) {
      filters.maxPricePerSqft = Number(maxPricePerSqft);
    }
    if (configurations && String(configurations) !== 'any') {
      filters.configurations = String(configurations);
    }
    if (constructionStatus && String(constructionStatus) !== 'any') {
      filters.constructionStatus = String(constructionStatus);
    }
    if (location && String(location) !== 'any') {
      filters.location = String(location);
    }

    // Fetch all properties from MongoDB
    const allProperties = await mongodbStorage.getAllProperties(filters);

    if (!allProperties) {
      return res.status(200).json({ properties: [], total: 0 });
    }
    
    let filteredProperties: any[] = allProperties;
    
    // If there's a location filter, handle it specially using Google Maps data
    if (location && String(location) !== 'any') {
      // Parse location parameter - it could be a single location or a comma-separated list
      const locationFilters = String(location).toLowerCase().split(',').map(loc => loc.trim());
      console.log(`Filtering by locations: ${locationFilters.join(', ')}`);
      
      // Parse the radius parameter
      const radius = radiusKm ? Number(radiusKm) : 0;
      console.log(`Using radius filter: ${radius}km`);
      
      // Create an array to hold all properties that match any of the location filters
      const matchedProperties: any[] = [];
      
      // We need reference coordinates for the selected locations to calculate distance
      const referenceCoordinates: Array<{lat: number, lng: number, source?: string}> = [];
      
      // For each location in the filter
      for (const locationFilter of locationFilters) {
        // First add any properties that match the location in the original data (text match)
        const textMatchedProperties = filteredProperties.filter((p: any) => 
          p.location.toLowerCase().includes(locationFilter) &&
          !matchedProperties.some((mp: any) => mp._id === p._id) // Avoid duplicates
        );
        
        console.log(`Found ${textMatchedProperties.length} properties matching location text "${locationFilter}"`);
        matchedProperties.push(...textMatchedProperties);
        
        // Extract coordinates from text-matched properties (if they have valid coordinates)
        textMatchedProperties.forEach((p: any) => {
          if (p.latitude && p.longitude && p.latitude !== 0 && p.longitude !== 0) {
            referenceCoordinates.push({
              lat: p.latitude,
              lng: p.longitude,
              source: `${p.projectName} (location match: ${locationFilter})`
            });
          }
        });
        
        // Next, process properties with coordinates to check for area matches
        const propertiesWithCoordinates = filteredProperties.filter((p: any) => 
          p.latitude !== 0 && 
          p.longitude !== 0 && 
          !matchedProperties.some((mp: any) => mp._id === p._id) // Skip properties already matched
        );
        
        console.log(`Checking geocoded locations for ${propertiesWithCoordinates.length} additional properties for location "${locationFilter}"`);
        
        // To avoid hammering the API, batch the geocoding requests
        // Process in smaller batches to reduce API load
        const BATCH_SIZE = 5;
        for (let i = 0; i < propertiesWithCoordinates.length; i += BATCH_SIZE) {
          const batch = propertiesWithCoordinates.slice(i, Math.min(i + BATCH_SIZE, propertiesWithCoordinates.length));
          
          // Process each property in the batch
          for (const property of batch) {
            const coordKey = `${property.latitude},${property.longitude}`;
            
            // Check if we already have cached data for this coordinate
            if (!locationCache[coordKey]) {
              if (property.latitude && property.longitude) {
                try {
                  // Get neighborhood/area name from coordinates
                  locationCache[coordKey] = await getLocationFromCoordinates(property.latitude, property.longitude);
                  console.log(`Retrieved area info for ${property.projectName}: ${locationCache[coordKey].join(', ')}`);
                } catch (error) {
                  console.error(`Error getting area from coordinates for property ${property._id}:`, error);
                  locationCache[coordKey] = [];
                }
              } else {
                locationCache[coordKey] = [];
              }
            }
            
            // Check if any of the geocoded location areas matches the filter
            const areas = locationCache[coordKey] || [];
            
            // Check if any area name matches the filter
            const hasAreaMatch = areas.some((area: string) => 
              area.toLowerCase().includes(locationFilter)
            );
            
            if (hasAreaMatch) {
              console.log(`Property "${property.projectName}" matched area filter "${locationFilter}" through coordinates`);
              matchedProperties.push(property);
              
              // Add this property's coordinates to our reference list
              if (property.latitude && property.longitude) {
                referenceCoordinates.push({
                  lat: property.latitude,
                  lng: property.longitude,
                  source: `${property.projectName} (area match: ${locationFilter})`
                });
              }
            }
          }
          
          // Small delay between batches to be respectful to the API
          if (i + BATCH_SIZE < propertiesWithCoordinates.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
      }
      
      // If we have reference coordinates and a radius filter, check for nearby properties
      if (referenceCoordinates.length > 0 && radius > 0) {
        console.log(`Checking for properties within ${radius}km of ${referenceCoordinates.length} reference points`);
        
        const nearbyProperties = filteredProperties.filter((property: any) => {
          if (!property.latitude || !property.longitude || property.latitude === 0 || property.longitude === 0) {
            return false;
          }
          
          // Check if this property is already matched
          if (matchedProperties.some((mp: any) => mp._id === property._id)) {
            return false;
          }
          
          // Check distance to any reference coordinate
          for (const refCoord of referenceCoordinates) {
            const distance = calculateDistance(
              property.latitude, property.longitude,
              refCoord.lat, refCoord.lng
            );
            
            if (distance <= radius) {
              console.log(`Property "${property.projectName}" is ${distance.toFixed(2)}km from ${refCoord.source}`);
              return true;
            }
          }
          
          return false;
        });
        
        console.log(`Found ${nearbyProperties.length} additional properties within ${radius}km radius`);
        matchedProperties.push(...nearbyProperties);
      }
      
      // Use the matched properties instead of all properties
      filteredProperties = matchedProperties;
    }

    // Transform properties to match the expected format
    const transformedProperties = filteredProperties.map((property: any) => ({
      id: property._id,
      developerName: property.developerName,
      reraNumber: property.reraNumber,
      projectName: property.projectName,
      constructionStatus: property.constructionStatus,
      propertyType: property.propertyType,
      location: property.location,
      possessionDate: property.possessionDate,
      isGatedCommunity: property.isGatedCommunity,
      totalUnits: property.totalUnits,
      areaSizeAcres: property.areaSizeAcres,
      configurations: property.configurations,
      minSizeSqft: property.minSizeSqft,
      maxSizeSqft: property.maxSizeSqft,
      pricePerSqft: property.pricePerSqft,
      pricePerSqftOTP: property.pricePerSqftOTP,
      price: property.price,
      longitude: property.longitude,
      latitude: property.latitude,
      projectDocumentsLink: property.projectDocumentsLink,
      source: property.source,
      builderContactInfo: property.builderContactInfo,
      listingType: property.listingType,
      loanApprovedBanks: property.loanApprovedBanks,
      nearbyLocations: property.nearbyLocations,
      remarksComments: property.remarksComments,
      amenities: property.amenities,
      faq: property.faq,
      name: property.name,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      area: property.area,
      description: property.description,
      features: property.features,
      images: property.images,
      builder: property.builder,
      possession: property.possession,
      rating: property.rating,
      legalClearance: property.legalClearance,
      constructionQuality: property.constructionQuality,
      waterSupply: property.waterSupply,
      powerBackup: property.powerBackup,
      parkingFacilities: property.parkingFacilities,
      communityType: property.communityType,
      buildQuality: property.buildQuality,
      investmentPotential: property.investmentPotential,
      propertyAge: property.propertyAge,
      environmentalFeatures: property.environmentalFeatures,
      views: property.views,
      noiseLevel: property.noiseLevel,
      connectivityAndTransit: property.connectivityAndTransit,
      medicalFacilities: property.medicalFacilities,
      educationalInstitutions: property.educationalInstitutions,
      shoppingAndEntertainment: property.shoppingAndEntertainment,
      specialFeatures: property.specialFeatures,
      videoTour: property.videoTour,
      virtualTour: property.virtualTour,
      siteVisitSchedule: property.siteVisitSchedule,
      homeLoans: property.homeLoans,
      maintenanceCharges: property.maintenanceCharges,
      taxAndCharges: property.taxAndCharges,
      legalDocuments: property.legalDocuments,
      floorPlans: property.floorPlans,
      masterPlan: property.masterPlan,
      relaiRating: property.relaiRating,
      relaiReview: property.relaiReview,
      discounts: property.discounts,
      bookingAmount: property.bookingAmount,
      paymentSchedule: property.paymentSchedule,
      minimumBudget: property.minimumBudget,
      maximumBudget: property.maximumBudget,
      createdAt: property.createdAt,
      updatedAt: property.updatedAt
    }));

    console.log(`Returning ${transformedProperties.length} properties`);
    res.json({ 
      properties: transformedProperties, 
      total: transformedProperties.length 
    });

  } catch (error) {
    console.error('Error in getAllPropertiesHandler:', error);
    res.status(500).json({ 
      error: 'Failed to fetch properties', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}