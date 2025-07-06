import React, { useEffect } from 'react';
import { Link } from 'wouter';
import { LandPlotIcon, MapPinIcon, Loader2, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { StarRating } from '@/components/ui/star-rating';
import { apiRequest } from '@/lib/queryClient';

/**
 * Helper to get property image path with correct port
 */
function getPropertyImagePath(property: any): string {
  const API_URL = "http://localhost:5001";
  if (property.images && property.images.length > 0) {
    if (property.images[0].startsWith('http')) return property.images[0];
    // Remove '/property_images/' if present
    const imgName = property.images[0].replace(/^\/property_images\//, '');
    return `${API_URL}/property_images/${imgName}`;
  }
  const name = (property.projectName || property.name || '').toLowerCase().replace(/\s+/g, '_20');
  const loc = (property.location || '').toLowerCase().replace(/\s+/g, '_20');
  if (!name || !loc) return '/img/placeholder-property.png';
  // Remove '/property_images/' from the start if present
  const imgName = `${name}_${loc}_0.jpg`.replace(/^\/property_images\//, '');
  return `${API_URL}/property_images/${imgName}`;
}

interface Property {
  id: number;
  propertyId: string;
  projectName?: string;
  name: string;
  location: string;
  propertyType: string;
  configurations?: string;
  developerName?: string;
  minSizeSqft?: number;
  maxSizeSqft?: number;
  area?: number;
  price_per_sqft?: number;
  pricePerSqft?: number;
  minimumBudget?: number;
  maximumBudget?: number;
  price?: number;
  rating?: number;
  images?: string[];
}

export default function PlotsPage() {
  // Set page title when component mounts
  useEffect(() => {
    document.title = "Land Plots | Relai";
    
    // Restore title when component unmounts
    return () => {
      document.title = "Relai | The Ultimate Real Estate Buying Experience";
    };
  }, []);

  // Fetch plot properties directly from dedicated API endpoint
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/plots-properties'],
    queryFn: () => apiRequest<{ properties: Property[]; total: number }>('/api/plots-properties'),
  });

  // Properties are already filtered for Plot type by the API
  const properties = data?.properties || [];

  console.log('Plots page data:', data);
  console.log('Plot properties count:', properties.length);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 pt-32 pb-12">
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading land plots...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 pt-32 pb-12">
        <div className="text-center py-20">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Error Loading Properties</h2>
          <p className="text-gray-500">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-32 pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Land Plots</h1>
        <p className="text-lg text-gray-600">
          Discover prime land plots for development in and around Hyderabad.
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <span className="text-gray-600">
            Showing {properties.length} land plots
          </span>
        </div>
        <Link href="/all-properties">
          <a className="text-blue-600 hover:underline flex items-center gap-2">
            <LandPlotIcon size={16} />
            View All Properties
          </a>
        </Link>
      </div>

      {/* Property Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property: any) => (
          <Link key={property.id} href={`/property/${property.propertyId}`}>
            <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-200 overflow-hidden">
              <div className="relative overflow-hidden">
                {/* Property Image */}
                <div className="relative h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                  {property.images && property.images.length > 0 ? (
                    <img
                      src={getPropertyImagePath(property)}
                      alt={property.projectName || property.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/img/placeholder-property.png';
                      }}
                    />
                  ) : null}
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <LandPlotIcon size={48} className="text-gray-300" />
                  </div>
                </div>

                {/* Property Type Badge */}
                <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded-md text-xs font-medium">
                  {property.propertyType}
                </div>

                {/* Star Rating */}
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1">
                  <StarRating 
                    rating={property.rating || 4.2} 
                    size="sm" 
                    showNumber={true}
                    className="text-white"
                  />
                </div>
              </div>

              <CardContent className="p-4">
                {/* Property Name */}
                <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">
                  {property.projectName || property.name}
                </h3>

                {/* Location */}
                <div className="flex items-center text-gray-600 mb-3">
                  <MapPinIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span className="text-sm line-clamp-1">{property.location}</span>
                </div>

                {/* Developer */}
                {property.developerName && (
                  <div className="text-sm text-gray-600 mb-3">
                    <span className="font-medium">By:</span> {property.developerName}
                  </div>
                )}

                {/* Plot Area */}
                {(property.minSizeSqft > 0 || property.area > 0) && (
                  <div className="flex flex-col mb-3">
                    <div className="flex items-center gap-1 text-gray-500 mb-1">
                      <span className="text-xs">Plot Area</span>
                    </div>
                    <span className="text-sm font-medium">
                      {property.minSizeSqft > 0 && property.maxSizeSqft > 0 && property.minSizeSqft !== property.maxSizeSqft
                        ? `${property.minSizeSqft}-${property.maxSizeSqft} sq.ft`
                        : `${property.minSizeSqft || property.area} sq.ft`}
                    </span>
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="px-4 pt-0 pb-4">
                <div className="flex justify-between items-end w-full">
                  <div>
                    <p className="text-sm text-gray-500">Price Per Sq.ft</p>
                    <p className="text-lg font-bold text-green-600">
                      {property.price_per_sqft || property.pricePerSqft ? 
                       `₹${(property.price_per_sqft || property.pricePerSqft).toLocaleString()}` : 
                       'N/A'}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Total Price</p>
                    <p className="text-lg font-semibold">
                      {(() => {
                        const minBudget = property.minimumBudget || property.price || 0;
                        const maxBudget = property.maximumBudget || 0;
                        
                        const formatPrice = (price: number) => {
                          if (!price) return 'N/A';
                          if (price >= 10000000) {
                            return `₹${(price / 10000000).toFixed(2)} Cr`;
                          } else if (price >= 100000) {
                            return `₹${(price / 100000).toFixed(2)} Lac`;
                          } else {
                            return `₹${price.toLocaleString()}`;
                          }
                        };
                        
                        if (minBudget === 0 && maxBudget === 0) {
                          return "Price on Request";
                        }
                        
                        if (minBudget > 0 && maxBudget > 0 && minBudget !== maxBudget) {
                          return `${formatPrice(minBudget)} -- ${formatPrice(maxBudget)}`;
                        } else if (minBudget > 0) {
                          return formatPrice(minBudget);
                        } else if (maxBudget > 0) {
                          return formatPrice(maxBudget);
                        }
                        
                        return "Price on Request";
                      })()}
                    </p>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>

      {properties.length === 0 && (
        <div className="py-16 text-center">
          <LandPlotIcon size={48} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">No Land Plots Found</h2>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            No land plots are currently available. Please check back later.
          </p>
        </div>
      )}
    </div>
  );
}