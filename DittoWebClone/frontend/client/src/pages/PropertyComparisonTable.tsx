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
  Shield,
  IndianRupee,
  ArrowUp,
  ArrowDown
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
                  {(property.ProjectName || property.projectName || property.name || '').toUpperCase()}
                </div>
                <div className="w-full mt-1">
                  <span className="block text-xs font-semibold text-white/80 drop-shadow-md text-left pl-0.5" style={{textShadow: '0 1px 6px rgba(30,41,59,0.18)'}}>
                    By {property.BuilderName || property.builderName || property.DeveloperName || property.developerName || 'N/A'}
                  </span>
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
                  {(property.ProjectName || property.projectName || property.name || '').toUpperCase()}
                </h3>
                <p className="text-xs text-gray-600 mb-2">
                  By {property.BuilderName || property.builderName || property.DeveloperName || property.developerName || 'N/A'}
                </p>
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
                      {(property.ProjectName || property.projectName || property.name || '').toUpperCase()}
                    </h3>
                    <div className="flex flex-col items-center mt-2 space-y-1">
                      <span className="text-xs font-medium text-gray-800">
                        By {property.BuilderName || property.builderName || property.DeveloperName || property.developerName || 'N/A'}
                      </span>
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
                // Get all BaseProjectPrice values from configurations/components
                let basePrices: number[] = [];
                const configs = property.configurations || property.Configurations;
                if (Array.isArray(configs)) {
                  configs.forEach((conf: any) => {
                    if (typeof conf === 'object' && conf !== null && 'BaseProjectPrice' in conf) {
                      const val = Number(conf.BaseProjectPrice);
                      if (!isNaN(val)) basePrices.push(val);
                    }
                  });
                }
                // Fallback to minimumBudget/maximumBudget if no BaseProjectPrice
                if (basePrices.length === 0) {
                  if (typeof property.minimumBudget === 'number' && !isNaN(property.minimumBudget)) basePrices.push(property.minimumBudget);
                  if (typeof property.maximumBudget === 'number' && !isNaN(property.maximumBudget)) basePrices.push(property.maximumBudget);
                  if (typeof property.price === 'number' && !isNaN(property.price)) basePrices.push(property.price);
                }
                let priceDisplay = 'Price not available';
                if (basePrices.length > 0) {
                  const min = Math.min(...basePrices);
                  const max = Math.max(...basePrices);
                  if (min === max) {
                    priceDisplay = `₹${min.toLocaleString()}`;
                  } else {
                    priceDisplay = `₹${min.toLocaleString()} - ₹${max.toLocaleString()}`;
                  }
                }
                // Best value logic remains the same
                const avgPrice = basePrices.length > 0 ? (Math.min(...basePrices) + Math.max(...basePrices)) / 2 : 0;
                const bestPriceIndex = getBestProperty(selectedProperties, (p) => {
                  let prices: number[] = [];
                  const cs = p.configurations || p.Configurations;
                  if (Array.isArray(cs)) {
                    cs.forEach((conf: any) => {
                      if (typeof conf === 'object' && conf !== null && 'BaseProjectPrice' in conf) {
                        const val = Number(conf.BaseProjectPrice);
                        if (!isNaN(val)) prices.push(val);
                      }
                    });
                  }
                  if (prices.length === 0) {
                    if (typeof p.minimumBudget === 'number' && !isNaN(p.minimumBudget)) prices.push(p.minimumBudget);
                    if (typeof p.maximumBudget === 'number' && !isNaN(p.maximumBudget)) prices.push(p.maximumBudget);
                    if (typeof p.price === 'number' && !isNaN(p.price)) prices.push(p.price);
                  }
                  return prices.length > 0 ? (Math.min(...prices) + Math.max(...prices)) / 2 : 0;
                }, true); // lower is better for price
                const isBest = index === bestPriceIndex && priceDisplay !== 'Price not available';
                const isWorst = selectedProperties.length > 1 && !isBest && avgPrice === Math.max(...selectedProperties.map(p => {
                  let prices: number[] = [];
                  const cs = p.configurations || p.Configurations;
                  if (Array.isArray(cs)) {
                    cs.forEach((conf: any) => {
                      if (typeof conf === 'object' && conf !== null && 'BaseProjectPrice' in conf) {
                        const val = Number(conf.BaseProjectPrice);
                        if (!isNaN(val)) prices.push(val);
                      }
                    });
                  }
                  if (prices.length === 0) {
                    if (typeof p.minimumBudget === 'number' && !isNaN(p.minimumBudget)) prices.push(p.minimumBudget);
                    if (typeof p.maximumBudget === 'number' && !isNaN(p.maximumBudget)) prices.push(p.maximumBudget);
                    if (typeof p.price === 'number' && !isNaN(p.price)) prices.push(p.price);
                  }
                  return prices.length > 0 ? (Math.min(...prices) + Math.max(...prices)) / 2 : 0;
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
                        {priceDisplay}
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
            <div className="grid items-center py-6 px-6 bg-gradient-to-r from-blue-50 to-indigo-50" style={{ gridTemplateColumns: `280px repeat(${selectedProperties.length}, 1fr)` }}>
              <div className="font-semibold text-blue-900 flex items-center">
                <IndianRupee className="w-5 h-5 mr-2 text-blue-600" />
                Price/sq ft
              </div>
              {selectedProperties.map((property, index) => {
                let priceSqftArr: number[] = [];
                const configs = property.configurations || property.Configurations;
                if (Array.isArray(configs)) {
                  configs.forEach((conf: any) => {
                    if (typeof conf === 'object' && conf !== null) {
                      const val = conf.Price_per_sft || conf.price_per_sft || conf.PricePerSqft || conf.pricePerSqft;
                      if (typeof val === 'number' && !isNaN(val)) priceSqftArr.push(val);
                    }
                  });
                }
                if (priceSqftArr.length === 0 && (typeof property.Price_per_sft === 'number' || typeof property.price_per_sft === 'number')) {
                  if (typeof property.Price_per_sft === 'number' && !isNaN(property.Price_per_sft)) priceSqftArr.push(property.Price_per_sft);
                  if (typeof property.price_per_sft === 'number' && !isNaN(property.price_per_sft)) priceSqftArr.push(property.price_per_sft);
                }
                let priceSqftDisplay = '₹N/A';
                if (priceSqftArr.length > 0) {
                  const min = Math.min(...priceSqftArr);
                  const max = Math.max(...priceSqftArr);
                  if (min === max) {
                    priceSqftDisplay = `₹${min.toLocaleString()}`;
                  } else {
                    priceSqftDisplay = `₹${min.toLocaleString()} - ₹${max.toLocaleString()}`;
                  }
                }
                // Determine best and highest
                let avg = 0;
                if (priceSqftArr.length > 0) {
                  avg = (Math.min(...priceSqftArr) + Math.max(...priceSqftArr)) / 2;
                }
                const bestIndex = getBestProperty(selectedProperties, (p) => {
                  let arr: number[] = [];
                  const cs = p.configurations || p.Configurations;
                  if (Array.isArray(cs)) {
                    cs.forEach((conf: any) => {
                      if (typeof conf === 'object' && conf !== null) {
                        const val = conf.Price_per_sft || conf.price_per_sft || conf.PricePerSqft || conf.pricePerSqft;
                        if (typeof val === 'number' && !isNaN(val)) arr.push(val);
                      }
                    });
                  }
                  if (arr.length === 0 && (typeof p.Price_per_sft === 'number' || typeof p.price_per_sft === 'number')) {
                    if (typeof p.Price_per_sft === 'number' && !isNaN(p.Price_per_sft)) arr.push(p.Price_per_sft);
                    if (typeof p.price_per_sft === 'number' && !isNaN(p.price_per_sft)) arr.push(p.price_per_sft);
                  }
                  return arr.length > 0 ? (Math.min(...arr) + Math.max(...arr)) / 2 : Infinity;
                }, true); // lower is better
                const isBest = index === bestIndex && priceSqftArr.length > 0;
                const isHighest = selectedProperties.length > 1 && !isBest && avg === Math.max(...selectedProperties.map(p => {
                  let arr: number[] = [];
                  const cs = p.configurations || p.Configurations;
                  if (Array.isArray(cs)) {
                    cs.forEach((conf: any) => {
                      if (typeof conf === 'object' && conf !== null) {
                        const val = conf.Price_per_sft || conf.price_per_sft || conf.PricePerSqft || conf.pricePerSqft;
                        if (typeof val === 'number' && !isNaN(val)) arr.push(val);
                      }
                    });
                  }
                  if (arr.length === 0 && (typeof p.Price_per_sft === 'number' || typeof p.price_per_sft === 'number')) {
                    if (typeof p.Price_per_sft === 'number' && !isNaN(p.Price_per_sft)) arr.push(p.Price_per_sft);
                    if (typeof p.price_per_sft === 'number' && !isNaN(p.price_per_sft)) arr.push(p.price_per_sft);
                  }
                  return arr.length > 0 ? (Math.min(...arr) + Math.max(...arr)) / 2 : 0;
                }));
                return (
                  <div key={property.id} className="text-center p-3">
                    <span className={`inline-flex items-center justify-center w-full font-semibold text-blue-800 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full shadow-md px-6 py-2 text-base border border-blue-200 ring-1 ring-inset ring-white/40 ${isBest ? 'ring-2 ring-green-400' : isHighest ? 'ring-2 ring-red-300' : ''}`} style={{boxShadow: '0 2px 8px 0 rgba(30,64,175,0.08), 0 1.5px 0 0 #fff inset'}}>
                      <IndianRupee className="w-4 h-4 mr-2 text-blue-400" />
                      {priceSqftDisplay}
                      {isBest && <Crown className="w-4 h-4 ml-2 text-green-500" />}
                      {isHighest && <ArrowUp className="w-4 h-4 ml-2 text-red-400" />}
                    </span>
                    {isBest && <div className="text-xs text-green-600 font-medium mt-1">Best Rate</div>}
                    {isHighest && <div className="text-xs text-red-500 font-medium mt-1">Highest Rate</div>}
                  </div>
                );
              })}
            </div>

            {/* Size Range */}
            <div className="grid items-center py-6 px-6 bg-gradient-to-r from-green-50 to-emerald-50" style={{ gridTemplateColumns: `280px repeat(${selectedProperties.length}, 1fr)` }}>
              <div className="font-semibold text-emerald-900 flex items-center">
                <svg className="w-5 h-5 mr-2 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="2" rx="1"/><rect x="7" y="7" width="2" height="2" rx="1"/><rect x="15" y="15" width="2" height="2" rx="1"/></svg>
                Size Range
              </div>
              {selectedProperties.map((property, index) => {
                let sizes: number[] = [];
                const configs = property.configurations || property.Configurations;
                if (Array.isArray(configs)) {
                  configs.forEach((conf: any) => {
                    if (typeof conf === 'object' && conf !== null) {
                      const size = conf.sizeRange || conf.size || conf.area || conf.Size || conf.superBuiltupArea;
                      if (typeof size === 'number' && !isNaN(size)) sizes.push(size);
                    }
                  });
                }
                if (sizes.length === 0) {
                  const fallback = property.minSizeSqft || property.area || property.Size;
                  if (typeof fallback === 'number' && !isNaN(fallback)) sizes.push(fallback);
                }
                let sizeDisplay = 'N/A';
                if (sizes.length > 0) {
                  const min = Math.min(...sizes);
                  const max = Math.max(...sizes);
                  if (min === max) {
                    sizeDisplay = `${min} sq ft`;
                  } else {
                    sizeDisplay = `${min} - ${max} sq ft`;
                  }
                }
                let avg = 0;
                if (sizes.length > 0) {
                  avg = (Math.min(...sizes) + Math.max(...sizes)) / 2;
                }
                const bestIndex = getBestProperty(selectedProperties, (p) => {
                  let arr: number[] = [];
                  const cs = p.configurations || p.Configurations;
                  if (Array.isArray(cs)) {
                    cs.forEach((conf: any) => {
                      if (typeof conf === 'object' && conf !== null) {
                        const size = conf.sizeRange || conf.size || conf.area || conf.Size || conf.superBuiltupArea;
                        if (typeof size === 'number' && !isNaN(size)) arr.push(size);
                      }
                    });
                  }
                  if (arr.length === 0) {
                    const fallback = p.minSizeSqft || p.area || p.Size;
                    if (typeof fallback === 'number' && !isNaN(fallback)) arr.push(fallback);
                  }
                  return arr.length > 0 ? (Math.min(...arr) + Math.max(...arr)) / 2 : 0;
                }); // higher is better
                const isBest = index === bestIndex && sizes.length > 0;
                const isSmallest = selectedProperties.length > 1 && !isBest && avg === Math.min(...selectedProperties.map(p => {
                  let arr: number[] = [];
                  const cs = p.configurations || p.Configurations;
                  if (Array.isArray(cs)) {
                    cs.forEach((conf: any) => {
                      if (typeof conf === 'object' && conf !== null) {
                        const size = conf.sizeRange || conf.size || conf.area || conf.Size || conf.superBuiltupArea;
                        if (typeof size === 'number' && !isNaN(size)) arr.push(size);
                      }
                    });
                  }
                  if (arr.length === 0) {
                    const fallback = p.minSizeSqft || p.area || p.Size;
                    if (typeof fallback === 'number' && !isNaN(fallback)) arr.push(fallback);
                  }
                  return arr.length > 0 ? (Math.min(...arr) + Math.max(...arr)) / 2 : Infinity;
                }));
                return (
                  <div key={property.id} className="text-center p-3">
                    <span className={`inline-flex items-center justify-center w-full font-semibold text-emerald-800 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full shadow-md px-6 py-2 text-base border border-emerald-200 ring-1 ring-inset ring-white/40 ${isBest ? 'ring-2 ring-green-400' : isSmallest ? 'ring-2 ring-yellow-300' : ''}`} style={{boxShadow: '0 2px 8px 0 rgba(16,185,129,0.08), 0 1.5px 0 0 #fff inset'}}>
                      <svg className="w-4 h-4 mr-2 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="2" rx="1"/><rect x="7" y="7" width="2" height="2" rx="1"/><rect x="15" y="15" width="2" height="2" rx="1"/></svg>
                      {sizeDisplay}
                      {isBest && <Crown className="w-4 h-4 ml-2 text-green-500" />}
                      {isSmallest && <ArrowDown className="w-4 h-4 ml-2 text-yellow-400" />}
                    </span>
                    {isBest && <div className="text-xs text-green-600 font-medium mt-1">Largest Space</div>}
                    {isSmallest && <div className="text-xs text-yellow-600 font-medium mt-1">Smallest Space</div>}
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
                    {(() => {
                      const conf = property.Configurations || property.configurations;
                      if (!conf) return 'N/A';
                      let uniqueConfigs: string[] = [];
                      if (typeof conf === 'string') {
                        uniqueConfigs = conf.split(',').map(c => c.trim().toUpperCase());
                      } else if (Array.isArray(conf)) {
                        uniqueConfigs = conf.map(c => typeof c === 'string' ? c.toUpperCase() : (c?.type ? String(c.type).toUpperCase() : ''));
                      } else if (typeof conf === 'object') {
                        if (conf.type) uniqueConfigs = [String(conf.type).toUpperCase()];
                        else uniqueConfigs = [JSON.stringify(conf)];
                      }
                      // Remove empty and duplicate values
                      uniqueConfigs = Array.from(new Set(uniqueConfigs.filter(Boolean)));
                      return uniqueConfigs.join(', ');
                    })()}
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

            {/* Location Row */}
            <div className="grid items-center py-6 px-6 bg-gradient-to-r from-blue-50 to-indigo-50" style={{ gridTemplateColumns: `280px repeat(${selectedProperties.length}, 1fr)` }}>
              <div className="font-semibold text-blue-900 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                Location
              </div>
              {selectedProperties.map((property) => (
                <div key={property.id} className="text-center p-3">
                  <span className="inline-flex items-center justify-center w-full font-semibold text-blue-800 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full shadow-md px-6 py-2 text-base border border-blue-200 ring-1 ring-inset ring-white/40" style={{boxShadow: '0 2px 8px 0 rgba(30,64,175,0.08), 0 1.5px 0 0 #fff inset'}}>
                    <MapPin className="w-4 h-4 mr-2 text-blue-400" />
                    {property.Area || property.Location || property.location || 'N/A'}
                  </span>
                </div>
              ))}
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
                // Try to fetch the actual possession date from various fields
                const possessionRaw = property.Possession_date || property.PossessionDate || property.possessionDate || property['Possession_date'] || property['PossessionDate'];
                let formattedDate = 'TBD';
                if (possessionRaw && typeof possessionRaw === 'string') {
                  // Try to parse DD-MM-YYYY, MM-YYYY, or MM-YY
                  const parts = possessionRaw.split('-');
                  if (parts.length === 3) {
                    // DD-MM-YYYY
                    const month = parseInt(parts[1], 10);
                    const year = parts[2].length === 2 ? 2000 + parseInt(parts[2], 10) : parseInt(parts[2], 10);
                    if (!isNaN(month) && !isNaN(year)) {
                      formattedDate = `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][month-1]} ${year}`;
                    }
                  } else if (parts.length === 2) {
                    // MM-YYYY or MM-YY
                    const month = parseInt(parts[0], 10);
                    const year = parts[1].length === 2 ? 2000 + parseInt(parts[1], 10) : parseInt(parts[1], 10);
                    if (!isNaN(month) && !isNaN(year)) {
                      formattedDate = `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][month-1]} ${year}`;
                    }
                  } else {
                    formattedDate = possessionRaw;
                  }
                }
                const bestDateIndex = getBestProperty(selectedProperties, (p) => {
                  const date = p.Possession_date || p.PossessionDate || p.possessionDate || p['Possession_date'] || p['PossessionDate'];
                  if (date && typeof date === 'string') {
                    const parts = date.split('-');
                    if (parts.length === 3) {
                      // DD-MM-YYYY
                      return -(parseInt(parts[2], 10) * 12 + parseInt(parts[1], 10));
                    } else if (parts.length === 2) {
                      // MM-YYYY or MM-YY
                      return -(parseInt(parts[1], 10) * 12 + parseInt(parts[0], 10));
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
            <div className="grid items-center py-5 px-6 bg-gradient-to-r from-violet-50 to-purple-50" style={{ gridTemplateColumns: `280px repeat(${selectedProperties.length}, 1fr)` }}>
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
            </div>

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