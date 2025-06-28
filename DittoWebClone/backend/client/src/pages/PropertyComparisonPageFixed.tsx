import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
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
  ArrowLeft,
  Scale
} from 'lucide-react';

export default function PropertyComparisonPage() {
  const [location, navigate] = useLocation();
  const [selectedProperties, setSelectedProperties] = useState<any[]>([]);
  const [showPropertySelector, setShowPropertySelector] = useState(false);

  // Get the initial property from URL parameter
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const initialPropertyId = urlParams.get('property');

  // Fetch all available properties for comparison
  const { data: allPropertiesData, isLoading } = useQuery({
    queryKey: ['/api/all-properties-db'],
  });

  useEffect(() => {
    if (allPropertiesData && (allPropertiesData as any).properties && initialPropertyId) {
      const initialProperty = (allPropertiesData as any).properties.find((p: any) => p.id.toString() === initialPropertyId);
      if (initialProperty && selectedProperties.length === 0) {
        setSelectedProperties([initialProperty]);
      }
    }
  }, [allPropertiesData, initialPropertyId, selectedProperties]);

  const addPropertyToComparison = (property: any) => {
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

  const availableProperties = (allPropertiesData && (allPropertiesData as any).properties) ? 
    (allPropertiesData as any).properties.filter((prop: any) => !selectedProperties.find(selected => selected.id === prop.id)) : [];

  return (
    <Container className="py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
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
        {selectedProperties.map((property) => (
          <Card key={property.id} className="overflow-hidden">
            {/* Property Image */}
            <div className="relative aspect-[4/3] bg-gray-100">
              <div className="w-full h-full flex items-center justify-center">
                <Building className="h-12 w-12 text-gray-400" />
              </div>
              
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
                {property.PropertyType || property.propertyType}
              </Badge>
            </div>

            {/* Property Details */}
            <div className="p-4 space-y-3">
              <div>
                <h3 className="font-bold text-lg leading-tight">{property.ProjectName || property.projectName}</h3>
                <p className="text-sm text-gray-600">{property.DeveloperName || property.developerName}</p>
              </div>

              <div className="flex items-center gap-1 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                {property.Location || property.location}
              </div>

              {/* Key Specifications */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Price Range:</span>
                  <span className="font-semibold text-blue-600">
                    {formatPriceRange(
                      property['Min Budget'] || property.minimumBudget || 0,
                      property['Max Budget'] || property.maximumBudget || 0
                    )}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Size:</span>
                  <span className="font-semibold">
                    {property.MinSizeSqft || property.minSizeSqft || 0} - {property.MaxSizeSqft || property.maxSizeSqft || 0} sq ft
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Price/sq ft:</span>
                  <span className="font-semibold">₹{(property['Project Price per SFT'] || property.pricePerSqft || 0).toLocaleString()}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Configurations:</span>
                  <span className="font-semibold">{property.Configurations || property.configurations || 'N/A'}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Possession:</span>
                  <span className="font-semibold">{property.PossessionDate || property.possessionDate || 'TBD'}</span>
                </div>

                {(property.RERA_Number || property.reraNumber) && (
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
                  onClick={() => navigate(`/property/${property.id.toString()}`)}
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
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-gray-600">Loading properties...</p>
                  </div>
                </div>
              ) : availableProperties.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">No more properties available for comparison</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableProperties.slice(0, 12).map((property: any) => (
                    <Card 
                      key={property.id} 
                      className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-400"
                      onClick={() => addPropertyToComparison(property)}
                    >
                      <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center">
                        <Building className="h-8 w-8 text-gray-400" />
                      </div>
                      
                      <div className="p-3">
                        <h3 className="font-semibold text-sm leading-tight">{property.ProjectName || property.projectName}</h3>
                        <p className="text-xs text-gray-600">{property.Location || property.location}</p>
                        <p className="text-sm font-semibold text-blue-600 mt-1">
                          {formatPriceRange(
                            property['Min Budget'] || property.minimumBudget || 0,
                            property['Max Budget'] || property.maximumBudget || 0
                          )}
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