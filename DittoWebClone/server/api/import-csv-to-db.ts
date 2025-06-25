import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { db } from '../db';
import { properties } from '@shared/schema';
import { v4 as uuidv4 } from 'uuid';
import { eq, sql } from 'drizzle-orm';

interface CSVProperty {
  DeveloperName: string;
  RERA_Number: string;
  ProjectName: string;
  ConstructionStatus: string;
  PropertyType: string;
  Location: string;
  PossessionDate: string;
  IsGatedCommunity: string;
  TotalUnits: string;
  AreaSizeAcres: string;
  Configurations: string;
  MinSizeSqft: string;
  MaxSizeSqft: string;
  PricePerSqft: string;
  PricePerSqftOTP: string;
  'Longitude/Latitude': string;
  ProjectDocumentsLink: string;
  Source: string;
  BuilderContactInfo: string;
  ListingType: string;
  LoanApprovedBanks: string;
  NearbyLocations: string;
  RemarksComments: string;
  Amenities: string;
  FAQ: string;
  [key: string]: string;
}

let processedCount = 0;
let errorCount = 0;
let startTime = Date.now();
let importStatus = 'Not started';

/**
 * Parse a boolean value from string 'TRUE' or 'FALSE'
 */
function parseBoolean(value: string): boolean | null {
  if (!value || value.trim() === '') return null;
  return value.toLowerCase() === 'true';
}

/**
 * Parse a number from string with error handling
 */
function parseNumber(value: string): number | null {
  if (!value || value.trim() === '') return null;
  
  const number = Number(value.replace(/,/g, ''));
  if (isNaN(number)) return null;
  return number;
}

/**
 * Parse an array from comma-separated string
 */
function parseArray(value: string): string[] | null {
  if (!value || value.trim() === '') return null;
  
  return value.split(',').map(item => item.trim()).filter(item => item);
}

/**
 * Extract latitude and longitude from string like "17.539744115782046, 78.35855181109751"
 */
function extractCoordinates(value: string): { latitude: number | null, longitude: number | null } {
  if (!value || value.trim() === '') {
    return { latitude: null, longitude: null };
  }
  
  const parts = value.split(',');
  if (parts.length !== 2) {
    return { latitude: null, longitude: null };
  }
  
  const lat = parseNumber(parts[0]);
  const lng = parseNumber(parts[1]);
  
  return { latitude: lat, longitude: lng };
}

/**
 * Parse amenities which are in a multi-line text format
 */
function parseAmenities(value: string): string[] | null {
  if (!value || value.trim() === '') return null;
  
  // If the string contains newlines, split by newline
  if (value.includes('\n')) {
    return value.split('\n').map(item => item.trim()).filter(item => item);
  }
  
  // Otherwise, split by commas (as fallback)
  return value.split(',').map(item => item.trim()).filter(item => item);
}

/**
 * Extract bedrooms from configurations like "2BHK, 3BHK, 4BHK"
 */
function extractBedrooms(configurations: string): number | null {
  if (!configurations || configurations.trim() === '') return null;
  
  const regex = /(\d+)BHK/i;
  const matches = configurations.match(regex);
  
  if (matches && matches[1]) {
    return parseInt(matches[1], 10);
  }
  
  return null;
}

/**
 * Function to reset import status
 */
export function resetImportStatus() {
  processedCount = 0;
  errorCount = 0;
  startTime = Date.now();
  importStatus = 'Not started';
}

/**
 * Handler to import CSV data to database
 */
