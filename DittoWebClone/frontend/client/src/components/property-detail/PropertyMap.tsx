import React, { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';
import myImage from '../assets/images/your-image.png';

interface PropertyMapProps {
  latitude: number;
  longitude: number;
  propertyName: string;
  location: string;
}

// Create a Google Maps Embed API URL with optimal search parameters
function createGoogleMapsEmbedUrl(
  apiKey: string, 
  propertyName: string, 
  location: string, 
  lat: number | undefined, 
  lng: number | undefined
): string {
  console.log('🔧 Creating Google Maps URL with:', { apiKey: apiKey ? 'PRESENT' : 'MISSING', propertyName, location, lat, lng });
  
  // If we have valid coordinates, use them directly
  if (lat && lng && lat !== 0 && lng !== 0) {
    const url = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${lat},${lng}&zoom=16`;
    console.log('📍 Using coordinates for map URL:', url.replace(apiKey, 'API_KEY_HIDDEN'));
    return url;
  }
  
  // For property search, combine propertyName with "real estate" and location for better accuracy
  // The propertyName is the most important identifier for finding the exact project
  const formattedPropertyName = propertyName.replace(/\s+/g, '+');
  const formattedLocation = location.replace(/\s+/g, '+');
  
  // Create a search query that emphasizes finding the property development by name
  const searchQuery = encodeURIComponent(`${formattedPropertyName} real estate project ${formattedLocation} Hyderabad`);
  const url = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${searchQuery}&zoom=16`;
  
  console.log('🔍 Using search query for map URL:', url.replace(apiKey, 'API_KEY_HIDDEN'));
  console.log('🔍 Search query details:', { formattedPropertyName, formattedLocation, searchQuery });
  
  return url;
}

export default function PropertyMap({ latitude, longitude, propertyName, location }: PropertyMapProps) {
  const [mapApiKey, setMapApiKey] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  console.log('🗺️ PropertyMap component rendered with props:', { latitude, longitude, propertyName, location });
  
  // Fetch the Maps API key from our secure endpoint
  useEffect(() => {
    const fetchMapApiKey = async () => {
      console.log('🚀 Starting to fetch Maps API key...');
      try {
        setIsLoading(true);
        console.log('📡 Making API request to: http://localhost:5001/api/maps-api-key');
        
        const response = await apiRequest<{ apiKey: string }>('http://localhost:5001/api/maps-api-key');
        console.log('✅ API response received:', response);
        
        if (response && response.apiKey) {
          console.log('🔑 API key received successfully, length:', response.apiKey.length);
          setMapApiKey(response.apiKey);
          setIsLoading(false);
        } else {
          console.error('❌ Invalid API response:', response);
          setError('Could not load map API key');
          setIsLoading(false);
        }
      } catch (err) {
        console.error('💥 Error fetching Maps API key:', err);
        console.error('💥 Error details:', {
          name: err instanceof Error ? err.name : 'Unknown',
          message: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack : undefined
        });
        setError('Failed to load the map. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchMapApiKey();
  }, []);

  console.log('🔄 Component state:', { isLoading, error, hasApiKey: !!mapApiKey });

  if (isLoading) {
    console.log('⏳ Showing loading state');
    return (
      <div className="h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="h-10 w-10 border-4 border-t-[#1752FF] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !mapApiKey) {
    console.log('❌ Showing error state:', { error, hasApiKey: !!mapApiKey });
    return (
      <div className="h-[400px] bg-gray-100 rounded-lg flex flex-col items-center justify-center p-4 text-center">
        <p className="text-gray-500">{error || 'Map cannot be displayed at this time.'}</p>
        <p className="text-sm text-gray-400 mt-2">Property is located at: {location}</p>
      </div>
    );
  }

  // Using Google Maps Embed API which loads in a different way than the Maps JavaScript API
  // This avoids conflicts with the PropertiesMap component that uses the JavaScript API directly
  const mapsUrl = createGoogleMapsEmbedUrl(mapApiKey, propertyName, location, latitude, longitude);
  
  // Log the map URL for debugging (without the API key)
  const debugUrl = mapsUrl.replace(mapApiKey, 'API_KEY_HIDDEN');
  console.log(`🗺️ Loading map for ${propertyName} using URL: ${debugUrl}`);
  console.log('🎯 Final map configuration:', {
    propertyName,
    location,
    latitude,
    longitude,
    hasApiKey: !!mapApiKey,
    urlLength: mapsUrl.length
  });
  
  return (
    <div className="relative h-[400px] rounded-lg overflow-hidden">
      <iframe
        title={`Map of ${propertyName}`}
        width="100%"
        height="100%"
        frameBorder="0"
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        src={mapsUrl}
        onLoad={() => console.log('🗺️ Map iframe loaded successfully')}
        onError={(e) => console.error('🗺️ Map iframe failed to load:', e)}
      ></iframe>
    </div>
  );
}