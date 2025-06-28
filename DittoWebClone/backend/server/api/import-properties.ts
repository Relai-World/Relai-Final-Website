import { Request, Response } from 'express';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { mongodbStorage } from '../mongodb-storage';

// Google Sheet ID for property data
const SHEET_ID = '1hjNRFIQBvZXZZSjUH6iZyq7Sypu-zeQ2q4hfnmHRLR0';

// API handler for importing properties from Google Sheets
export async function importPropertiesHandler(req: Request, res: Response) {
  try {
    // Import properties from Google Sheets
    const importedProperties = await importPropertiesFromGoogleSheets();
    
    if (!importedProperties || importedProperties.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Failed to import properties from Google Sheets.' 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: `Successfully imported ${importedProperties.length} properties.`,
      properties: importedProperties
    });
  } catch (error) {
    console.error('Error importing properties:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error importing properties', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

// Function to import properties from Google Sheets into the database
async function importPropertiesFromGoogleSheets() {
  try {
    console.log("Importing properties from Google Sheets...");
    
    // Use the service account file directly
    console.log('Loading service account from file...');
    const fs = require('fs');
    const serviceAccountPath = './server/service-account.json';
    
    // Read service account file
    const serviceAccountContent = fs.readFileSync(serviceAccountPath, 'utf8');
    const serviceAccount = JSON.parse(serviceAccountContent);
    
    console.log(`Using Google service account email: ${serviceAccount.client_email}`);
    
    // Create service account auth object
    const serviceAccountAuth = new JWT({
      email: serviceAccount.client_email,
      key: serviceAccount.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    // Create a new Google Spreadsheet instance
    const doc = new GoogleSpreadsheet(SHEET_ID, serviceAccountAuth);
    
    // Load document info and worksheets
    await doc.loadInfo();
    console.log(`Successfully loaded document: ${doc.title}`);
    
    // Get the first sheet
    const sheet = doc.sheetsByIndex[0];
    console.log(`Working with sheet: ${sheet.title}`);
    
    // Load all rows as objects
    const rows = await sheet.getRows();
    console.log(`Found ${rows.length} rows of data`);
    
    // Prepare data for database import
    const sheetData = rows.map((row, index) => {
      return {
        id: row.get('id') || `prop-${index}`,
        name: row.get('name') || '',
        location: row.get('location') || '',
        price: row.get('price') || '0',
        propertyType: row.get('propertyType') || '',
        bedrooms: row.get('bedrooms') || '0',
        bathrooms: row.get('bathrooms') || '0',
        area: row.get('area') || '0',
        description: row.get('description') || '',
        features: row.get('features') || '',
        images: row.get('images') || '',
        builder: row.get('builder') || '',
        possession: row.get('possession') || '',
        rating: row.get('rating') || '0',
      };
    });
    
    // Import data to database
    const importedProperties = await mongodbStorage.importPropertiesFromSpreadsheet(sheetData);
    console.log(`Successfully imported ${importedProperties.length} properties to database`);
    
    return importedProperties;
  } catch (error) {
    console.error('Error importing from Google Sheets:', error);
    throw error;
  }
}