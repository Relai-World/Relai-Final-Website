import React, { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';

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
  // If we have valid coordinates, use them directly
  if (lat && lng && lat !== 0 && lng !== 0) {
    return `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${lat},${lng}&zoom=16`;
  }
  
  // For property search, combine propertyName with "real estate" and location for better accuracy
  // The propertyName is the most important identifier for finding the exact project
  const formattedPropertyName = propertyName.replace(/\s+/g, '+');
  const formattedLocation = location.replace(/\s+/g, '+');
  
  // Create a search query that emphasizes finding the property development by name
  const searchQuery = encodeURIComponent(`${formattedPropertyName} real estate project ${formattedLocation} Hyderabad`);
  
  return `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${searchQuery}&zoom=16`;
}

export default function PropertyMap({ latitude, longitude, propertyName, location }: PropertyMapProps) {
  const [mapApiKey, setMapApiKey] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch the Maps API key from our secure endpoint
  useEffect(() => {
    const fetchMapApiKey = async () => {
      try {
        setIsLoading(true);
        const response = await apiRequest<{ apiKey: string }>('/api/maps-api-key');
        if (response && response.apiKey) {
          setMapApiKey(response.apiKey);
          setIsLoading(false);
        } else {
          setError('Could not load map API key');
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error fetching Maps API key:', err);
        setError('Failed to load the map. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchMapApiKey();
  }, []);

  if (isLoading) {
    return (
      <div className="h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="h-10 w-10 border-4 border-t-[#1752FF] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !mapApiKey) {
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
  console.log(`Loading map for ${propertyName} using URL: ${debugUrl}`);
  
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
      ></iframe>
    </div>
  );
}