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
  Building, 
  ArrowLeft
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
    if ((allPropertiesData as any)?.properties && initialPropertyId) {
      const initialProperty = (allPropertiesData as any).properties.find((p: any) => p.id.toString() === initialPropertyId);
      if (initialProperty && selectedProperties.length === 0) {
        setSelectedProperties([initialProperty]);
      }
    }
  }, [allPropertiesData, initialPropertyId]);

  const addPropertyToComparison = (property: any) => {
    if (selectedProperties.length < 3) {
      setSelectedProperties([...selectedProperties, property]);
      setShowPropertySelector(false);
    }
  };

  const removePropertyFromComparison = (propertyId: number) => {
    setSelectedProperties(selectedProperties.filter(p => p.id !== propertyId));
  };

  const formatPrice = (price: number) => {
    if (!price) return 'Price on Request';
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(1)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)} Lac`;
    }
    return `₹${price.toLocaleString()}`;
  };

  const formatPriceRange = (min: number, max: number) => {
    if (!min && !max) return 'Price on Request';
    return `${formatPrice(min)} - ${formatPrice(max)}`;
  };

  // Fix data access - use explicit type checking
  const propertiesArray = (allPropertiesData as any)?.properties || [];
  const availableProperties = propertiesArray.filter(
    (prop: any) => !selectedProperties.find(selected => selected.id === prop.id)
  );
  
  // Debug: Log properties data
  console.log('Total properties from Supabase:', propertiesArray.length);
  console.log('Available for comparison:', availableProperties.length);
  if (availableProperties.length > 0) {
    console.log('Sample property:', availableProperties[0]);
    console.log('Project Price per SFT:', availableProperties[0]['Project Price per SFT']);
    console.log('Builder Reputation:', availableProperties[0]['Builder Reputation & Legal Compliance']);
    console.log('Type of Community:', availableProperties[0]['Type of Community']);
  }
  if (selectedProperties.length > 0) {
    console.log('Selected property data:', selectedProperties[0]);
    console.log('Selected - Project Price per SFT:', selectedProperties[0]['Project Price per SFT']);
    console.log('Selected - Builder Reputation:', selectedProperties[0]['Builder Reputation & Legal Compliance']);
    console.log('Selected - Type of Community:', selectedProperties[0]['Type of Community']);
    console.log('All keys in selected property:', Object.keys(selectedProperties[0]));
  }

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

      {/* Comparison Grid - Adjusted for 3 properties with more details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                {property.PropertyType || 'Property'}
              </Badge>
            </div>

            {/* Property Details - Comprehensive like property detail page */}
            <div className="p-4 space-y-4">
              {/* Header Section */}
              <div>
                <h3 className="font-bold text-lg leading-tight text-gray-900">
                  {property.ProjectName || property.projectName || property.name || 'Property Name'}
                </h3>
                <p className="text-sm text-gray-600 font-medium">
                  By {property.DeveloperName || property.developerName || 'Developer'}
                </p>
                <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                  <MapPin className="h-4 w-4" />
                  {property.Location || property.location || 'Location'}
                </div>
              </div>

              {/* Price & Budget Section */}
              <div className="bg-blue-50 p-3 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Pricing Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Price Range:</span>
                    <span className="font-bold text-blue-600">
                      {(() => {
                        const minBudget = property['Min Budget'] || property.minimumBudget || 0;
                        const maxBudget = property['Max Budget'] || property.maximumBudget || 0;
                        return formatPriceRange(minBudget, maxBudget);
                      })()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Price/sq ft:</span>
                    <span className="font-semibold">
                      {property['Project Price per SFT'] && property['Project Price per SFT'] !== null ? 
                        `₹${Number(property['Project Price per SFT']).toLocaleString()}` : 
                        (property.pricePerSqft ? `₹${Number(property.pricePerSqft).toLocaleString()}` : '₹N/A')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Property Specifications */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Property Specifications</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Size Range:</span>
                    <span className="font-semibold">
                      {property.MinSizeSqft || property.minSizeSqft || 0} - {property.MaxSizeSqft || property.maxSizeSqft || 0} sq ft
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Configurations:</span>
                    <span className="font-semibold">
                      {property.Configurations || property.configurations || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Property Type:</span>
                    <span className="font-semibold">
                      {property.PropertyType || property.propertyType || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Units:</span>
                    <span className="font-semibold">
                      {property.TotalUnits || property.totalUnits || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Area Size:</span>
                    <span className="font-semibold">
                      {property.AreaSizeAcres || property.areaSizeAcres || 'N/A'} acres
                    </span>
                  </div>
                </div>
              </div>

              {/* Legal & Compliance */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Legal & Compliance</h4>
                <div className="space-y-2 text-sm">
                  {(property.RERA_Number || property.reraNumber) && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">RERA Status:</span>
                      <span className="font-semibold text-green-600">✓ Approved</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">RERA Number:</span>
                    <span className="font-semibold text-xs">
                      {property.RERA_Number || property.reraNumber || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Builder Reputation:</span>
                    <span className="font-semibold">
                      {(() => {
                        // Access the raw Supabase data directly from the API response
                        const apiProperty = availableProperties.find(p => p.id === property.id) || selectedProperties.find(p => p.id === property.id);
                        const builderRep = apiProperty?.['Builder Reputation & Legal Compliance'] || property.builderReputation;
                        return builderRep && builderRep.trim() !== '' ? builderRep : 'Information Not available';
                      })()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Timeline & Community */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Timeline & Community</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Possession:</span>
                    <span className="font-semibold">
                      {property.PossessionDate || property.possessionDate || 'TBD'}
                    </span>
                  </div>
                 
                </div>
              </div>

              {/* Safety & Features */}
              {(property['Safety & Security'] || property['Property Type & Space Utilization']) && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Features & Safety</h4>
                  <div className="space-y-2 text-sm">
                    {property['Safety & Security'] && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Safety Rating:</span>
                        <span className="font-semibold text-green-600">★★★★★</span>
                      </div>
                    )}
                    {property['Property Type & Space Utilization'] && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Space Utilization:</span>
                        <span className="font-semibold text-green-600">Excellent</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="pt-3 border-t space-y-2">
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => navigate(`/property/${property.propertyId || property.id}`)}
                >
                  View Full Details
                </Button>
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open(`https://wa.me/918881088890?text=Hi, I'm interested in ${property.ProjectName || property.name}`, '_blank')}
                >
                  WhatsApp Inquiry
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {/* Add Property Cards */}
        {Array.from({ length: 3 - selectedProperties.length }).map((_, index) => (
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                  {availableProperties.map((property: any) => (
                    <Card 
                      key={property.id} 
                      className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-400 hover:scale-105 group"
                      onClick={() => addPropertyToComparison(property)}
                    >
                      {/* Property Image */}
                      <div className="relative aspect-[4/3] bg-gray-100">
                        {property.images && property.images.length > 0 ? (
                          <img 
                            src={property.images[0]} 
                            alt={property.projectName || property.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                            <Building className="h-8 w-8 text-blue-400" />
                          </div>
                        )}
                        
                        {/* Property Type Badge */}
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-blue-600 text-white text-xs">
                            {property.propertyType || property.PropertyType || 'Property'}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Property Details */}
                      <div className="p-4">
                        <div className="space-y-2">
                          {/* Property Name */}
                          <h3 className="font-semibold text-sm leading-tight text-gray-900 line-clamp-2">
                            {property.projectName || property.name || property.ProjectName}
                          </h3>
                          
                          {/* Developer */}
                          <p className="text-xs text-gray-600 truncate">
                            {property.developerName || property.DeveloperName}
                          </p>
                          
                          {/* Location */}
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-gray-400 flex-shrink-0" />
                            <p className="text-xs text-gray-600 truncate">
                              {property.location || property.Location}
                            </p>
                          </div>
                          
                          {/* Price Range */}
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-blue-600">
                              {(() => {
                                const minBudget = property.minimumBudget || property['Min Budget'] || 0;
                                const maxBudget = property.maximumBudget || property['Max Budget'] || 0;
                                return formatPriceRange(minBudget, maxBudget);
                              })()}
                            </p>
                            
                            {/* Size */}
                            <p className="text-xs text-gray-500">
                              {property.minSizeSqft || property.MinSizeSqft || 0} - {property.maxSizeSqft || property.MaxSizeSqft || 0} sq ft
                            </p>
                            
                            {/* Configurations */}
                            {(property.configurations || property.Configurations) && (
                              <p className="text-xs text-gray-500 truncate">
                                {property.configurations || property.Configurations}
                              </p>
                            )}
                          </div>
                        </div>
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