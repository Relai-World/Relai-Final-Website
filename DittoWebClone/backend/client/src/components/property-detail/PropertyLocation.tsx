import { PropertyLocation as LocationType, NearbyPlace } from '@/lib/models/property';
import { 
  MapPin, 
  Navigation, 
  School, 
  Activity, 
  ShoppingBag, 
  Trees, 
  Train, 
  Utensils, 
  Bus, 
  Plane, 
  Timer 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PropertyLocationProps {
  location: LocationType;
  nearbyPlaces: NearbyPlace[];
}

export default function PropertyLocation({ location, nearbyPlaces }: PropertyLocationProps) {
  const getPlaceIcon = (type: string) => {
    switch (type) {
      case 'School':
        return <School className="h-4 w-4" />;
      case 'Hospital':
        return <Activity className="h-4 w-4" />;
      case 'Mall':
        return <ShoppingBag className="h-4 w-4" />;
      case 'Park':
        return <Trees className="h-4 w-4" />;
      case 'Metro':
        return <Train className="h-4 w-4" />;
      case 'Restaurant':
        return <Utensils className="h-4 w-4" />;
      case 'Bus Stand':
        return <Bus className="h-4 w-4" />;
      case 'Airport':
        return <Plane className="h-4 w-4" />;
      case 'Railway Station':
        return <Train className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  // Group nearby places by type
  const placesGroupedByType = nearbyPlaces.reduce((acc, place) => {
    if (!acc[place.type]) {
      acc[place.type] = [];
    }
    acc[place.type].push(place);
    return acc;
  }, {} as Record<string, NearbyPlace[]>);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-xl font-bold mb-6">Location</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="flex items-start mb-4">
            <MapPin className="h-5 w-5 text-[#1752FF] mt-1 mr-2" />
            <div>
              <h4 className="font-medium text-gray-900">Address</h4>
              <p className="text-gray-600 mt-1">
                {location.address}, {location.locality}, {location.city}, {location.state} - {location.pincode}
              </p>
            </div>
          </div>

          <div className="bg-gray-100 rounded-lg p-5 mt-6">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
              <Navigation className="h-4 w-4 text-[#1752FF] mr-2" />
              Nearby Landmarks
            </h4>

            <div className="space-y-6">
              {Object.keys(placesGroupedByType).map((type) => (
                <div key={type}>
                  <Badge variant="outline" className="mb-2 bg-[#F0F4FF] text-[#1752FF] border-[#1752FF]">
                    {type}
                  </Badge>
                  
                  <div className="space-y-3">
                    {placesGroupedByType[type].map((place, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="mr-2 text-gray-500">
                            {getPlaceIcon(place.type)}
                          </div>
                          <span className="text-gray-800">{place.name}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <span className="text-gray-600 mr-2">{place.distance}</span>
                          {place.travelTime && (
                            <span className="flex items-center text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full text-xs">
                              <Timer className="h-3 w-3 mr-1" />
                              {place.travelTime}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          {/* Map placeholder - in a real project, we would add an actual map integration */}
          <div className="h-80 bg-gray-200 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <MapPin className="h-8 w-8 mx-auto mb-2" />
              <p>Interactive Map</p>
              <p className="text-sm mt-1">Map would be displayed here with the property location</p>
              {location.coordinates && (
                <div className="text-xs mt-2">
                  Lat: {location.coordinates.latitude}, Long: {location.coordinates.longitude}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 flex justify-between space-x-4">
            <button className="flex-1 py-2 text-sm text-[#1752FF] bg-[#F0F4FF] rounded-md hover:bg-[#e6ecff]">
              Get Directions
            </button>
            <button className="flex-1 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200">
              Explore Neighborhood
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}