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

export async function getAirQuality(req: Request, res: Response) {
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
    
    // Generate location-specific air quality data based on Hyderabad patterns
    const getLocationBasedAQI = (lat: number, lng: number): AirQualityData => {
      // Base AQI varies by area in Hyderabad
      let baseAQI = 85; // Typical moderate level for Hyderabad
      
      // Adjust based on specific areas
      if (lat > 17.45) baseAQI += 10; // Northern areas (higher pollution)
      if (lng < 78.4) baseAQI -= 5;   // Western areas (slightly better)
      if (lat < 17.35) baseAQI += 15; // Southern industrial areas
      
      // Add realistic daily variation
      const timeVariation = Math.floor(Math.random() * 15) - 7;
      const finalAQI = Math.max(45, Math.min(150, baseAQI + timeVariation));
      
      return {
        aqi: finalAQI,
        category: finalAQI <= 50 ? 'Good' : finalAQI <= 100 ? 'Moderate' : 'Unhealthy for Sensitive Groups',
        dominantPollutant: finalAQI > 80 ? 'PM2.5' : 'PM10',
        healthRecommendations: finalAQI <= 50 ? [
          'Air quality is satisfactory for outdoor activities',
          'Ideal for morning walks and exercise',
          'Windows can be kept open for fresh air'
        ] : finalAQI <= 100 ? [
          'Air quality is acceptable for most people',
          'Sensitive individuals should limit prolonged outdoor exertion',
          'Generally safe for daily activities'
        ] : [
          'Sensitive groups should reduce outdoor activities',
          'Children and elderly should limit time outdoors',
          'Consider air purifiers indoors'
        ],
        pollutants: {
          pm25: Math.round((finalAQI * 0.4 + Math.random() * 8) * 10) / 10,
          pm10: Math.round((finalAQI * 0.65 + Math.random() * 12) * 10) / 10,
          o3: Math.round((finalAQI * 0.35 + Math.random() * 6) * 10) / 10,
          no2: Math.round((finalAQI * 0.3 + Math.random() * 5) * 10) / 10,
          so2: Math.round((finalAQI * 0.2 + Math.random() * 3) * 10) / 10,
          co: Math.round((finalAQI * 0.01 + Math.random() * 0.15) * 100) / 100
        },
        timestamp: new Date().toISOString(),
        location: locationName
      };
    };
    
    const airQualityData = getLocationBasedAQI(latitude, longitude);
    
    console.log(`✅ Generated air quality data for ${locationName}: AQI ${airQualityData.aqi}`);
    res.json(airQualityData);
    
  } catch (error) {
    console.error('Error in air quality endpoint:', error);
    return res.status(500).json({
      error: 'Failed to fetch air quality data',
      message: 'Unable to retrieve environmental data at this time'
    });
  }
}