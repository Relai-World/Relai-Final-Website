import { Request, Response } from 'express';
import { fetchAllProperties } from './google-sheets-fixed';
import { mongodbStorage } from '../mongodb-storage';
import { InsertProperty } from '@shared/schema';

/**
 * Imports data from Google Sheets to the database
 * This is intended to be run once to migrate the data from Google Sheets to the database
 * @param req The express request object
 * @param res The express response object
 */
export async function importDataToDbHandler(req: Request, res: Response) {
  try {
    console.log("Starting import process from Google Sheets to database...");
    
    // 1. Fetch properties from Google Sheets
    console.log("Fetching properties from Google Sheets...");
    const googleSheetProperties = await fetchAllProperties();
    if (!googleSheetProperties || googleSheetProperties.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "No properties found in Google Sheets" 
      });
    }
    
    console.log(`Found ${googleSheetProperties.length} properties in Google Sheets`);
    
    // 2. Transform and insert each property into the database
    console.log("Starting database import...");
    const validProperties = googleSheetProperties.filter(prop => prop !== null);
    
    // Keep track of successful and failed imports
    const results = {
      total: validProperties.length,
      successful: 0,
      failed: 0,
      errors: [] as string[]
    };
    
    // Process each property
    for (let index = 0; index < validProperties.length; index++) {
      const prop = validProperties[index];
      try {
        if (!prop) continue;
        
        // Transform the sheet property to match our database schema
        const insertProperty = {
          developerName: prop.developerName,
          reraNumber: prop.reraNumber,
          projectName: prop.projectName,
          constructionStatus: prop.constructionStatus,
          propertyType: prop.propertyType,
          location: prop.location,
          possessionDate: prop.possessionDate,
          isGatedCommunity: prop.isGatedCommunity,
          totalUnits: prop.totalUnits,
          areaSizeAcres: prop.areaSizeAcres,
          configurations: prop.configurations,
          minSizeSqft: prop.minSizeSqft,
          maxSizeSqft: prop.maxSizeSqft,
          pricePerSqft: prop.pricePerSqft,
          pricePerSqftOTP: prop.pricePerSqftOTP,
          price: prop.price,
          longitude: prop.longitude,
          latitude: prop.latitude,
          projectDocumentsLink: prop.projectDocumentsLink,
          source: prop.source,
          builderContactInfo: prop.builderContactInfo,
          listingType: prop.listingType,
          loanApprovedBanks: prop.loanApprovedBanks,
          nearbyLocations: prop.nearbyLocations,
          remarksComments: prop.remarksComments,
          amenities: prop.amenities,
          faq: prop.faq,
          name: prop.name,
          bedrooms: prop.bedrooms,
          bathrooms: prop.bathrooms,
          area: prop.area,
          description: prop.description,
          features: prop.features,
          images: prop.images,
          builder: prop.builder,
          possession: prop.possession,
          rating: prop.rating
        };
        
        // Import the property to the database
        await mongodbStorage.createProperty(insertProperty);
        results.successful++;
        
        // Log progress every 10 properties
        if (index % 10 === 0) {
          console.log(`Progress: ${index + 1}/${validProperties.length} properties processed`);
        }
      } catch (error) {
        results.failed++;
        const errorMessage = `Error importing property ${prop?.id || index}: ${error instanceof Error ? error.message : String(error)}`;
        console.error(errorMessage);
        results.errors.push(errorMessage);
      }
    }
    
    console.log("Import process completed");
    console.log(`Successfully imported ${results.successful} properties`);
    console.log(`Failed to import ${results.failed} properties`);
    
    return res.status(200).json({
      success: true,
      message: "Import process completed",
      results
    });
  } catch (error) {
    console.error("Error in import process:", error);
    return res.status(500).json({
      success: false,
      message: "Error during import process",
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * Utility function to get status of imported properties
 * @param req The express request object
 * @param res The express response object
 */
export async function getImportStatusHandler(req: Request, res: Response) {
  try {
    // Get all properties from the database
    const dbProperties = await mongodbStorage.getAllProperties();
    
    return res.status(200).json({
      success: true,
      message: "Import status retrieved successfully",
      count: dbProperties.length,
      propertiesPreview: dbProperties.slice(0, 3) // Show first 3 properties as preview
    });
  } catch (error) {
    console.error("Error checking import status:", error);
    return res.status(500).json({
      success: false,
      message: "Error checking import status",
      error: error instanceof Error ? error.message : String(error)
    });
  }
}