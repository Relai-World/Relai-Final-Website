import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import ContactPropertyExpertModal from '@/components/ContactPropertyExpertModal';
import { 
  MapPin, 
  Share2, 
  Download, 
  BedDouble, 
  Home, 
  Heart, 
  Star,
  Calendar,
  Navigation2,
  Info,
  RefreshCw,
  CheckCircle2,
  IndianRupee,
  Phone,
  MessageSquare,
  Banknote,
  Building,
  Clock,
  Award,
  Scale
} from 'lucide-react';
import { geocodeAddress } from '@/utils/geocode';

// UI components
import Container from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Property detail components
import PropertyMap from '@/components/property-detail/PropertyMap';
import PropertyNearbyPlaces from '@/components/property-detail/PropertyNearbyPlaces';
import PropertyAirQuality from '@/components/property-detail/PropertyAirQuality';
import PropertyExpertContact from '@/components/property-detail/PropertyExpertContact';
import EnhancedPropertyGallery from '@/components/property-detail/EnhancedPropertyGallery';

// Type for our property
import { Property } from '@shared/schema';

// Type for configuration
interface ConfigurationType {
  type: string;
  sizeRange: number;
  sizeUnit: string;
  facing: string;
  BaseProjectPrice: number;
}
const API_BASE_URL = 'http://localhost:5001';

