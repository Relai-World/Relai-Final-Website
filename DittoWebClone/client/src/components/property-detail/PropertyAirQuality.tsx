import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Wind, AlertTriangle, CheckCircle, XCircle, Thermometer, Eye, Droplets } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

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

interface PropertyAirQualityProps {
  latitude: number;
  longitude: number;
  propertyName: string;
  location: string;
}

const getAQIColor = (aqi: number): string => {
  if (aqi <= 50) return 'bg-green-500';
  if (aqi <= 100) return 'bg-yellow-500';
  if (aqi <= 150) return 'bg-orange-500';
  if (aqi <= 200) return 'bg-red-500';
  if (aqi <= 300) return 'bg-purple-500';
  return 'bg-red-800';
};

const getAQICategory = (aqi: number): string => {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
};

const getAQIIcon = (aqi: number) => {
  if (aqi <= 50) return <CheckCircle className="w-5 h-5 text-green-600" />;
  if (aqi <= 100) return <Wind className="w-5 h-5 text-yellow-600" />;
  if (aqi <= 150) return <AlertTriangle className="w-5 h-5 text-orange-600" />;
  return <XCircle className="w-5 h-5 text-red-600" />;
};

const getHealthRecommendations = (aqi: number): string[] => {
  if (aqi <= 50) {
    return [
      'Air quality is satisfactory',
      'Outdoor activities are encouraged',
      'Perfect for morning jogs and exercise'
    ];
  }
  if (aqi <= 100) {
    return [
      'Air quality is acceptable',
      'Sensitive individuals should consider limiting outdoor exertion',
      'Generally safe for outdoor activities'
    ];
  }
  if (aqi <= 150) {
    return [
      'Sensitive groups should reduce outdoor activities',
      'Children and elderly should limit time outdoors',
      'Consider wearing masks for extended outdoor exposure'
    ];
  }
  if (aqi <= 200) {
    return [
      'Everyone should reduce outdoor activities',
      'Avoid prolonged outdoor exertion',
      'Keep windows closed and use air purifiers'
    ];
  }
  return [
    'Avoid all outdoor activities',
    'Stay indoors with air purification',
    'Health warning: everyone may experience serious health effects'
  ];
};

export default function PropertyAirQuality({ latitude, longitude, propertyName, location }: PropertyAirQualityProps) {
  const [airQualityData, setAirQualityData] = useState<AirQualityData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAirQuality = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await apiRequest<AirQualityData>(`/api/air-quality?lat=${latitude}&lng=${longitude}&location=${encodeURIComponent(location)}`);
        
        if (response) {
          setAirQualityData(response);
        } else {
          setError('No air quality data available for this location');
        }
      } catch (err) {
        console.error('Error fetching air quality data:', err);
        setError('Unable to fetch air quality data at this time');
      } finally {
        setIsLoading(false);
      }
    };

    if (latitude && longitude) {
      fetchAirQuality();
    } else {
      setError('Location coordinates not available');
      setIsLoading(false);
    }
  }, [latitude, longitude, location]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mr-3" />
          <p className="text-gray-600">Fetching real-time air quality data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-100 p-6 rounded-lg text-center">
        <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 mb-2">{error}</p>
        <p className="text-sm text-gray-500">We'll show air quality data as soon as it becomes available</p>
      </div>
    );
  }

  if (!airQualityData) {
    return (
      <div className="bg-gray-100 p-6 rounded-lg text-center">
        <Wind className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">Air quality data not available for this location</p>
      </div>
    );
  }

  const aqiColor = getAQIColor(airQualityData.aqi);
  const aqiCategory = getAQICategory(airQualityData.aqi);
  const healthRecommendations = getHealthRecommendations(airQualityData.aqi);

  return (
    <div className="space-y-6">
      {/* Main AQI Card */}
      <Card className="overflow-hidden">
        <div className={`${aqiColor} p-6 text-white`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-1">AQI {airQualityData.aqi}</h3>
              <p className="text-lg opacity-90">{aqiCategory}</p>
              <p className="text-sm opacity-75 mt-1">{location}</p>
            </div>
            <div className="text-right">
              {getAQIIcon(airQualityData.aqi)}
              <p className="text-sm opacity-75 mt-2">
                Updated: {new Date(airQualityData.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Dominant Pollutant</p>
              <p className="font-medium">{airQualityData.dominantPollutant}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Location</p>
              <p className="font-medium">{propertyName}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Health Recommendations */}
      <Card className="p-6">
        <h4 className="text-lg font-semibold mb-4 flex items-center">
          <Thermometer className="w-5 h-5 mr-2 text-blue-600" />
          Health Recommendations
        </h4>
        <div className="space-y-2">
          {healthRecommendations.map((recommendation, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-gray-700">{recommendation}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Detailed Pollutant Information */}
      <Card className="p-6">
        <h4 className="text-lg font-semibold mb-4 flex items-center">
          <Eye className="w-5 h-5 mr-2 text-blue-600" />
          Pollutant Levels
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500 uppercase tracking-wide">PM2.5</p>
            <p className="text-lg font-semibold">{airQualityData.pollutants.pm25} μg/m³</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500 uppercase tracking-wide">PM10</p>
            <p className="text-lg font-semibold">{airQualityData.pollutants.pm10} μg/m³</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500 uppercase tracking-wide">O₃</p>
            <p className="text-lg font-semibold">{airQualityData.pollutants.o3} μg/m³</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500 uppercase tracking-wide">NO₂</p>
            <p className="text-lg font-semibold">{airQualityData.pollutants.no2} μg/m³</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500 uppercase tracking-wide">SO₂</p>
            <p className="text-lg font-semibold">{airQualityData.pollutants.so2} μg/m³</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500 uppercase tracking-wide">CO</p>
            <p className="text-lg font-semibold">{airQualityData.pollutants.co} mg/m³</p>
          </div>
        </div>
      </Card>

      {/* AQI Scale Reference */}
      <Card className="p-6">
        <h4 className="text-lg font-semibold mb-4 flex items-center">
          <Droplets className="w-5 h-5 mr-2 text-blue-600" />
          AQI Scale Reference
        </h4>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="font-medium">0-50:</span>
            <span className="text-gray-700">Good</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span className="font-medium">51-100:</span>
            <span className="text-gray-700">Moderate</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
            <span className="font-medium">101-150:</span>
            <span className="text-gray-700">Unhealthy for Sensitive Groups</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="font-medium">151-200:</span>
            <span className="text-gray-700">Unhealthy</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-purple-500 rounded"></div>
            <span className="font-medium">201-300:</span>
            <span className="text-gray-700">Very Unhealthy</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-red-800 rounded"></div>
            <span className="font-medium">301+:</span>
            <span className="text-gray-700">Hazardous</span>
          </div>
        </div>
      </Card>
    </div>
  );
}