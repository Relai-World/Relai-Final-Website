import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { 
  SearchIcon, FilterIcon, HomeIcon, MapPinIcon, BedDoubleIcon, Calendar as CalendarIcon, 
  X, ChevronLeft, ChevronRight, MapIcon, ListIcon, Target, AlertCircle, 
  SearchX, Loader2, ChevronDown, Building2, Ruler 
} from 'lucide-react';
import { StarRating } from '@/components/ui/star-rating';
import PropertiesMap from '@/components/map/PropertiesMap';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { apiRequest } from '@/lib/queryClient';

// Define a flexible type for property data from the API
type ApiProperty = {
  id: string;
  _id: string;
  [key: string]: any; // Allows for flexible property access (e.g., property.ProjectName)
};

// Helper function to extract property data from Mongoose document structure
const extractPropertyData = (property: any): any => {
  // If it's a Mongoose document, extract the actual data from _doc
  if (property && property._doc) {
    return { ...property._doc, id: property.id || property._id };
  }
  // If it's already a plain object, return as is
  return property;
};

// Define the backend URL for constructing image paths
// In a real app, this should come from an environment variable (e.g., import.meta.env.VITE_API_URL)
const API_BASE_URL_PROPERTIES = import.meta.env.VITE_API_URL_PROPERTIES || 'http://localhost:3000';
const API_BASE_URL_OTHERS = import.meta.env.VITE_API_URL_OTHERS || 'http://localhost:5001';

// Helper function to format date from DD-MM-YYYY to MM-YY (e.g., "01-08-2028" -> "08-28")
const formatPossessionDate = (dateStr?: string): string => {
  if (!dateStr || typeof dateStr !== 'string' || !/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
    return "N/A";
  }
  try {
    const parts = dateStr.split('-'); // [DD, MM, YYYY]
    const month = parts[1];
    const year = parts[2].slice(-2); // last two digits of year
    return `${month}-${year}`;
  } catch (error) {
    return "N/A";
  }
};

// Transform API property data to map-compatible format
const transformPropertyForMap = (apiProperty: ApiProperty) => {
  const property = extractPropertyData(apiProperty);
  return {
    id: property.id || property._id,
    property_id: property.id || property._id,
    projectName: property.ProjectName || property.projectName || "Unnamed Project",
    name: property.ProjectName || property.projectName || "Unnamed Project",
    longitude: property.longitude || property.lng || 0,
    latitude: property.latitude || property.lat || 0,
    location: property.Area || property.location || "Unknown Location",
    propertyType: property.propertyType || "Unknown",
    configurations: property.configurations || [],
    unitType: property.unitType || "N/A",
    unitTypes: property.unitTypes || "N/A",
    configurationDetails: property.configurationDetails || [],
    price: property.price || property.minimumBudget || 0,
    constructionStatus: property.constructionStatus,
    images: property.images || [],
    googleRating: property.rating || 4,
    totalGoogleRatings: property.totalRatings || 0,
  };
};

