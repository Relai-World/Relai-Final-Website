import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { mongodbStorage } from '../mongodb-storage';
import { InsertProperty } from '@shared/schema';

/**
 * Import properties directly from a local json file (properties.json)
 * This allows us to bypass the Google Sheets API issues
 */
export async function directImportHandler(req: Request, res: Response) {
  try {
    console.log("Starting direct import from properties.json...");
    
    // 1. Read the properties.json file
    const propertiesJsonPath = path.join(process.cwd(), 'properties.json');
    
    // Check if the file exists
    if (!fs.existsSync(propertiesJsonPath)) {
      return res.status(404).json({ 
        success: false, 
        message: "Properties.json file not found"
      });
    }
    
    // Read and parse the json file
    const fileContent = fs.readFileSync(propertiesJsonPath, 'utf8');
    const jsonData = JSON.parse(fileContent);
    
    // Handle the case where properties is a top-level key in the JSON file
    const properties = jsonData.properties || jsonData;
    
    if (!properties || !Array.isArray(properties) || properties.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "No properties found in properties.json" 
      });
    }
    
    console.log(`Found ${properties.length} properties in properties.json`);
    
    // 2. Transform and insert each property into the database
    console.log("Starting database import...");
    
    // Keep track of successful and failed imports
    const results = {
      total: properties.length,
      successful: 0,
      failed: 0,
      errors: [] as string[]
    };
    
    // Process each property
    for (let index = 0; index < properties.length; index++) {
      try {
        const prop = properties[index];
        if (!prop) continue;
        
        // Transform the property to match our database schema
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
          console.log(`Progress: ${index + 1}/${properties.length} properties processed`);
        }
      } catch (error) {
        results.failed++;
        const errorMessage = `Error importing property at index ${index}: ${error instanceof Error ? error.message : String(error)}`;
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
    console.error("Error in direct import process:", error);
    return res.status(500).json({
      success: false,
      message: "Error during direct import process",
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * Check if properties.json file exists and get a summary of its contents
 */
export async function checkPropertiesJsonHandler(req: Request, res: Response) {
  try {
    const propertiesJsonPath = path.join(process.cwd(), 'properties.json');
    
    if (!fs.existsSync(propertiesJsonPath)) {
      return res.status(404).json({
        success: false,
        exists: false,
        message: "properties.json file not found"
      });
    }
    
    const stats = fs.statSync(propertiesJsonPath);
    const fileSizeInMB = stats.size / (1024 * 1024);
    
    try {
      const fileContent = fs.readFileSync(propertiesJsonPath, 'utf8');
      const jsonData = JSON.parse(fileContent);
      
      // Handle the case where properties is a top-level key in the JSON file
      const properties = jsonData.properties || jsonData;
      
      return res.status(200).json({
        success: true,
        exists: true,
        fileSize: `${fileSizeInMB.toFixed(2)} MB`,
        propertiesCount: Array.isArray(properties) ? properties.length : 'Not an array',
        fileStructure: Object.keys(jsonData),
        sampleProperties: Array.isArray(properties) ? properties.slice(0, 2) : null
      });
    } catch (parseError) {
      return res.status(500).json({
        success: false,
        exists: true,
        fileSize: `${fileSizeInMB.toFixed(2)} MB`,
        error: "Error parsing JSON file",
        details: parseError instanceof Error ? parseError.message : String(parseError)
      });
    }
  } catch (error) {
    console.error("Error checking properties.json:", error);
    return res.status(500).json({
      success: false,
      message: "Error checking properties.json",
      error: error instanceof Error ? error.message : String(error)
    });
  }
}