export async function importCsvToDbHandler(req: Request, res: Response) {
  try {
    const csvFilePath = path.join(process.cwd(), 'properties-csv.csv');
    
    // Check if file exists
    if (!fs.existsSync(csvFilePath)) {
      return res.status(404).json({ error: 'CSV file not found' });
    }
    
    // Reset counters
    resetImportStatus();
    importStatus = 'In progress';
    
    // Clear existing properties
    try {
      await db.delete(properties);
      console.log('Deleted existing properties');
    } catch (error) {
      console.error('Error deleting existing properties:', error);
      return res.status(500).json({
        error: 'Failed to clear existing properties',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Start processing
    const results: any[] = [];
    
    // Start CSV parsing
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', async (data: CSVProperty) => {
        try {
          // Extract coordinates
          const { latitude, longitude } = extractCoordinates(data['Longitude/Latitude']);
          
          // Extract bedrooms from configurations
          const bedrooms = extractBedrooms(data.Configurations);
          
          // Calculate price based on price per sqft and min size
          let price = null;
          const minSizeSqft = parseNumber(data.MinSizeSqft);
          const pricePerSqft = parseNumber(data.PricePerSqft);
          
          if (minSizeSqft && pricePerSqft) {
            price = minSizeSqft * pricePerSqft;
          }
          
          // Generate propertyId if not present
          const propertyData = {
            developerName: data.DeveloperName || null,
            reraNumber: data.RERA_Number || null,
            projectName: data.ProjectName || 'Unnamed Property',
            constructionStatus: data.ConstructionStatus || null,
            propertyType: data.PropertyType || 'Residential',
            location: data.Location || 'Unknown Location',
            possessionDate: data.PossessionDate || null,
            isGatedCommunity: parseBoolean(data.IsGatedCommunity),
            totalUnits: parseNumber(data.TotalUnits),
            areaSizeAcres: parseNumber(data.AreaSizeAcres),
            configurations: data.Configurations || null,
            minSizeSqft: minSizeSqft,
            maxSizeSqft: parseNumber(data.MaxSizeSqft),
            pricePerSqft: pricePerSqft,
            pricePerSqftOTP: parseNumber(data.PricePerSqftOTP),
            price: price || 0, // Fallback to 0 if we can't calculate the price
            longitude,
            latitude,
            projectDocumentsLink: data.ProjectDocumentsLink || null,
            source: data.Source || null,
            builderContactInfo: data.BuilderContactInfo || null,
            listingType: data.ListingType || null,
            loanApprovedBanks: parseArray(data.LoanApprovedBanks),
            nearbyLocations: parseArray(data.NearbyLocations),
            remarksComments: data.RemarksComments || null,
            amenities: parseAmenities(data.Amenities),
            faq: parseArray(data.FAQ),
            
            // Legacy fields for compatibility with frontend
            name: data.ProjectName || 'Unnamed Property',
            bedrooms: bedrooms || 0,
            bathrooms: bedrooms ? bedrooms - 1 || 1 : 1, // Estimate bathrooms based on bedrooms
            area: minSizeSqft || 0,
            description: data.RemarksComments || null,
            features: parseAmenities(data.Amenities),
            images: [], // We'll need to add images
            builder: data.DeveloperName || null,
            possession: data.PossessionDate || null,
            rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // Random rating between 3 and 5
          };
          
          // Insert property into database
          const result = await db.insert(properties).values(propertyData);
          results.push(result);
          
          // Update counter
          processedCount++;
          
          // Log progress every 100 records
          if (processedCount % 100 === 0) {
            console.log(`Processed ${processedCount} properties`);
          }
        } catch (error) {
          console.error('Error processing CSV row:', error);
          errorCount++;
        }
      })
      .on('end', () => {
        importStatus = 'Completed';
        console.log(`CSV import completed. Processed ${processedCount} properties with ${errorCount} errors.`);
      })
      .on('error', (error) => {
        importStatus = 'Error';
        console.error('Error reading CSV file:', error);
      });
    
    // Return response immediately, since the import will continue in the background
    res.json({
      message: 'CSV import started successfully in the background',
      status: 'in_progress'
    });
  } catch (error) {
    console.error('Error importing CSV data:', error);
    importStatus = 'Error';
    
    res.status(500).json({
      error: 'Failed to import CSV data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Handler to get import status
 */
export async function getCsvImportStatusHandler(req: Request, res: Response) {
  let totalProperties = 0;
  
  try {
    // Count total properties
    const result = await db.select({ count: sql`COUNT(*)` }).from(properties);
    if (result && result.length > 0) {
      totalProperties = Number(result[0].count);
    }
  } catch (error) {
    console.error('Error counting properties:', error);
  }
  
  res.json({
    status: importStatus,
    processed: processedCount,
    errors: errorCount,
    totalProperties,
    duration: `${((Date.now() - startTime) / 1000).toFixed(2)} seconds`
  });
}