export default function AllPropertiesPage() {
  // Set page title when component mounts
  useEffect(() => {
    document.title = "All Properties | Relai";
    return () => {
      document.title = "Relai | The Ultimate Real Estate Buying Experience";
    };
  }, []);

  // Hook for programmatic navigation
  const [_, setLocation] = useLocation();

  // Helper function to format the budget range for display
  const formatBudgetRange = (property: any): string => {
    const propertyData = extractPropertyData(property);
    
    const formatPriceValue = (price: number): string | null => {
      if (!price) return null;
      if (price >= 10000000) {
        return `₹${(price / 10000000).toFixed(2)} Cr`;
      } else if (price >= 100000) {
        return `₹${(price / 100000).toFixed(2)} Lac`;
      }
      return `₹${price.toLocaleString()}`;
    };

    // First try to use existing budget fields if available
    const minBudget = propertyData.minimumBudget || 0;
    const maxBudget = propertyData.maximumBudget || 0;
    const singlePrice = propertyData.price || 0;

    if (minBudget || maxBudget) {
      const formattedMin = formatPriceValue(minBudget);
      const formattedMax = formatPriceValue(maxBudget);
      
      if (formattedMin && formattedMax && formattedMin !== formattedMax) {
        return `${formattedMin} - ${formattedMax}`;
      }
      return formattedMin || formattedMax || "Price on Request";
    }

    if (singlePrice) {
      return formatPriceValue(singlePrice) || "Price on Request";
    }

    // Calculate budget range based on Price_per_sft and typical apartment sizes
    const pricePerSqft = propertyData.Price_per_sft;
    if (!pricePerSqft) {
      return "Price on Request";
    }

    // Try to get size information from configurationDetails
    let minSize = 1000; // Default minimum size in sq ft
    let maxSize = 3000; // Default maximum size in sq ft

    const configDetails = propertyData.configurationDetails;
    if (configDetails && Array.isArray(configDetails) && configDetails.length > 0) {
      const sizes = configDetails
        .map((conf: any) => {
          const size = conf.sizeRange || conf.size_range || conf.SizeRange || 
                      conf.area || conf.Area || conf.size || conf.Size || 
                      conf.superBuiltupArea;
          return typeof size === 'number' ? size : null;
        })
        .filter((size: number | null) => size !== null);

      if (sizes.length > 0) {
        minSize = Math.min(...sizes);
        maxSize = Math.max(...sizes);
      }
    }

    // Calculate budget range
    const minBudgetCalculated = pricePerSqft * minSize;
    const maxBudgetCalculated = pricePerSqft * maxSize;

    const formattedMin = formatPriceValue(minBudgetCalculated);
    const formattedMax = formatPriceValue(maxBudgetCalculated);

    if (formattedMin && formattedMax && formattedMin !== formattedMax) {
      return `${formattedMin} - ${formattedMax}`;
    }
    return formattedMin || formattedMax || "Price on Request";
  };

  // State for filters and UI
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocations, setSelectedLocations] = useState<string[]>(['any']);
  const [propertyType, setPropertyType] = useState('any');
  const [configurations, setConfigurations] = useState('any');
  const [constructionStatus, setConstructionStatus] = useState('any');
  const [pricePerSqftRange, setPricePerSqftRange] = useState<[number, number]>([0, 20000]);
  const [radiusKm, setRadiusKm] = useState('exact');
  const [showFilters, setShowFilters] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [locationSearchTerm, setLocationSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [currentPage, setCurrentPage] = useState(1);
  const [propertiesPerPage] = useState(12);
  
  // Debounce search term to prevent excessive API calls
  useEffect(() => {
    const timerId = setTimeout(() => setDebouncedSearchTerm(searchTerm), 500);
    return () => clearTimeout(timerId);
  }, [searchTerm]);
  
  // Prepare parameters for the API query
  const locationParam = useMemo(() => selectedLocations.includes('any') ? 'any' : selectedLocations.join(','), [selectedLocations]);
  const useRadiusSearch = useMemo(() => locationParam !== 'any' && locationParam !== '', [locationParam]);
  
  // Fetch properties data from API
  const { data, isLoading, error } = useQuery({
    queryKey: ['properties', debouncedSearchTerm, locationParam, propertyType, configurations, constructionStatus, useRadiusSearch, radiusKm, pricePerSqftRange],
    queryFn: () => {
      const params = new URLSearchParams();
      if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
      if (locationParam !== 'any') params.append('location', locationParam);
      if (propertyType !== 'any') params.append('propertyType', propertyType);
      if (configurations !== 'any') params.append('configurations', configurations);
      if (constructionStatus !== 'any') params.append('constructionStatus', constructionStatus);
      // Add other filters as needed
      
      const endpoint = `${API_BASE_URL_PROPERTIES}/api/all-properties`;
      const url = `${endpoint}?${params.toString()}`;
      return apiRequest<{ properties: ApiProperty[] }>(url);
    },
  });

  // --- DEBUGGING LOGS ---
  console.log("1. API Query State:", { isLoading, error, data });

  // Derived state from fetched data
  const allProperties = useMemo(() => data?.properties || [], [data]);
  const totalPages = Math.ceil(allProperties.length / propertiesPerPage);
  const startIndex = (currentPage - 1) * propertiesPerPage;
  const endIndex = startIndex + propertiesPerPage;
  const properties = useMemo(() => allProperties.slice(startIndex, endIndex), [allProperties, startIndex, endIndex]);
  
  // --- DEBUGGING LOGS ---
  console.log("2. Processed `allProperties`:", allProperties);
  console.log("3. Paginated `properties` for current page:", properties);

  // Transform properties for map view
  const mapProperties = useMemo(() => properties.map(transformPropertyForMap), [properties]);
  
  // Reset current page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, locationParam, propertyType, configurations, constructionStatus, radiusKm]);
  
  // Click handler for programmatic navigation
  const handleCardClick = (propertyId: string) => {
    setLocation(`/property/${propertyId}`);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedLocations(['any']);
    setPropertyType('any');
    setConfigurations('any');
    setConstructionStatus('any');
    setPricePerSqftRange([0, 20000]); // Reset to default or fetched min/max
    setRadiusKm('exact');
  };

  return (
    <div className="container mx-auto px-4 pt-32 pb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">All Properties</h1>
        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4">
          <div className="relative w-full md:w-64">
            <Input
              placeholder="Search properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11"
            />
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
          <Button variant="outline" className="flex items-center gap-2 h-11" onClick={() => setShowFilters(!showFilters)}>
            <FilterIcon size={18} />
            Filters
          </Button>
        </div>
      </div>
      
      {showFilters && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-100">
           {/* Full filters section here */}
        </div>
      )}
      
      {!isLoading && !error && allProperties.length > 0 && (
        <div className="flex justify-between items-center mb-6">
          <p className="text-sm text-gray-500">
            Showing {Math.min(startIndex + 1, allProperties.length)}-{Math.min(endIndex, allProperties.length)} of {allProperties.length} properties
          </p>
          <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-md">
            <button 
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium ${viewMode === 'list' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:bg-gray-200'}`}
            >
              <ListIcon size={18} />
              List
            </button>
            <button 
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium ${viewMode === 'map' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:bg-gray-200'}`}
            >
              <MapIcon size={18} />
              Map
            </button>
          </div>
        </div>
      )}
      
      {isLoading && <div className="text-center py-20 flex flex-col items-center gap-4"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /><p className="text-gray-500">Loading Properties...</p></div>}
      {error && <div className="text-center py-20 bg-red-50 p-8 rounded-lg"><AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" /><h3 className="text-lg font-semibold text-red-800">Failed to Load Properties</h3><p className="text-red-600">Please try again later.</p></div>}
      {!isLoading && !error && properties.length === 0 && <div className="text-center py-20 bg-gray-50 p-8 rounded-lg"><SearchX className="w-12 h-12 text-gray-400 mx-auto mb-4" /><h3 className="text-lg font-semibold text-gray-800">No Properties Found</h3><p className="text-gray-500">Try adjusting your search filters.</p></div>}

      {viewMode === 'map' && <div className="mb-8 h-[600px]"><PropertiesMap properties={mapProperties} /></div>}

      {!isLoading && !error && properties.length > 0 && viewMode === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
          {properties.map((property: ApiProperty) => {
            // Extract property data from Mongoose document structure
            const propertyData = extractPropertyData(property);
            
            // --- DEBUGGING LOG ---
            // This is the most important log to check the fields of EACH property
            console.log('4. Rendering property card with this data:', {
              id: propertyData.id || propertyData._id,
              all_keys: Object.keys(propertyData),
              ProjectName: propertyData.ProjectName,
              BuilderName: propertyData.BuilderName,
              Area: propertyData.Area,
              Possession_date: propertyData.Possession_date,
              Price_per_sft: propertyData.Price_per_sft,
              configurations: propertyData.configurations, // Check this field specifically!
              configurationDetails: propertyData.configurationDetails, // Check this field specifically!
              Configurations: propertyData.Configurations, // Check capitalized version
              configuration: propertyData.configuration, // Check lowercase version
              Configuration: propertyData.Configuration, // Check capitalized version
              bhk: propertyData.bhk, // Check BHK field
              BHK: propertyData.BHK, // Check capitalized BHK
              bedrooms: propertyData.bedrooms, // Check bedrooms field
              propertyType: propertyData.propertyType, // Check property type
              unitType: propertyData.unitType, // Check unit type
              UnitType: propertyData.UnitType, // Check capitalized unit type
              images: propertyData.images,
              // Log any other fields you expect here
            });
            
            return (
              <div 
                key={propertyData.id || propertyData._id} 
                className="cursor-pointer group" 
                onClick={() => handleCardClick(propertyData.id || propertyData._id)}
              >
                <Card className="flex flex-col overflow-hidden h-full border-gray-200 group-hover:shadow-xl group-hover:border-blue-300 transition-all duration-300">
                  <div className="relative w-full h-56 bg-gray-200">
                    {propertyData.images && propertyData.images.length > 0 ? (
                      <img 
                        src={`${API_BASE_URL_OTHERS}${propertyData.images[0]}`}
                        alt={propertyData.ProjectName || propertyData.projectName || 'Property Image'}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <HomeIcon className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <div className="bg-black/60 backdrop-blur-sm rounded-md px-2 py-1">
                        <StarRating rating={propertyData.rating || 4} size="sm" showNumber={false} className="text-yellow-400" />
                      </div>
                    </div>
                    {propertyData.propertyType && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-white text-blue-600 font-semibold shadow-md border border-gray-100">
                          {propertyData.propertyType}
                        </Badge>
                      </div>
                    )}
                    {propertyData.Possession_date && (
                       <div className="absolute bottom-3 right-3">
                          <Badge className="bg-blue-600 text-white font-bold text-xs tracking-wider border-2 border-white/50">
                              {formatPossessionDate(propertyData.Possession_date)}
                          </Badge>
                       </div>
                    )}
                  </div>
                  
                  <CardContent className="p-4 flex flex-col flex-grow">
                    <h3 className="text-lg font-bold text-gray-800 truncate mb-1">{propertyData.ProjectName || propertyData.projectName || "Unnamed Project"}</h3>
                    <p className="text-sm text-gray-600 mb-1">By {propertyData.BuilderName || "Unknown Builder"}</p>
                    <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-4">
                      <MapPinIcon size={14} />
                    </div>

                    <div className="grid grid-cols-3 gap-2 border-t border-b border-gray-100 py-3 mb-auto">
                      <div className="flex flex-col gap-1">
                          <span className="text-xs text-gray-400 flex items-center gap-1"><Building2 size={12}/>Configuration</span>
                          <span className="text-sm font-semibold text-gray-700">
                            {(() => {
                              // 1. Try direct configurations array (robust check)
                              let configs = propertyData.configurations;
                              if (
                                Array.isArray(configs) &&
                                configs.length > 0
                              ) {
                                // Collect unique types
                                const configTypesSet = new Set(
                                  configs
                                    .map((conf: any) => conf && (conf.type || conf.Type || ''))
                                    .filter(Boolean)
                                );
                                const configTypes = Array.from(configTypesSet);
                                return configTypes.length > 0 ? configTypes.join(', ') : 'N/A';
                              } else if (
                                configs &&
                                typeof configs === 'object' &&
                                configs.name === 'ValidatorError'
                              ) {
                                // It's an error object, treat as missing
                                configs = undefined;
                              }
                              // 2. Fallback: error object (for broken backend)
                              configs =
                                propertyData?.$errors?.configurations?.properties?.value ||
                                propertyData?.$__?.validationError?.errors?.configurations?.properties?.value;
                              if (Array.isArray(configs) && configs.length > 0) {
                                const configTypesSet = new Set(
                                  configs
                                    .map((conf: any) => conf && (conf.type || conf.Type || ''))
                                    .filter(Boolean)
                                );
                                const configTypes = Array.from(configTypesSet);
                                return configTypes.length > 0 ? configTypes.join(', ') : 'N/A';
                              }
                              // 3. Fallback: previous logic
                              let configDetails = propertyData.configurationDetails;
                              if (typeof configDetails === 'string') {
                                try {
                                  configDetails = JSON.parse(configDetails);
                                } catch (e) {
                                  // If parsing fails, try other configuration fields
                                }
                              }
                              if (Array.isArray(configDetails) && configDetails.length > 0) {
                                const configTypesSet = new Set(
                                  configDetails
                                    .map((conf: any) =>
                                      conf && (conf.type || conf.Type || conf.bhkType || conf.bhk || conf.unitType || conf.configurationType || '')
                                    )
                                    .filter(Boolean)
                                );
                                const configTypes = Array.from(configTypesSet);
                                return configTypes.length > 0 ? configTypes.join(', ') : 'N/A';
                              }
                              const possibleConfigFields = [
                                propertyData.Configurations,
                                propertyData.configuration,
                                propertyData.Configuration,
                                propertyData.bhk,
                                propertyData.BHK,
                                propertyData.unitType,
                                propertyData.UnitType
                              ];
                              const configField = possibleConfigFields.find(field =>
                                field && typeof field === 'string' && field.trim() !== ''
                              );
                              if (configField) {
                                return configField;
                              }
                              if (propertyData.bedrooms) {
                                return `${propertyData.bedrooms} BHK`;
                              }
                              if (propertyData.propertyType) {
                                const type = propertyData.propertyType.toLowerCase();
                                if (type.includes('plot')) return 'Plot';
                                if (type.includes('villa')) return 'Villa';
                                if (type.includes('apartment')) return 'Apartment';
                                if (type.includes('house')) return 'House';
                              }
                              return 'N/A';
                            })()}
                          </span>
                      </div>
                       <div className="flex flex-col gap-1">
                          {/* <span className="text-xs text-gray-400 flex items-center gap-1"><Ruler size={12}/>Area</span> */}
                          {/* <span className="text-sm font-semibold text-gray-700">
                            {(() => {
                              // Use 'configurationDetails' as identified from the logs
                              let configs = propertyData.configurationDetails;
                              if (typeof configs === 'string') {
                                try {
                                  configs = JSON.parse(configs);
                                } catch (e) {
                                  return propertyData.area || propertyData.size || propertyData.sizeRange || propertyData.superBuiltupArea ? `${propertyData.area || propertyData.size || propertyData.sizeRange || propertyData.superBuiltupArea} sq.ft` : 'N/A';
                                }
                              }
                              if (Array.isArray(configs) && configs.length > 0) {
                                const sizes = configs
                                  .map((conf: any) =>
                                    conf.sizeRange || conf.size_range || conf.SizeRange || conf.area || conf.Area || conf.size || conf.Size || conf.superBuiltupArea
                                  )
                                  .filter((v: any) => typeof v === 'number' && !isNaN(v));
                                if (sizes.length === 0) {
                                  return propertyData.area || propertyData.size || propertyData.sizeRange || propertyData.superBuiltupArea ? `${propertyData.area || propertyData.size || propertyData.sizeRange || propertyData.superBuiltupArea} sq.ft` : 'N/A';
                                }
                                const min = Math.min(...sizes);
                                const max = Math.max(...sizes);
                                const unit =
                                  configs[0]?.sizeUnit ||
                                  configs[0]?.size_unit ||
                                  configs[0]?.SizeUnit ||
                                  configs[0]?.unit ||
                                  configs[0]?.Unit ||
                                  'sq.ft';
                                return min !== max ? `${min}-${max} ${unit}` : `${min} ${unit}`;
                              } else if (propertyData.area || propertyData.size || propertyData.sizeRange || propertyData.superBuiltupArea) {
                                return `${propertyData.area || propertyData.size || propertyData.sizeRange || propertyData.superBuiltupArea} sq.ft`;
                              }
                              return 'N/A';
                            })()}
                          </span> */}
                      </div>
                       <div className="flex flex-col gap-1">
                          <span className="text-xs text-gray-400 flex items-center gap-1"><CalendarIcon size={12}/>Possession</span>
                          <span className="text-sm font-semibold text-gray-700">{formatPossessionDate(propertyData.Possession_date)}</span>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="px-4 pt-3 pb-4">
                    <div className="flex justify-between items-end w-full">
                      <div className="text-left">
                        <p className="text-xs text-gray-500">Price Per Sq.ft</p>
                        <p className="text-lg font-bold text-blue-600">
                          {propertyData.Price_per_sft ? `₹${propertyData.Price_per_sft.toLocaleString()}` : 'N/A'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Budget Price</p>
                        <p className="text-lg font-bold text-gray-800">{formatBudgetRange(propertyData)}</p>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              </div>
            );
          })}
        </div>
      )}
      
    {!isLoading && !error && allProperties.length > propertiesPerPage && (
      <div className="flex justify-center items-center mt-10 space-x-2">
        <Button
          variant="outline"
          onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          className="flex items-center gap-2"
        >
          <ChevronLeft size={16} />
          Previous
        </Button>
        
        <span className="text-sm text-gray-600 px-2">Page {currentPage} of {totalPages}</span>
        
        <Button
          variant="outline"
          onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="flex items-center gap-2"
        >
          Next
          <ChevronRight size={16} />
        </Button>
      </div>
    )}
  </div>
);
}