import { Request, Response } from 'express';
import fs from 'fs';

/**
 * Handler to safely provide the Google Maps API key to the client
 */
export async function mapsApiKeyHandler(req: Request, res: Response) {
  try {
    // Use the environment variable GOOGLE_API_KEY 
    const apiKey = process.env.GOOGLE_API_KEY;
    
    console.log(`Returning Maps API key`);
    res.json({ apiKey });
  } catch (error: any) {
    console.error('Error in maps API key handler:', error);
    res.status(500).json({ 
      error: 'Failed to get Maps API key', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}