import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Container from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Building, 
  MapPin, 
  X, 
  Plus, 
  CheckCircle, 
  Star,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Award,
  Crown,
  Shield
} from 'lucide-react';
import { Link, useLocation } from 'wouter';

// Format price helper function
const formatPriceRange = (min: number, max: number) => {
  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(1)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)} Lac`;
    } else {
      return `₹${price.toLocaleString()}`;
    }
  };
  
  // Debug logging
  console.log('formatPriceRange called with:', { min, max });
  
  if (min > 0 && max > 0 && max !== min) {
    return `${formatPrice(min)} - ${formatPrice(max)}`;
  } else if (min > 0) {
    return formatPrice(min);
  } else if (max > 0) {
    return formatPrice(max);
  } else {
    return 'Price not available';
  }
};

// Helper function to determine best value for comparison
const getBestProperty = (properties: any[], getValue: (prop: any) => number, lowerIsBetter = false) => {
  if (properties.length === 0) return null;
  
  let bestIndex = 0;
  let bestValue = getValue(properties[0]);
  
  for (let i = 1; i < properties.length; i++) {
    const currentValue = getValue(properties[i]);
    if (lowerIsBetter ? currentValue < bestValue : currentValue > bestValue) {
      bestValue = currentValue;
      bestIndex = i;
    }
  }
  
  return bestIndex;
};

// Helper component for comparison indicator
const ComparisonIndicator = ({ isBest, isWorst }: { isBest: boolean; isWorst: boolean }) => {
  if (isBest) {
    return <Crown className="w-4 h-4 text-yellow-500 ml-2" />;
  }
  if (isWorst) {
    return <TrendingDown className="w-4 h-4 text-red-500 ml-2" />;
  }
  return null;
};

export default function PropertyComparisonTable() {
  const [selectedProperties, setSelectedProperties] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [, navigate] = useLocation();

  // Fetch all properties for selection
  const { data: propertiesData, isLoading } = useQuery({
    queryKey: ['/api/all-properties-db'],
    enabled: true
  });

  const propertiesArray = (propertiesData as any)?.properties || [];

  // Filter available properties (exclude already selected ones)
  const availableProperties = propertiesArray.filter(
    (prop: any) => !selectedProperties.find(selected => selected.id === prop.id)
  ).filter((prop: any) => 
    searchTerm === '' || 
    (prop.ProjectName || prop.projectName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (prop.Location || prop.location || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Debug: Log properties data
  console.log('Total properties from Supabase:', propertiesArray.length);
  console.log('Available for comparison:', availableProperties.length);
  console.log('Selected properties count:', selectedProperties.length);
  if (propertiesArray.length > 0) {
    console.log('Sample property:', propertiesArray[0]);
    console.log('Property keys:', Object.keys(propertiesArray[0]));
  }

  const addPropertyToComparison = (property: any) => {
    if (selectedProperties.length < 3) {
      setSelectedProperties([...selectedProperties, property]);
    }
  };

  const removePropertyFromComparison = (propertyId: number) => {
    setSelectedProperties(selectedProperties.filter(prop => prop.id !== propertyId));
  };

  const handleViewDetails = (property: any) => {
    navigate(`/property/${property.id}`);
  };

  const handleWhatsApp = (property: any) => {
    const propertyName = property.ProjectName || property.projectName || 'this property';
    const location = property.Location || property.location || '';
    const priceInfo = property.minimumBudget ? `Price: ₹${(property.minimumBudget/100000).toFixed(1)} Lac` : 'Price on request';
    
    const message = `Hi! I'm interested in ${propertyName}${location ? ` located in ${location}` : ''}. ${priceInfo}. Could you please provide more details?`;
    const whatsappUrl = `https://wa.me/919390905151?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Container className="pt-16 pb-8">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-2xl p-8 mb-8 text-white shadow-xl mt-4">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/properties" className="text-white hover:text-blue-200 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">Property Comparison Hub</h1>
            <p className="text-blue-100 text-lg">Compare properties side-by-side to make informed decisions</p>
          </div>
          <div className="text-right">
            <Badge className="bg-white/20 text-white border-white/30 text-lg px-4 py-2">
              {selectedProperties.length}/3 Properties
            </Badge>
          </div>
        </div>
        
        {selectedProperties.length > 0 && (
          <div className="flex gap-4 mt-6">
            {selectedProperties.map((property, index) => (
              <div key={property.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-3 flex-1">
                <div className="text-sm font-medium text-blue-100">Property {index + 1}</div>
                <div className="font-bold text-white truncate">
                  {property.ProjectName || property.projectName}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Property Selection - Smart Hiding when 3 properties selected */}
      {selectedProperties.length < 3 && (
        <div className="mb-8 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Add Properties to Compare</h2>
        
        <Input
          placeholder="Search properties by name or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4"
        />

        {/* Debug info */}
        {isLoading && (
          <div className="text-center py-4">
            <p className="text-gray-600">Loading properties...</p>
          </div>
        )}
        
        {!isLoading && availableProperties.length === 0 && (
          <div className="text-center py-4">
            <p className="text-gray-600">No properties found. Total in database: {propertiesArray.length}</p>
            {propertiesArray.length > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                Try clearing the search or check if all properties are already selected for comparison.
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
          {!isLoading && availableProperties.map((property: any) => (
              <div key={property.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-sm mb-1 line-clamp-2">
                  {property.ProjectName || property.projectName || property.name}
                </h3>
                <p className="text-xs text-gray-600 mb-2">
                  By {property.DeveloperName || property.developerName}
                </p>
                <div className="flex items-center text-xs text-gray-500 mb-3">
                  <MapPin className="w-3 h-3 mr-1" />
                  <span>{property.Location || property.location}</span>
                </div>
                <Button
                  size="sm"
                  onClick={() => addPropertyToComparison(property)}
                  className="w-full text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add to Compare
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table-Style Property Comparison */}
      {selectedProperties.length > 0 && (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden mt-8">
          {/* Header Section */}
          <div className="bg-gray-50 p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">COMPARE PROPERTIES</h2>
            
            {/* Property Cards Row */}
            <div className="grid gap-4" style={{ gridTemplateColumns: `280px repeat(${selectedProperties.length}, 1fr)` }}>
              <div className="flex items-end pb-2">
                <span className="text-gray-600 font-medium">Property Parameters</span>
              </div>
              
              {selectedProperties.map((property) => (
                <div key={property.id} className="bg-white rounded-lg border border-gray-200 p-4 relative">
                  <button
                    onClick={() => removePropertyFromComparison(property.id)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Building className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2 min-h-[2.5rem]">
                      {property.ProjectName || property.projectName || property.name}
                    </h3>
                    <p className="text-xs text-gray-600 mb-2">
                      By {property.DeveloperName || property.developerName}
                    </p>
                    <div className="flex items-center justify-center text-xs text-gray-500">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span className="truncate">{property.Location || property.location}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comparison Table */}
          <div className="divide-y divide-gray-200">
            
            {/* Price Range */}
            <div className="grid items-center py-6 px-6 bg-gradient-to-r from-blue-50 to-indigo-50" style={{ gridTemplateColumns: `280px repeat(${selectedProperties.length}, 1fr)` }}>
              <div className="font-semibold text-gray-900 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                Price Range
              </div>
              {selectedProperties.map((property, index) => {
                const minBudget = property.minimumBudget || property.price || 0;
                const maxBudget = property.maximumBudget || 0;
                const avgPrice = (minBudget + maxBudget) / 2;
                
                const bestPriceIndex = getBestProperty(selectedProperties, (p) => {
                  const min = p.minimumBudget || p.price || 0;
                  const max = p.maximumBudget || 0;
                  return (min + max) / 2;
                }, true); // lower is better for price
                
                const isBest = index === bestPriceIndex;
                const isWorst = selectedProperties.length > 1 && !isBest && avgPrice === Math.max(...selectedProperties.map(p => {
                  const min = p.minimumBudget || p.price || 0;
                  const max = p.maximumBudget || 0;
                  return (min + max) / 2;
                }));
                
                return (
                  <div key={property.id} className={`text-center p-4 rounded-lg transition-all ${
                    isBest ? 'bg-green-100 border-2 border-green-300' : 
                    isWorst ? 'bg-red-50 border border-red-200' : 'bg-white border border-gray-200'
                  }`}>
                    <div className="flex items-center justify-center">
                      <span className={`font-bold text-lg ${
                        isBest ? 'text-green-700' : isWorst ? 'text-red-600' : 'text-blue-600'
                      }`}>
                        {formatPriceRange(minBudget, maxBudget)}
                      </span>
                      <ComparisonIndicator isBest={isBest} isWorst={isWorst} />
                    </div>
                    {isBest && <div className="text-xs text-green-600 font-medium mt-1">Best Value</div>}
                    {isWorst && <div className="text-xs text-red-500 font-medium mt-1">Highest Price</div>}
                  </div>
                );
              })}
            </div>

            {/* Price per sq ft */}
            <div className="grid items-center py-5 px-6 bg-gradient-to-r from-gray-50 to-slate-50" style={{ gridTemplateColumns: `280px repeat(${selectedProperties.length}, 1fr)` }}>
              <div className="font-semibold text-gray-900 flex items-center">
                <Building className="w-5 h-5 mr-2 text-gray-600" />
                Price/sq ft
              </div>
              {selectedProperties.map((property, index) => {
                const pricePerSqft = Number(property['Project Price per SFT']) || 0;
                
                const bestPricePerSqftIndex = getBestProperty(selectedProperties, (p) => 
                  Number(p['Project Price per SFT']) || 0, true);
                
                const isBest = index === bestPricePerSqftIndex && pricePerSqft > 0;
                const isWorst = selectedProperties.length > 1 && !isBest && pricePerSqft > 0 && 
                  pricePerSqft === Math.max(...selectedProperties.map(p => Number(p['Project Price per SFT']) || 0));
                
                return (
                  <div key={property.id} className={`text-center p-3 rounded-lg transition-all ${
                    isBest ? 'bg-green-100 border-2 border-green-300' : 
                    isWorst ? 'bg-red-50 border border-red-200' : 'bg-white border border-gray-200'
                  }`}>
                    <div className="flex items-center justify-center">
                      <span className={`font-bold ${
                        isBest ? 'text-green-700' : isWorst ? 'text-red-600' : 'text-gray-900'
                      }`}>
                        {pricePerSqft ? `₹${pricePerSqft.toLocaleString()}` : '₹N/A'}
                      </span>
                      <ComparisonIndicator isBest={isBest} isWorst={isWorst} />
                    </div>
                    {isBest && <div className="text-xs text-green-600 font-medium mt-1">Best Rate</div>}
                    {isWorst && <div className="text-xs text-red-500 font-medium mt-1">Highest Rate</div>}
                  </div>
                );
              })}
            </div>

            {/* Size Range */}
            <div className="grid items-center py-5 px-6 bg-gradient-to-r from-emerald-50 to-teal-50" style={{ gridTemplateColumns: `280px repeat(${selectedProperties.length}, 1fr)` }}>
              <div className="font-semibold text-gray-900 flex items-center">
                <Award className="w-5 h-5 mr-2 text-emerald-600" />
                Size Range
              </div>
              {selectedProperties.map((property, index) => {
                const minSize = property.MinSizeSqft || property.minSizeSqft || 0;
                const maxSize = property.MaxSizeSqft || property.maxSizeSqft || 0;
                const avgSize = (minSize + maxSize) / 2;
                
                const bestSizeIndex = getBestProperty(selectedProperties, (p) => {
                  const min = p.MinSizeSqft || p.minSizeSqft || 0;
                  const max = p.MaxSizeSqft || p.maxSizeSqft || 0;
                  return (min + max) / 2;
                });
                
                const isBest = index === bestSizeIndex && avgSize > 0;
                const isWorst = selectedProperties.length > 1 && !isBest && avgSize > 0 && 
                  avgSize === Math.min(...selectedProperties.map(p => {
                    const min = p.MinSizeSqft || p.minSizeSqft || 0;
                    const max = p.MaxSizeSqft || p.maxSizeSqft || 0;
                    return (min + max) / 2;
                  }).filter(size => size > 0));
                
                return (
                  <div key={property.id} className={`text-center p-3 rounded-lg transition-all ${
                    isBest ? 'bg-emerald-100 border-2 border-emerald-300' : 
                    isWorst ? 'bg-orange-50 border border-orange-200' : 'bg-white border border-gray-200'
                  }`}>
                    <div className="flex items-center justify-center">
                      <span className={`font-bold ${
                        isBest ? 'text-emerald-700' : isWorst ? 'text-orange-600' : 'text-gray-900'
                      }`}>
                        {minSize && maxSize ? `${minSize} - ${maxSize} sq ft` : 'N/A'}
                      </span>
                      <ComparisonIndicator isBest={isBest} isWorst={isWorst} />
                    </div>
                    {isBest && <div className="text-xs text-emerald-600 font-medium mt-1">Largest Space</div>}
                    {isWorst && <div className="text-xs text-orange-500 font-medium mt-1">Smallest Space</div>}
                  </div>
                );
              })}
            </div>

            {/* Configurations */}
            <div className="grid items-center py-5 px-6 bg-gradient-to-r from-purple-50 to-pink-50" style={{ gridTemplateColumns: `280px repeat(${selectedProperties.length}, 1fr)` }}>
              <div className="font-semibold text-gray-900 flex items-center">
                <Building className="w-5 h-5 mr-2 text-purple-600" />
                Configurations
              </div>
              {selectedProperties.map((property) => (
                <div key={property.id} className="text-center p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <span className="font-bold text-purple-700 bg-purple-100 px-3 py-1 rounded-full text-sm">
                    {property.Configurations || property.configurations || 'N/A'}
                  </span>
                </div>
              ))}
            </div>

            {/* Property Type */}
            <div className="grid items-center py-5 px-6 bg-gradient-to-r from-indigo-50 to-blue-50" style={{ gridTemplateColumns: `280px repeat(${selectedProperties.length}, 1fr)` }}>
              <div className="font-semibold text-gray-900 flex items-center">
                <Building className="w-5 h-5 mr-2 text-indigo-600" />
                Property Type
              </div>
              {selectedProperties.map((property) => (
                <div key={property.id} className="text-center p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <span className="font-bold text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full text-sm">
                    {property.PropertyType || 'Apartment'}
                  </span>
                </div>
              ))}
            </div>

            {/* Total Units */}
            <div className="grid items-center py-5 px-6 bg-gradient-to-r from-orange-50 to-amber-50" style={{ gridTemplateColumns: `280px repeat(${selectedProperties.length}, 1fr)` }}>
              <div className="font-semibold text-gray-900 flex items-center">
                <Building className="w-5 h-5 mr-2 text-orange-600" />
                Total Units
              </div>
              {selectedProperties.map((property, index) => {
                const totalUnits = Number(property.TotalUnits || property.totalUnits || 0);
                
                const bestUnitsIndex = getBestProperty(selectedProperties, (p) => 
                  Number(p.TotalUnits || p.totalUnits || 0));
                
                const isBest = index === bestUnitsIndex && totalUnits > 0;
                const isWorst = selectedProperties.length > 1 && !isBest && totalUnits > 0 && 
                  totalUnits === Math.min(...selectedProperties.map(p => Number(p.TotalUnits || p.totalUnits || 0)).filter(units => units > 0));
                
                return (
                  <div key={property.id} className={`text-center p-3 rounded-lg transition-all ${
                    isBest ? 'bg-orange-100 border-2 border-orange-300' : 
                    isWorst ? 'bg-gray-50 border border-gray-200' : 'bg-white border border-gray-200'
                  }`}>
                    <div className="flex items-center justify-center">
                      <span className={`font-bold ${
                        isBest ? 'text-orange-700' : 'text-gray-900'
                      }`}>
                        {totalUnits || 'N/A'}
                      </span>
                      <ComparisonIndicator isBest={isBest} isWorst={isWorst} />
                    </div>
                    {isBest && <div className="text-xs text-orange-600 font-medium mt-1">Most Units</div>}
                  </div>
                );
              })}
            </div>

            {/* Area Size */}
            <div className="grid items-center py-5 px-6 bg-gradient-to-r from-cyan-50 to-teal-50" style={{ gridTemplateColumns: `280px repeat(${selectedProperties.length}, 1fr)` }}>
              <div className="font-semibold text-gray-900 flex items-center">
                <Award className="w-5 h-5 mr-2 text-cyan-600" />
                Area Size
              </div>
              {selectedProperties.map((property, index) => {
                const areaSize = Number(property.AreaSizeAcres || property.areaSizeAcres || 0);
                
                const bestAreaIndex = getBestProperty(selectedProperties, (p) => 
                  Number(p.AreaSizeAcres || p.areaSizeAcres || 0));
                
                const isBest = index === bestAreaIndex && areaSize > 0;
                const isWorst = selectedProperties.length > 1 && !isBest && areaSize > 0 && 
                  areaSize === Math.min(...selectedProperties.map(p => Number(p.AreaSizeAcres || p.areaSizeAcres || 0)).filter(area => area > 0));
                
                return (
                  <div key={property.id} className={`text-center p-3 rounded-lg transition-all ${
                    isBest ? 'bg-cyan-100 border-2 border-cyan-300' : 
                    isWorst ? 'bg-gray-50 border border-gray-200' : 'bg-white border border-gray-200'
                  }`}>
                    <div className="flex items-center justify-center">
                      <span className={`font-bold ${
                        isBest ? 'text-cyan-700' : 'text-gray-900'
                      }`}>
                        {areaSize ? `${areaSize} acres` : 'N/A'}
                      </span>
                      <ComparisonIndicator isBest={isBest} isWorst={isWorst} />
                    </div>
                    {isBest && <div className="text-xs text-cyan-600 font-medium mt-1">Largest Area</div>}
                  </div>
                );
              })}
            </div>

            {/* RERA Status */}
            <div className="grid items-center py-5 px-6 bg-gradient-to-r from-green-50 to-emerald-50" style={{ gridTemplateColumns: `280px repeat(${selectedProperties.length}, 1fr)` }}>
              <div className="font-semibold text-gray-900 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-green-600" />
                RERA Status
              </div>
              {selectedProperties.map((property) => (
                <div key={property.id} className="text-center p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <span className="inline-flex items-center text-green-600 font-bold bg-green-100 px-4 py-2 rounded-full">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approved
                  </span>
                </div>
              ))}
            </div>

            {/* RERA Number */}
            <div className="grid items-center py-5 px-6 bg-gradient-to-r from-slate-50 to-gray-50" style={{ gridTemplateColumns: `280px repeat(${selectedProperties.length}, 1fr)` }}>
              <div className="font-semibold text-gray-900 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-slate-600" />
                RERA Number
              </div>
              {selectedProperties.map((property) => (
                <div key={property.id} className="text-center p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <span className="font-mono text-slate-700 bg-slate-100 px-2 py-1 rounded text-xs">
                    {property.RERA_Number || property['RERA_Number'] || property.reraNumber || 'N/A'}
                  </span>
                </div>
              ))}
            </div>

            {/* Builder Reputation */}
            <div className="grid items-center py-5 px-6 bg-gradient-to-r from-yellow-50 to-orange-50" style={{ gridTemplateColumns: `280px repeat(${selectedProperties.length}, 1fr)` }}>
              <div className="font-semibold text-gray-900 flex items-center">
                <Award className="w-5 h-5 mr-2 text-yellow-600" />
                Builder Reputation
              </div>
              {selectedProperties.map((property) => (
                <div key={property.id} className="text-center p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="text-xs text-yellow-700 bg-yellow-100 px-2 py-1 rounded-lg leading-relaxed">
                    {property['Builder Reputation & Legal Compliance'] || 'Information not available'}
                  </div>
                </div>
              ))}
            </div>

            {/* Possession */}
            <div className="grid items-center py-5 px-6 bg-gradient-to-r from-pink-50 to-rose-50" style={{ gridTemplateColumns: `280px repeat(${selectedProperties.length}, 1fr)` }}>
              <div className="font-semibold text-gray-900 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-pink-600" />
                Possession
              </div>
              {selectedProperties.map((property, index) => {
                const possessionDate = property.PossessionDate || property['PossessionDate'] || property.possessionDate;
                let formattedDate = 'TBD';
                let dateValue = null;
                
                if (possessionDate) {
                  const [month, year] = possessionDate.split('-');
                  if (month && year) {
                    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    formattedDate = `${monthNames[parseInt(month) - 1]} 20${year}`;
                    dateValue = new Date(2000 + parseInt(year), parseInt(month) - 1);
                  } else {
                    formattedDate = possessionDate;
                  }
                }
                
                const bestDateIndex = getBestProperty(selectedProperties, (p) => {
                  const date = p.PossessionDate || p['PossessionDate'] || p.possessionDate;
                  if (date) {
                    const [m, y] = date.split('-');
                    if (m && y) {
                      return -(2000 + parseInt(y)) * 12 - parseInt(m); // Earlier dates are better (negative for reverse sort)
                    }
                  }
                  return 0;
                });
                
                const isBest = index === bestDateIndex && formattedDate !== 'TBD';
                
                return (
                  <div key={property.id} className={`text-center p-3 rounded-lg transition-all ${
                    isBest ? 'bg-pink-100 border-2 border-pink-300' : 'bg-white border border-gray-200'
                  }`}>
                    <div className="flex items-center justify-center">
                      <span className={`font-bold ${
                        isBest ? 'text-pink-700' : 'text-gray-900'
                      }`}>
                        {formattedDate}
                      </span>
                      <ComparisonIndicator isBest={isBest} isWorst={false} />
                    </div>
                    {isBest && <div className="text-xs text-pink-600 font-medium mt-1">Earliest</div>}
                  </div>
                );
              })}
            </div>

            {/* Community Type */}
            {/* <div className="grid items-center py-5 px-6 bg-gradient-to-r from-violet-50 to-purple-50" style={{ gridTemplateColumns: `280px repeat(${selectedProperties.length}, 1fr)` }}>
              <div className="font-semibold text-gray-900 flex items-center">
                <Building className="w-5 h-5 mr-2 text-violet-600" />
                Community Type
              </div>
              {selectedProperties.map((property) => (
                <div key={property.id} className="text-center p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <span className="font-bold text-violet-700 bg-violet-100 px-3 py-1 rounded-full text-sm">
                    {property['Type of Community'] || 'Information Not available'}
                  </span>
                </div>
              ))}
            </div> */}

            {/* Action Buttons */}
            <div className="grid items-center py-6 px-6" style={{ gridTemplateColumns: `280px repeat(${selectedProperties.length}, 1fr)` }}>
              <div className="font-medium text-gray-900">Actions</div>
              {selectedProperties.map((property) => (
                <div key={property.id} className="text-center space-y-2 px-2">
                  <button 
                    onClick={() => handleViewDetails(property)}
                    className="w-full bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    View Details
                  </button>
                  <button 
                    onClick={() => handleWhatsApp(property)}
                    className="w-full bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    WhatsApp
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {selectedProperties.length === 0 && (
        <div className="text-center py-12">
          <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Properties Selected</h3>
          <p className="text-gray-600">Search and add properties above to start comparing them.</p>
        </div>
      )}
    </Container>
  );
}