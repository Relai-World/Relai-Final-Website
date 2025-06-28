import React from 'react';
import { useLocation } from 'wouter';

// Define the type for property data
type Property = {
  id: string;
  projectName: string;
  name: string;
  longitude: number;
  latitude: number;
  location: string;
  propertyType: string;
  price: number;
  constructionStatus?: string;
  images?: string[];
};

interface StaticMapWithMarkersProps {
  properties: Property[];
  apiKey: string;
}

/**
 * A component that displays a static Google Map with property markers
 * This approach avoids conflicts with the Google Maps JavaScript API
 */
const StaticMapWithMarkers: React.FC<StaticMapWithMarkersProps> = ({ properties, apiKey }) => {
  const [, navigate] = useLocation();
  
  // Filter out properties without valid coordinates
  const validProperties = properties.filter(property => 
    property.latitude && property.longitude && 
    property.latitude !== 0 && property.longitude !== 0
  );
  
  // Get center coordinates as the average of all property coordinates
  const centerLat = validProperties.reduce((sum, p) => sum + p.latitude, 0) / validProperties.length || 17.4065;
  const centerLng = validProperties.reduce((sum, p) => sum + p.longitude, 0) / validProperties.length || 78.4772;
  
  // Format price for display in the property list
  const formatPrice = (price: number): string => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)} Lac`;
    } else {
      return `₹${price.toLocaleString()}`;
    }
  };
  
  // Navigate to property detail page
  const handlePropertyClick = (propertyId: string) => {
    navigate(`/property/${propertyId}`);
  };
  
  // Create marker pins for the static map
  const markers = validProperties.slice(0, 25).map((property, index) => {
    const label = String.fromCharCode(65 + (index % 26)); // A, B, C, ... Z
    return `&markers=color:blue%7Clabel:${label}%7C${property.latitude},${property.longitude}`;
  }).join('');
  
  // Construct the static map URL
  const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${centerLat},${centerLng}&zoom=12&size=800x500&scale=2&maptype=roadmap${markers}&key=${apiKey}`;
  
  return (
    <div className="w-full mb-8">
      <div className="relative rounded-lg overflow-hidden bg-gray-100">
        {/* Static Map Image */}
        <img 
          src={mapUrl} 
          alt="Property Locations Map" 
          className="w-full h-[500px] object-cover"
          onError={(e) => {
            e.currentTarget.src = 'https://maps.googleapis.com/maps/api/staticmap?center=17.4065,78.4772&zoom=11&size=800x500&key=' + apiKey;
            console.error('Error loading map with markers, falling back to basic map');
          }}
        />
        
        {/* Map Overlay Label */}
        <div className="absolute bottom-4 right-4 z-10">
          <div className="bg-white px-3 py-2 rounded-md shadow-md text-xs">
            <strong>{validProperties.length}</strong> properties on map
          </div>
        </div>
      </div>
      
      {/* Property Legend for markers */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {validProperties.slice(0, 25).map((property, index) => {
          const label = String.fromCharCode(65 + (index % 26)); // A, B, C, ... Z
          return (
            <div 
              key={property.id} 
              className="flex items-center p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handlePropertyClick(property.id)}
            >
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold mr-3">
                {label}
              </div>
              <div className="flex-grow">
                <h4 className="font-medium text-sm line-clamp-1">{property.projectName || property.name}</h4>
                <p className="text-xs text-gray-500 line-clamp-1">{property.location}</p>
              </div>
              <div className="flex-shrink-0 ml-3">
                <span className="text-xs font-semibold">{formatPrice(property.price)}</span>
              </div>
            </div>
          );
        })}
      </div>
      
      {validProperties.length > 25 && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg text-sm">
          <p className="text-gray-700">
            <strong>Note:</strong> Showing 25 of {validProperties.length} properties on the map. Use the list view to see all properties.
          </p>
        </div>
      )}
    </div>
  );
};

export default StaticMapWithMarkers;