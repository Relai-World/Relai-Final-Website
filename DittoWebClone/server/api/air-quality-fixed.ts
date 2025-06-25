import type { Request, Response } from "express";

interface AirQualityData {
  aqi: number;
  category: string;
  dominantPollutant: string;
  healthRecommendations: string[];
  pollutants: {
    pm25: number;
    pm10: number;
    o3: number;
    no2: number;
    so2: number;
    co: number;
  };
  timestamp: string;
  location: string;
}

export async function getAirQualityFixed(req: Request, res: Response) {
  try {
    const { lat, lng, location } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({
        error: 'Missing required parameters: lat and lng'
      });
    }
    
    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lng as string);
    const locationName = location as string || 'Unknown Location';
    
    // Validate coordinates
    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        error: 'Invalid coordinates provided'
      });
    }
    
    console.log(`🌿 Getting air quality data for: ${locationName} (${latitude}, ${longitude})`);
    
    // Since you want to use the Google Air Quality API, please provide your Google Air Quality API key
    // For now, I'll return location-specific data to avoid rate limiting issues
    
    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
    
    if (!GOOGLE_API_KEY) {
      console.log('⚠️ Google API key not available for air quality data');
      return res.status(500).json({
        error: 'Google API key required',
        message: 'Please provide your Google Air Quality API key to fetch real-time data'
      });
    }
    
    // Try to use Google's Air Quality API
    try {
      const airQualityUrl = 'https://airquality.googleapis.com/v1/currentConditions:lookup';
      
      const requestBody = {
        universalAqi: true,
        location: {
          latitude: latitude,
          longitude: longitude
        },
        extraComputations: [
          "HEALTH_RECOMMENDATIONS",
          "DOMINANT_POLLUTANT_CONCENTRATION",
          "POLLUTANT_CONCENTRATION"
        ]
      };
      
      const response = await fetch(`${airQualityUrl}?key=${GOOGLE_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data && data.indexes && data.indexes.length > 0) {
          const mainIndex = data.indexes[0];
          const pollutants = { pm25: 0, pm10: 0, o3: 0, no2: 0, so2: 0, co: 0 };
          
          if (data.pollutants) {
            data.pollutants.forEach((pollutant: any) => {
              const code = pollutant.code;
              const concentration = pollutant.concentration?.value || 0;
              
              if (code in pollutants) {
                (pollutants as any)[code] = concentration;
              }
            });
          }
          
          const airQualityData: AirQualityData = {
            aqi: mainIndex.aqi || 0,
            category: mainIndex.category || 'Unknown',
            dominantPollutant: mainIndex.dominantPollutant || 'Unknown',
            healthRecommendations: data.healthRecommendations?.general || ['Monitor air quality conditions'],
            pollutants: pollutants,
            timestamp: data.dateTime || new Date().toISOString(),
            location: locationName
          };
          
          console.log(`✅ Successfully fetched real air quality data for ${locationName}: AQI ${airQualityData.aqi}`);
          return res.json(airQualityData);
        }
      }
    } catch (apiError) {
      console.log('⚠️ Google Air Quality API not available, please configure API access');
    }
    
    // Return helpful message asking for proper API configuration
    return res.status(503).json({
      error: 'Air Quality API not configured',
      message: 'Please provide access to Google\'s Air Quality API to fetch real-time environmental data for property locations',
      location: locationName
    });
    
  } catch (error) {
    console.error('Error in air quality endpoint:', error);
    return res.status(500).json({
      error: 'Failed to fetch air quality data',
      message: 'Unable to retrieve environmental data at this time'
    });
  }
}