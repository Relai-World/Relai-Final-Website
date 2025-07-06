import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Container from '@/components/ui/container';
import { 
  X, 
  Plus, 
  MapPin, 
  IndianRupee, 
  Building, 
  Calendar, 
  Star,
  Award,
  ArrowLeft,
  Home,
  Maximize2
} from 'lucide-react';

interface ComparisonProperty {
  id: number;
  propertyId: string;
  projectName: string;
  developerName: string;
  location: string;
  propertyType: string;
  configurations: string;
  minSizeSqft: number;
  maxSizeSqft: number;
  pricePerSqft: number;
  minimumBudget: number;
  maximumBudget: number;
  possessionDate: string;
  reraNumber: string;
  rating?: number;
  images?: string[];
}

export default function PropertyComparisonPage() {
  // Set page title and meta description when component mounts
  useEffect(() => {
    document.title = "Compare Properties in Hyderabad | Relai Real Estate Comparison Tool";
    
    // Set meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Make smarter property decisions. Use Relai\'s comparison tool to evaluate multiple real estate listings by price, size, location, and amenities.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Make smarter property decisions. Use Relai\'s comparison tool to evaluate multiple real estate listings by price, size, location, and amenities.';
      document.getElementsByTagName('head')[0].appendChild(meta);
    }
    
    // Restore title when component unmounts
    return () => {
      document.title = "Genuine, Smarter, and End to End Real Estate Services in Hyderabad";
      // Restore original meta description
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', 'Discover smarter real estate with Relai. Buy RERA verified properties with expert real estate guidance—all in one place');
      }
    };
  }, []);

  const [location, navigate] = useLocation();
  const [selectedProperties, setSelectedProperties] = useState<ComparisonProperty[]>([]);
  const [availableProperties, setAvailableProperties] = useState<ComparisonProperty[]>([]);
  const [showPropertySelector, setShowPropertySelector] = useState(false);

  // Get the initial property from URL parameter
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const initialPropertyId = urlParams.get('property');

  // Fetch the initial property
  const { data: initialPropertyData } = useQuery({
    queryKey: ['/api/property-by-id', initialPropertyId],
    queryFn: () =>
      initialPropertyId
        ? apiRequest(`http://13.235.48.178:5001/api/property-by-id/${initialPropertyId}`)
        : Promise.resolve(undefined),
    enabled: !!initialPropertyId,
  });

  const initialProperty = initialPropertyData?.property || initialPropertyData;

  // Fetch all available properties for comparison
  const { data: allPropertiesData, isLoading: isLoadingProperties } = useQuery({
    queryKey: ['/api/all-properties-db'],
    queryFn: () => apiRequest('/api/all-properties-db'),
  });

  const allProperties = allPropertiesData?.properties || allPropertiesData || [];

  useEffect(() => {
    if (initialProperty && !selectedProperties.find(p => p.id === initialProperty.id)) {
      setSelectedProperties([initialProperty]);
    }
  }, [initialProperty, selectedProperties]);

  useEffect(() => {
    if (allProperties.length > 0) {
      const available = allProperties.filter(
        (prop: any) => !selectedProperties.find(selected => selected.id === prop.id)
      );
      setAvailableProperties(available);
    }
  }, [allProperties, selectedProperties]);

  const addPropertyToComparison = (property: ComparisonProperty) => {
    if (selectedProperties.length < 4) {
      setSelectedProperties([...selectedProperties, property]);
      setShowPropertySelector(false);
    }
  };

  const removePropertyFromComparison = (propertyId: number) => {
    setSelectedProperties(selectedProperties.filter(p => p.id !== propertyId));
  };

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(1)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)} Lac`;
    }
    return `₹${price.toLocaleString()}`;
  };

  const formatPriceRange = (min: number, max: number) => {
    return `${formatPrice(min)} - ${formatPrice(max)}`;
  };

  const formatSize = (min: number, max: number) => {
    if (min === max) return `${min} sq ft`;
    return `${min} - ${max} sq ft`;
  };

  return (
    <Container className="py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Compare Properties</h1>
            <p className="text-gray-600">Compare up to 4 properties side by side</p>
          </div>
        </div>

        {/* Breadcrumbs */}
        <div className="text-sm text-gray-500">
          <span onClick={() => navigate("/")} className="hover:text-[#1752FF] cursor-pointer">Home</span> &gt;{' '}
          <span onClick={() => navigate("/properties")} className="hover:text-[#1752FF] cursor-pointer">Properties</span> &gt;{' '}
          <span className="text-[#1752FF]">Compare</span>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Selected Properties */}
        {selectedProperties.map((property, index) => (
          <Card key={property.id} className="overflow-hidden">
            {/* Property Image */}
            <div className="relative aspect-[4/3] bg-gray-100">
              {property.images && property.images.length > 0 ? (
                <img 
                  src={property.images[0]} 
                  alt={property.projectName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Building className="h-12 w-12 text-gray-400" />
                </div>
              )}
              
              {/* Remove button */}
              <Button
                size="sm"
                variant="outline"
                className="absolute top-2 right-2 h-8 w-8 p-0 bg-white/90 hover:bg-white"
                onClick={() => removePropertyFromComparison(property.id)}
              >
                <X className="h-4 w-4" />
              </Button>

              {/* Property Type Badge */}
              <Badge className="absolute bottom-2 left-2 bg-blue-600 text-white">
                {property.propertyType}
              </Badge>
            </div>

            {/* Property Details */}
            <div className="p-4 space-y-3">
              <div>
                <h3 className="font-bold text-lg leading-tight">{property.projectName}</h3>
                <p className="text-sm text-gray-600">{property.developerName}</p>
              </div>

              <div className="flex items-center gap-1 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                {property.location}
              </div>

              {/* Key Specifications */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Price Range:</span>
                  <span className="font-semibold text-blue-600">
                    {formatPriceRange(property.minimumBudget, property.maximumBudget)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Size:</span>
                  <span className="font-semibold">
                    {formatSize(property.minSizeSqft, property.maxSizeSqft)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Price/sq ft:</span>
                  <span className="font-semibold">₹{property.pricePerSqft.toLocaleString()}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Configurations:</span>
                  <span className="font-semibold">{property.configurations}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Possession:</span>
                  <span className="font-semibold">{property.possessionDate}</span>
                </div>

                {property.reraNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">RERA:</span>
                    <span className="font-semibold text-green-600">✓ Approved</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="pt-3 border-t">
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => navigate('/properties')}
                >
                  View Details
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {/* Add Property Cards */}
        {Array.from({ length: 4 - selectedProperties.length }).map((_, index) => (
          <Card key={`empty-${index}`} className="overflow-hidden border-2 border-dashed border-gray-300">
            <div className="aspect-[4/3] flex items-center justify-center bg-gray-50">
              <Button
                variant="outline"
                size="lg"
                className="flex flex-col items-center gap-2 h-auto py-6 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                onClick={() => setShowPropertySelector(true)}
              >
                <Plus className="h-8 w-8 text-gray-400" />
                <span className="text-gray-600">Add Property</span>
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Property Selector Modal */}
      {showPropertySelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Select Property to Compare</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPropertySelector(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {isLoadingProperties ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-gray-600">Loading properties...</p>
                  </div>
                </div>
              ) : availableProperties.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">No properties available for comparison</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableProperties.slice(0, 12).map((property) => (
                    <Card 
                      key={property.id} 
                      className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => addPropertyToComparison(property)}
                    >
                    <div className="aspect-[4/3] bg-gray-100">
                      {property.images && property.images.length > 0 ? (
                        <img 
                          src={property.images[0]} 
                          alt={property.projectName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Building className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    <div className="p-3">
                      <h3 className="font-semibold text-sm leading-tight">{property.projectName}</h3>
                      <p className="text-xs text-gray-600">{property.location}</p>
                      <p className="text-sm font-semibold text-blue-600 mt-1">
                        {formatPriceRange(property.minimumBudget, property.maximumBudget)}
                      </p>
                    </div>
                  </Card>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </Container>
  );
}