export default function PropertyDetailPageNew() {
  const { id } = useParams<{ id: string }>();
  const [_, navigate] = useLocation();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [geoCoords, setGeoCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [validImages, setValidImages] = useState<string[]>([]);
  
  const queryClient = useQueryClient();
  
  // Fetch property data from API
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/properties', id],
    queryFn: async () => {
      console.log(`Fetching property with ID: ${id}`);
      const response = await fetch(`http://localhost:5001/api/properties/${encodeURIComponent(id)}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch property: ${response.statusText}`);
      }
      const result = await response.json();
      console.log('API Response:', result); // Debug the full API response
      return result;
    },
    enabled: !!id,
  });
  
  const property = data?.property;
  
  console.log('Property data:', property);
  console.log('Full data object:', data); // Debug the full data object
  
  // Update validImages when property changes
  useEffect(() => {
    if (property && typeof property === 'object') {
      const images = getPropertyImages(property);
      console.log('Generated images for property:', images); // Debug log for generated image URLs
      setValidImages(images);
    } else {
      console.log('Property not available for images, property:', property);
    }
  }, [property]);
  
  useEffect(() => {
    console.log('Property in useEffect:', property);
    if (property && typeof property === 'object') {
      console.log('property.latitude:', property.latitude, 'property.longitude:', property.longitude);
      console.log('Condition (!property.latitude || !property.longitude):', !property.latitude || !property.longitude);
      const address =
        (property as any).ProjectName ||
        property.projectName ||
        property.name ||
        (property as any).Name ||
        (property as any).Area ||
        property.location ||
        (property as any).Location; // fallback to Area if nothing else
      console.log('Computed address:', address);
      if (address) {
        console.log('About to call geocodeAddress with:', address + ', Hyderabad');
        geocodeAddress(address + ', Hyderabad').then((coords: { lat: number; lon: number } | null) => {
          if (coords) {
            setGeoCoords(coords);

            // Persist coordinates to backend
            const propertyId = (property as any)._id?.$oid || (property as any)._id?.toString?.() || property.id;
            console.log('property._id:', (property as any)._id);
            fetch(`/api/properties/${propertyId}/set-coords`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ latitude: coords.lat, longitude: coords.lon }),
            })
              .then(res => res.json())
              .then(data => {
                console.log('Coordinates saved to backend:', data);
                queryClient.invalidateQueries({ queryKey: ['/api/properties', propertyId] });
              })
              .catch(err => {
                console.error('Failed to save coordinates:', err);
              });
          }
        });
      }
    } else {
      console.log('Property not available for geocoding, property:', property);
    }
  }, [property, queryClient]);
  
  // Place the debug useEffect here, after all other hooks
  useEffect(() => {
    console.log('Current validImages state:', validImages);
  }, [validImages]);
  
  // Loading state
  if (isLoading) {
    return (
      <Container className="py-20">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="h-16 w-16 border-4 border-t-[#1752FF] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-lg text-gray-600">Loading property details...</p>
        </div>
      </Container>
    );
  }
  
  // Error state
  if (error || !property) {
    return (
      <Container className="py-20">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <h2 className="text-2xl font-bold text-gray-800">Property Not Found</h2>
          <p className="mt-2 text-gray-600">The property you're looking for doesn't exist or has been removed.</p>
          <Button className="mt-4 bg-[#1752FF]" onClick={() => navigate("/properties")}>
            Browse All Properties
          </Button>
        </div>
      </Container>
    );
  }
  
  // Get Min and Max Budget from database for complete price range
  const getPriceRange = () => {
    // First try to get prices from configurations array
    if (property?.configurations && Array.isArray(property.configurations) && property.configurations.length > 0) {
      const prices = property.configurations
        .map((config: any) => config.BaseProjectPrice)
        .filter((price: number) => price && price > 0);
      
      if (prices.length > 0) {
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        
        console.log('Calculated price range from configurations:', { minPrice, maxPrice, prices });
        
        return {
          minPrice,
          maxPrice
        };
      }
    }
    
    // Fallback to other price fields
    const minBudget = property?.minimumBudget || property?.price || 0;
    const maxBudget = property?.maximumBudget || 0;
    
    // Log the actual property data to see available fields
    console.log('Property data for pricing:', {
      property,
      minimumBudget: property?.minimumBudget,
      maximumBudget: property?.maximumBudget,
      minBudget,
      maxBudget,
      configurations: property?.configurations,
      actualPropertyData: property ? {
        minimumBudget: property.minimumBudget,
        maximumBudget: property.maximumBudget,
        price: property.price,
        configurations: property.configurations
      } : null,
      availableKeys: Object.keys(property || {})
    });
    
    return {
      minPrice: minBudget > 0 ? minBudget : 0,
      maxPrice: maxBudget > 0 ? maxBudget : 0
    };
  };

  // Format price for display
  const formatPrice = (price: number) => {
    if (!price || price === 0) {
      return "Price on Request";
    }
    
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)} Lac`;
    } else {
      return `₹${price.toLocaleString()}`;
    }
  };

  // Format complete price range display
  const formatPriceRange = () => {
    const { minPrice, maxPrice } = getPriceRange();
    
    if (minPrice === 0 && maxPrice === 0) {
      return "Price on Request";
    }
    
    if (minPrice > 0 && maxPrice > 0 && minPrice !== maxPrice) {
      return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
    } else if (minPrice > 0) {
      return `Starting from ${formatPrice(minPrice)}`;
    } else if (maxPrice > 0) {
      return `Up to ${formatPrice(maxPrice)}`;
    }
    
    return "Price on Request";
  };

  const getPropertyImages = (property: Property) => {
    console.log('getPropertyImages called with property:', property);
    console.log('property.images:', property.images);
    
    if (property.images && property.images.length > 0) {
      console.log('Using existing images:', property.images);
      return property.images;
    }
    
    // No fallback images - only use images from property_images folder
    console.log('No images available for this property');
    return [];
  };

  // Parse configurations from string to array
  const parseConfigurations = (configurations: string | any): ConfigurationType[] => {
    console.log('parseConfigurations called with:', configurations);
    
    if (Array.isArray(configurations)) {
      console.log('Configurations is already an array:', configurations);
      return configurations;
    }
    
    if (typeof configurations === 'string') {
      try {
        const parsed = JSON.parse(configurations);
        console.log('Successfully parsed configurations string:', parsed);
        return parsed;
      } catch (e) {
        console.warn('Failed to parse configurations:', e);
        return [];
      }
    }
    
    console.log('Configurations is not an array or string, returning empty array');
    return [];
  };
  
  const configurations = property ? parseConfigurations(property.configurations) : [];
  const imagesToShow = property.images || [];

  const fullImageUrls = imagesToShow.map((imgPath: string) => {
    if (imgPath.startsWith('http')) {
      return imgPath;
    }
    return `${API_BASE_URL}${imgPath}`;
  });

  // Parse configurations
  let unitType = "N/A";
  if (property.configurations) {
    let configs = property.configurations;
    if (typeof configs === "string") {
      try {
        configs = JSON.parse(configs);
      } catch {
        configs = [];
      }
    }
    if (Array.isArray(configs) && configs.length > 0 && configs[0].type) {
      unitType = configs[0].type;
    }
  }

  const unitTypes = Array.isArray(configurations) ? configurations.map((c: any) => c.type).join(", ") : "N/A";

  return (
    <div className="bg-white pb-0">
      {/* Main Content - Add top padding to clear navigation header */}
      <Container className="py-8 pt-24">
        {/* Beautiful Property Header Card - Fixed Layout */}
        <div className="mb-6">
          <Card className="overflow-hidden shadow-xl border-0">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 md:p-8">
              <div className="max-w-full">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                  {/* Project Name Section */}
                  <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/30 hover:bg-white/20 transition-all duration-300">
                    <div className="flex items-center mb-2">
                      <Building className="w-5 h-5 text-white mr-2 flex-shrink-0" />
                      <p className="text-xs text-white uppercase tracking-wider font-semibold">Project Name</p>
                    </div>
                    <p className="text-lg md:text-xl font-bold text-white leading-tight break-words">
                      {(property as any).ProjectName || property.projectName || property.name || "N/A"}
                    </p>
                  </div>
                  
                  {/* Location Section */}
                  <div className="bg-white/25 backdrop-blur-sm rounded-xl p-4 border-2 border-white/50 hover:bg-white/30 transition-all duration-300 shadow-lg">
                    <div className="flex items-center mb-2">
                      <MapPin className="w-5 h-5 text-white mr-2 flex-shrink-0" />
                      <p className="text-xs text-white uppercase tracking-wider font-semibold">Location</p>
                    </div>
                    <p className="text-lg md:text-xl font-bold text-white leading-tight break-words">
                      {(property as any).Area || property.location || 'Hyderabad'}
                    </p>
                  </div>
                  
                  {/* Property Type Section */}
                  <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/30 hover:bg-white/20 transition-all duration-300">
                    <div className="flex items-center mb-2">
                      <Home className="w-5 h-5 text-white mr-2 flex-shrink-0" />
                      <p className="text-xs text-white uppercase tracking-wider font-semibold">Property Type</p>
                    </div>
                    <p className="text-lg md:text-xl font-bold text-white leading-tight break-words">
                      {property.propertyType || 'Apartment'}
                    </p>
                  </div>
                </div>
                
                {/* Developer Section - if available */}
                {(property as any).BuilderName && (
                  <div className="mt-4 md:mt-6">
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border-2 border-white/40 hover:bg-white/25 transition-all duration-300 shadow-lg">
                      <div className="flex items-center mb-2">
                        <Award className="w-5 h-5 text-white mr-2 flex-shrink-0" />
                        <p className="text-xs text-white uppercase tracking-wider font-semibold">Developer</p>
                      </div>
                      <p className="text-lg md:text-xl font-bold text-white leading-tight break-words">
                        {(property as any).BuilderName}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
        {/* Breadcrumbs */}
        <div className="text-sm text-gray-500 mb-6">
          <span onClick={() => navigate("/")} className="hover:text-[#1752FF] cursor-pointer">Home</span> &gt;{' '}
          <span onClick={() => navigate("/properties")} className="hover:text-[#1752FF] cursor-pointer">Properties</span> &gt;{' '}
          <span className="text-[#1752FF]">{(property as any).ProjectName || property.projectName || property.name}</span>
        </div>
        
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Property Content */}
          <div className="md:col-span-2 space-y-6">
          <EnhancedPropertyGallery
              images={fullImageUrls}
              propertyName={property.projectName || property.name}
            />
            {/* Key Details Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Key Details Card */}
              <Card className="overflow-hidden">
                <div className="bg-blue-600 p-3">
                  <h3 className="text-white font-medium flex items-center">
                    <Info className="w-4 h-4 mr-2" />
                    Key Details
                  </h3>
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Project Name</p>
                    <p className="text-lg font-bold text-blue-900">{(property as any)["ProjectName"] || property.projectName || property.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Builder Name</p>
                    <p className="text-lg font-bold text-blue-900">{(property as any)["BuilderName"] || property.developerName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">RERA Number</p>
                    <p className="text-lg font-bold text-blue-900">{(property as any)["RERA_Number"] || property.reraNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Price per Sq.Ft.</p>
                    <p className="text-lg font-bold text-blue-900">
                      {((property as any)["Price_per_sft"] || property.pricePerSqft)
                        ? `₹${((property as any)["Price_per_sft"] || property.pricePerSqft).toLocaleString()}/sq.ft.`
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </Card>
              {/* Specs & Pricing (Merged) */}
              <Card className="overflow-hidden">
                <div className="bg-blue-600 p-3">
                  <h3 className="text-white font-medium flex items-center">
                    <Home className="w-4 h-4 mr-2" />
                    Property Specs & Pricing
                  </h3>
                </div>
                <div className="p-4 space-y-6">
                  <div>
                    <span>Configuration</span>
                    <span>{unitType}</span>
                  </div>
                  <table className="w-full border rounded-lg">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="text-left p-3 font-semibold">Unit Type</th>
                        <th className="text-left p-3 font-semibold">Size</th>
                        <th className="text-left p-3 font-semibold">Facing</th>
                        <th className="text-left p-3 font-semibold">Price*</th>
                      </tr>
                    </thead>
                    <tbody>
                      {configurations.map((config: any, idx: number) => (
                        <tr key={idx} className="border-b last:border-0">
                          <td className="p-3 font-medium">
                            {config.type}
                          </td>
                          <td className="p-3 font-medium">
                            {config.sizeRange} {config.sizeUnit || 'Sq ft'}
                          </td>
                          <td className="p-3 font-medium text-gray-600">
                            {config.facing || 'N/A'}
                          </td>
                          <td className="p-3 font-bold text-blue-900">
                            {formatPrice(config.BaseProjectPrice)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {/* Pricing Details (below table) */}
                  {(() => {
                    const { minPrice, maxPrice } = getPriceRange();
                    const priceRangeText = formatPriceRange();
                    const actualPricePerSqft = (property as any)?.Price_per_sft || property.pricePerSqft || 0;
                    if (minPrice === 0 && maxPrice === 0 && !actualPricePerSqft) {
                    }
                    return (
                      <div className="space-y-4">
                        {minPrice > 0 && (
                          <div>
                            <p className="text-sm text-gray-500">Starting Price</p>
                            <p className="text-lg font-bold text-blue-600">{formatPrice(minPrice)}</p>
                          </div>
                        )}
                        {maxPrice > 0 && (
                          <div>
                            <p className="text-sm text-gray-500">Ending Price</p>
                            <p className="text-lg font-bold text-blue-600">{formatPrice(maxPrice)}</p>
                          </div>
                        )}
                        {minPrice > 0 && maxPrice > 0 && (
                          <div className="pt-3 border-t border-gray-100">
                            <p className="text-sm text-gray-500">Budget Range</p>
                            <p className="text-lg font-bold text-blue-600">{formatPrice(minPrice)} -- {formatPrice(maxPrice)}</p>
                          </div>
                        )}
                        {actualPricePerSqft > 0 && (
                          <div className="pt-2 border-t border-gray-100">
                            <p className="text-sm text-gray-500">Price Per Sq.Ft.</p>
                            <p className="text-lg font-bold text-blue-600">₹{actualPricePerSqft.toLocaleString()}/sq.ft.</p>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </Card>
              {/* Status & Timeline */}
              <Card className="overflow-hidden flex items-center justify-center min-h-[180px]">
                <div className="w-full text-center py-8">
                  <div className="flex flex-col items-center justify-center">
                    <Clock className="w-8 h-8 text-blue-600 mb-2" />
                    <p className="text-lg text-gray-500 mb-1">Possession Date</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {(property as any).Possession_date || property.possessionDate}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
            {/* Description */}
            {property.description && (
              <Card className="p-5">
                <h3 className="text-lg font-semibold mb-3">Description</h3>
                <p className="text-gray-700 whitespace-pre-line">{property.description}</p>
              </Card>
            )}
            {/* Amenities & Location Tabs */}
            <Card>
              <Tabs defaultValue="amenities" className="w-full">
                <div className="border-b">
                  <TabsList className="h-12">
                    <TabsTrigger value="amenities" className="flex-1">Amenities</TabsTrigger>
                    <TabsTrigger value="location" className="flex-1">Location</TabsTrigger>
                    <TabsTrigger value="nearby" className="flex-1">Nearby Places</TabsTrigger>
                    <TabsTrigger value="aqi" className="flex-1">Air Quality</TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="amenities" className="p-5">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {(property.amenities || []).map((amenity: string, index: number) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="text-blue-500 h-5 w-5 flex-shrink-0" />
                        <span>{amenity}</span>
                      </div>
                    ))}
                    {/* Add some default amenities if none are available */}
                    {(!property.amenities || property.amenities.length === 0) && [
                      "Round-the-clock security", 
                      "CCTV surveillance",
                      "Landscaped gardens",
                      "Children's play area"
                    ].map((amenity: string, index: number) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="text-blue-500 h-5 w-5 flex-shrink-0" />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="location" className="p-5">
                  {((property.latitude && property.longitude) || (geoCoords && geoCoords.lat && geoCoords.lon)) ? (
                    <div className="w-full rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-white">
                      {/* Location Header */}
                      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 border-b-4 border-blue-800">
                        <div className="flex items-center text-white">
                          <MapPin className="w-5 h-5 mr-3 flex-shrink-0" />
                          <div>
                            <h3 className="text-lg font-semibold">{(property as any).ProjectName || property.projectName || property.name}</h3>
                            <p className="text-blue-100 text-sm mt-1">{(property as any).Area || property.location}</p>
                            <div className="flex items-center mt-2 text-xs text-blue-200">
                              <Navigation2 className="w-3 h-3 mr-1" />
                              <span>
                                {(property.latitude ?? geoCoords?.lat)?.toFixed(6)}, {(property.longitude ?? geoCoords?.lon)?.toFixed(6)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Map Container */}
                      <div className="h-[400px]">
                        <PropertyMap 
                          latitude={property.latitude ?? geoCoords?.lat!} 
                          longitude={property.longitude ?? geoCoords?.lon!}
                          propertyName={(property as any).ProjectName || property.projectName || property.name}
                          location={(property as any).Area || property.location}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-100 p-8 rounded-lg text-center border border-gray-200">
                      <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">Map location not available for this property</p>
                      <p className="text-sm text-gray-500 mt-1">Contact our experts for location details</p>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="nearby" className="p-5">
                  {(property.latitude && property.longitude) || (geoCoords && geoCoords.lat && geoCoords.lon) ? (
                    <PropertyNearbyPlaces 
                      latitude={property.latitude ?? geoCoords?.lat!} 
                      longitude={property.longitude ?? geoCoords?.lon!}
                      propertyName={(property as any).ProjectName || property.projectName || property.name}
                    />
                  ) : (
                    <div className="bg-gray-100 p-4 rounded text-center">
                      <p>Nearby places information not available</p>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="aqi" className="p-5">
                  {(property.latitude && property.longitude) || (geoCoords && geoCoords.lat && geoCoords.lon) ? (
                    <PropertyAirQuality 
                      latitude={property.latitude ?? geoCoords?.lat!} 
                      longitude={property.longitude ?? geoCoords?.lon!}
                      propertyName={(property as any).ProjectName || property.projectName || property.name}
                      location={(property as any).Area || property.location}
                    />
                  ) : (
                    <div className="bg-gray-100 p-4 rounded text-center">
                      <p>Air quality information not available</p>
                      <p className="text-sm text-gray-500 mt-1">Property coordinates required for air quality data</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </Card>
            {/* Right Column - Contact and Benefits */}
            <div className="space-y-4">
              {/* Contact Card */}
              <Card className="overflow-hidden">
                <div className="bg-blue-600 p-5 text-white">
                  <h3 className="text-xl font-bold mb-2">Interested in this property?</h3>
                  {/* <p className="text-2xl font-bold">{formatPriceRange()}</p> */}
                </div>
                <div className="p-5">
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 mb-4"
                    onClick={() => setIsContactModalOpen(true)}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" /> Contact Property Expert
                  </Button>
                  <div className="flex justify-between gap-2">
                    <Button variant="outline" className="flex-1 flex items-center justify-center gap-2">
                      <Share2 className="h-4 w-4" /> Share
                    </Button>
                    <Button variant="outline" className="flex-1 flex items-center justify-center gap-2">
                      <Heart className="h-4 w-4" /> Save
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1 flex items-center justify-center gap-2 border-blue-200 text-blue-600 hover:bg-blue-50"
                      onClick={() => navigate(`/compare?property=${property.id}`)}
                    >
                      <Scale className="h-4 w-4" /> Compare
                    </Button>
                  </div>
                </div>
              </Card>
              {/* Benefits Card */}
              <Card className="p-5">
                <h3 className="font-bold text-lg mb-4">Relai Buyer Benefits</h3>
                <ul className="space-y-3">
                  <li className="flex gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <span>Legal fees waiver up to ₹10,000</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <span>First EMI covered up to ₹1 Lakh</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <span>Loyalty discount of ₹1 Lakh</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <span>30% discount on interior design</span>
                  </li>
                </ul>
                <div className="mt-4 text-center">
                  <Button variant="link" className="text-blue-600">View All Benefits</Button>
                </div>
              </Card>
              {/* Additional Info Cards */}
              {(property.loanApprovedBanks && property.loanApprovedBanks.length > 0) && (
                <Card className="p-5">
                  <h3 className="font-bold text-lg mb-4">Loan Approved Banks</h3>
                  <div className="flex flex-wrap gap-2">
                    {property.loanApprovedBanks.map((bank: string, index: number) => (
                      <Badge key={index} variant="outline" className="bg-gray-50">
                        {bank}
                      </Badge>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </Container>

      {/* Contact Property Expert Modal */}
      <ContactPropertyExpertModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        propertyName={(property as any)?.ProjectName || property?.projectName || property?.name}
      />
    </div>
  );
}