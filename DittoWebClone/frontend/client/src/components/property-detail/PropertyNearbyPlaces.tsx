import React, { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { 
  Hospital, 
  Building2, 
  School as SchoolIcon, 
  Utensils, 
  Coffee, 
  Laptop,
  Train,
  Bus,
  Map as RoadIcon,
  Clock,
  MapPin,
  ChevronDown,
  ChevronUp,
  Star
} from 'lucide-react';

interface PropertyNearbyPlacesProps {
  property_id?: string;  // Adding property_id for caching
  latitude: number;
  longitude: number;
  propertyName: string;
  showTransportationOnly?: boolean;
}

interface PlaceDetail {
  name: string;
  distance: string;
  duration: string;
  rating?: number;
}

interface PlaceCategory {
  type: string;
  count: number;
  places: PlaceDetail[];
}

interface TransitInfo {
  name: string;
  distance: string;
  duration: string;
  type: string;
}

interface NearbyPlacesData {
  amenities: PlaceCategory[];
  transitPoints: TransitInfo[];
}

const PlaceIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'Hospitals':
      return <Hospital className="h-5 w-5 text-red-500" />;
    case 'Shopping Malls':
      return <Building2 className="h-5 w-5 text-purple-500" />;
    case 'Schools':
      return <SchoolIcon className="h-5 w-5 text-blue-500" />;
    case 'Restaurants':
      return <Utensils className="h-5 w-5 text-orange-500" />;
    case 'Supermarkets':
      return <Building2 className="h-5 w-5 text-teal-500" />;
    case 'IT Companies':
      return <Laptop className="h-5 w-5 text-indigo-500" />;
    default:
      return <MapPin className="h-5 w-5 text-gray-500" />;
  }
};

const TransitIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'metro':
      return <Train className="h-5 w-5 text-blue-500" />;
    case 'train':
      return <Train className="h-5 w-5 text-green-500" />;
    case 'highway':
      return <RoadIcon className="h-5 w-5 text-yellow-500" />;
    default:
      return <Bus className="h-5 w-5 text-gray-500" />;
  }
};

export default function PropertyNearbyPlaces({ 
  property_id,
  latitude, 
  longitude, 
  propertyName,
  showTransportationOnly = false
}: PropertyNearbyPlacesProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<NearbyPlacesData | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchNearbyPlaces = async () => {
      try {
        setIsLoading(true);
        let apiUrl = '';
        
        // Use coordinates if available
        if (latitude && longitude && latitude !== 0 && longitude !== 0) {
          apiUrl = `http://localhost:5001/api/property-nearby-places?lat=${latitude}&lng=${longitude}`;
        } 
        // Fall back to property name for geocoding
        else if (propertyName) {
          apiUrl = `http://localhost:5001/api/property-nearby-places?propertyName=${encodeURIComponent(propertyName)}&location=Hyderabad`;
        } 
        // No data available to locate the property
        else {
          setError('Unable to determine property location');
          setIsLoading(false);
          return;
        }
        
        const response = await apiRequest<NearbyPlacesData>(apiUrl);
        setData(response);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching nearby places:', err);
        setError('Failed to load nearby places information');
        setIsLoading(false);
      }
    };

    fetchNearbyPlaces();
  }, [latitude, longitude, propertyName]);

  if (isLoading) {
    return (
      <div className="py-4">
        <div className="h-24 bg-gray-100 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="py-4">
        <p className="text-gray-500 text-center">
          {error || 'Nearby amenities information is not available for this property.'}
        </p>
      </div>
    );
  }

  const toggleCategory = (categoryType: string) => {
    if (expandedCategory === categoryType) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(categoryType);
    }
  };

  return (
    <div className="py-4 space-y-8">
      {/* Nearby Amenities Section - Only show when not in transportation-only mode */}
      {!showTransportationOnly && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-semibold mb-5 text-blue-700">Nearby Amenities (Within 5km)</h3>
          <p className="text-sm text-gray-600 mb-5">High-rated places near this property</p>
          <div className="space-y-4">
            {data.amenities.map((amenity) => (
              <div key={amenity.type} className="bg-gray-50 rounded-lg overflow-hidden shadow-sm">
                <div 
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => toggleCategory(amenity.type)}
                >
                  <div className="flex items-center gap-3">
                    <PlaceIcon type={amenity.type} />
                    <div>
                      <p className="font-medium">{amenity.count}</p>
                      <p className="text-sm text-gray-600">{amenity.type}</p>
                    </div>
                  </div>
                  {amenity.count > 0 && (
                    expandedCategory === amenity.type 
                      ? <ChevronUp className="h-5 w-5 text-gray-500" /> 
                      : <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </div>

                {/* Detailed places list */}
                {expandedCategory === amenity.type && amenity.places.length > 0 && (
                  <div className="border-t border-gray-200 divide-y divide-gray-200">
                    {amenity.places.map((place, idx) => (
                      <div key={idx} className="p-3 pl-12 hover:bg-gray-100">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{place.name}</p>
                          {place.rating && (
                            <div className="flex items-center gap-1 text-amber-500">
                              <Star className="h-4 w-4 fill-current" />
                              <span className="text-sm">{place.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600 mt-1">
                          <p>Distance: {place.distance}</p>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{place.duration}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transportation & Connectivity Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-xl font-semibold mb-4 text-blue-700">Transportation & Connectivity</h3>
        <p className="text-sm text-gray-600 mb-5">Nearby transit points for easy commute</p>
        <div className="space-y-3">
          {data.transitPoints.length === 0 ? (
            <p className="text-gray-500">No transit information available</p>
          ) : (
            data.transitPoints.map((transit, index) => (
              <div 
                key={index} 
                className="bg-gray-50 p-4 rounded-lg flex items-center gap-4 shadow-sm"
              >
                <TransitIcon type={transit.type} />
                <div className="flex-1">
                  <p className="font-medium">{transit.name}</p>
                  <p className="text-sm text-gray-600">Distance: {transit.distance}</p>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">{transit.duration}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}