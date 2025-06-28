import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { SearchIcon, FilterIcon, HomeIcon, MapPinIcon, BedDoubleIcon, Calendar as CalendarIcon, X, ChevronLeft, ChevronRight, MapIcon, ListIcon, Target, Check, AlertCircle, Info as InfoIcon, SearchX, Loader2, ChevronDown, StarIcon } from 'lucide-react';
import { StarRating } from '@/components/ui/star-rating';
import { calculatePropertyRating } from '@shared/property-rating';
import PropertiesMap from '@/components/map/PropertiesMap';
import PropertyImage from '@/components/property/PropertyImage';

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
import { RelaiLogo } from '../../assets/svg/logo';
import { apiRequest } from '@/lib/queryClient';

export default function ResidentialPage() {
  // Set page title and meta description when component mounts
  useEffect(() => {
    document.title = "Buy Residential Property in Hyderabad | Apartments, Villas & More – Relai";
    
    // Set meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Find your ideal home in Hyderabad with Relai. Browse verified residential properties including apartments, villas, and gated communities with expert buying support.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Find your ideal home in Hyderabad with Relai. Browse verified residential properties including apartments, villas, and gated communities with expert buying support.';
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

  // State management for filters and UI - same as All Properties page
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedLocations, setSelectedLocations] = useState<string[]>(['any']);
  const [propertyType, setPropertyType] = useState('any');
  const [pricePerSqftRange, setPricePerSqftRange] = useState([0, 20000]);
  const [configurations, setConfigurations] = useState('any');
  const [constructionStatus, setConstructionStatus] = useState('any');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [radiusKm, setRadiusKm] = useState<string>('2'); // Default radius
  const [openLocationSelector, setOpenLocationSelector] = useState(false);

  // Debounce search term to prevent excessive API calls
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    
    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  // Format locations for API query
  const locationParam = selectedLocations.includes('any') 
    ? 'any' 
    : selectedLocations.join(',');

  // Use the same filtering logic as All Properties page
  const exactLocationOnly = radiusKm === 'exact';
  const actualRadius = exactLocationOnly ? 'exact' : parseInt(radiusKm, 10);
  const useRadiusSearch = locationParam !== 'any' && locationParam !== '';

  // Fetch properties using same logic as All Properties page
  const { data, isLoading, error } = useQuery({
    queryKey: [
      '/api/all-properties',
      debouncedSearchTerm, 
      locationParam, 
      propertyType, // Use the propertyType filter
      pricePerSqftRange[0], 
      pricePerSqftRange[1], 
      configurations,
      constructionStatus,
      actualRadius
    ],
    queryFn: () => {
      // Use radius search when locations are specified
      if (useRadiusSearch) {
        return apiRequest<{ properties: any[]; total: number }>(
          `/api/radius-search?locations=${locationParam}&radius=${actualRadius}&filters=${JSON.stringify({
            search: debouncedSearchTerm,
            propertyType,
            minPricePerSqft: pricePerSqftRange[0],
            maxPricePerSqft: pricePerSqftRange[1],
            configurations,
            constructionStatus,
          })}`
        );
      } else {
        // Use standard properties endpoint
        return apiRequest<{ properties: any[]; total: number }>(
          `/api/all-properties?search=${debouncedSearchTerm}&location=${locationParam}&propertyType=${propertyType}&minPricePerSqft=${pricePerSqftRange[0]}&maxPricePerSqft=${pricePerSqftRange[1]}&configurations=${configurations}&constructionStatus=${constructionStatus}`
        );
      }
    },
  });

  console.log('Residential page data:', data);

  // Get properties and apply additional residential filtering if needed
  const allProperties = data?.properties || [];
  const properties = propertyType === 'any' 
    ? allProperties.filter(property => 
        property.propertyType === 'Apartment' || property.propertyType === 'Villa'
      )
    : allProperties; // Already filtered by API if specific type selected

  console.log('Filtered residential properties:', properties.length);

  // Fetch filter options from API - Same as All Properties page
  const { data: filterOptionsData } = useQuery({
    queryKey: ['/api/filter-options'],
    queryFn: () => apiRequest<{ filterOptions: {
      locations: string[];
      propertyTypes: string[];
      configurations: string[];
      constructionStatuses: string[];
      priceRange: { min: number; max: number };
    } }>('/api/filter-options'),
  });
  
  // Get filter options from API response or use defaults
  const propertyTypes = filterOptionsData?.filterOptions?.propertyTypes || ['Apartment', 'Villa'];
  const configurationOptions = filterOptionsData?.filterOptions?.configurations || [];
  const constructionStatusOptions = filterOptionsData?.filterOptions?.constructionStatuses || [];
  
  // Get price range from filter options API - Same as All Properties
  const minPricePerSqft = filterOptionsData?.filterOptions?.priceRange?.min || 0;
  const maxPricePerSqft = filterOptionsData?.filterOptions?.priceRange?.max || 20000;
  
  // Update price range when filter options change - Same as All Properties
  useEffect(() => {
    if (filterOptionsData?.filterOptions?.priceRange) {
      setPricePerSqftRange([
        filterOptionsData.filterOptions.priceRange.min || 0,
        filterOptionsData.filterOptions.priceRange.max || 20000
      ]);
    }
  }, [filterOptionsData]);
  
  // Fetch location options from API
  const { data: locationData } = useQuery({
    queryKey: ['/api/property-geocoded-locations'],
    queryFn: () => apiRequest<{ locations: string[] }>('/api/property-geocoded-locations'),
  });
  
  // Get available locations for dropdown
  const availableLocations = locationData?.locations || [];

  // Budget formatting function - same as All Properties page
  const formatBudgetRange = (property: any) => {
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
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 pt-32 pb-12">
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading residential properties...</span>
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
          <p className="text-xs text-gray-400 mt-2">Error: {error.message}</p>
        </div>
      </div>
    );
  }

  // Debug logging
  console.log('Rendering ResidentialPage with:', {
    isLoading,
    error,
    dataExists: !!data,
    propertiesCount: properties.length,
    allPropertiesCount: allProperties.length
  });

  return (
    <div className="container mx-auto px-4 pt-32 pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Residential Properties</h1>
        <p className="text-lg text-gray-600">
          Browse our exclusive collection of apartments and villas in Hyderabad.
        </p>
      </div>

      {/* Search and Filter Controls - Same as All Properties page */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search properties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button 
          variant={showFilters ? "default" : "outline"}
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <FilterIcon className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Filter Panel - Same as All Properties page */}
      {showFilters && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Filters</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setSelectedLocations(['any']);
                  setPropertyType('any');
                  setPricePerSqftRange([0, 20000]);
                  setConfigurations('any');
                  setConstructionStatus('any');
                  setSearchTerm('');
                }}
              >
                Reset All
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Location Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Locations</label>
                <Popover open={openLocationSelector} onOpenChange={setOpenLocationSelector}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openLocationSelector}
                      className="w-full justify-between"
                    >
                      {selectedLocations.includes('any') 
                        ? "Any location"
                        : selectedLocations.length === 1
                        ? selectedLocations[0]
                        : `${selectedLocations.length} locations`}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0">
                    <Command>
                      <CommandInput placeholder="Search locations..." />
                      <CommandList>
                        <CommandEmpty>No locations found.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            onSelect={() => {
                              setSelectedLocations(['any']);
                              setOpenLocationSelector(false);
                            }}
                          >
                            <Check className={`mr-2 h-4 w-4 ${selectedLocations.includes('any') ? 'opacity-100' : 'opacity-0'}`} />
                            Any location
                          </CommandItem>
                          {availableLocations.map((location) => (
                            <CommandItem
                              key={location}
                              onSelect={() => {
                                if (selectedLocations.includes('any')) {
                                  setSelectedLocations([location]);
                                } else {
                                  const isSelected = selectedLocations.includes(location);
                                  if (isSelected) {
                                    const newSelections = selectedLocations.filter(l => l !== location);
                                    setSelectedLocations(newSelections.length > 0 ? newSelections : ['any']);
                                  } else {
                                    setSelectedLocations([...selectedLocations, location]);
                                  }
                                }
                              }}
                            >
                              <Check className={`mr-2 h-4 w-4 ${selectedLocations.includes(location) ? 'opacity-100' : 'opacity-0'}`} />
                              {location}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Property Type Filter - Only Apartment and Villa */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
                <Select value={propertyType} onValueChange={setPropertyType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any type</SelectItem>
                    <SelectItem value="Apartment">Apartment</SelectItem>
                    <SelectItem value="Villa">Villa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Configuration Filter - Same as All Properties */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Configuration</label>
                <Select value={configurations} onValueChange={setConfigurations}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any configuration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="1BHK">1BHK</SelectItem>
                    <SelectItem value="2BHK">2BHK</SelectItem>
                    <SelectItem value="3BHK">3BHK</SelectItem>
                    <SelectItem value="4BHK">4BHK</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Construction Status Filter - Same as All Properties */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Construction Status</label>
                <Select value={constructionStatus} onValueChange={setConstructionStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="constructed">Constructed</SelectItem>
                    <SelectItem value="constructing">Constructing</SelectItem>
                    <SelectItem value="to-be-constructed">To be Constructed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range Slider - Exact same logic as All Properties page */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Per Sq.ft: ₹{pricePerSqftRange[0]} - ₹{pricePerSqftRange[1]}
                </label>
                <Slider
                  defaultValue={[minPricePerSqft, maxPricePerSqft]}
                  min={minPricePerSqft}
                  max={maxPricePerSqft}
                  step={Math.max(100, Math.floor((maxPricePerSqft - minPricePerSqft) / 40))}
                  value={pricePerSqftRange}
                  onValueChange={(value) => setPricePerSqftRange(value as [number, number])}
                  className="mt-6"
                />
              </div>
            </div>

            {/* Radius Filter - Show only when specific locations are selected */}
            {!selectedLocations.includes('any') && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Also include projects around</label>
                <Select value={radiusKm} onValueChange={setRadiusKm}>
                  <SelectTrigger className="w-full max-w-xs">
                    <SelectValue placeholder="Select radius" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="exact">Exact location only</SelectItem>
                    <SelectItem value="2">2 km radius</SelectItem>
                    <SelectItem value="3">3 km radius</SelectItem>
                    <SelectItem value="4">4 km radius</SelectItem>
                    <SelectItem value="5">5 km radius</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowFilters(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowFilters(false)}>
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Summary and View Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <span className="text-gray-600">
            Showing {properties.length} residential properties
          </span>
        </div>
        <div className="flex items-center gap-4">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="flex items-center gap-2"
            >
              <ListIcon className="h-4 w-4" />
              List
            </Button>
            <Button
              variant={viewMode === 'map' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('map')}
              className="flex items-center gap-2"
            >
              <MapIcon className="h-4 w-4" />
              Map
            </Button>
          </div>
          
          <Link href="/all-properties" className="text-blue-600 hover:underline flex items-center gap-2">
            <HomeIcon size={16} />
            View All Properties
          </Link>
        </div>
      </div>

      {/* Conditional View: List or Map */}
      {viewMode === 'map' ? (
        /* Map View */
        <div className="h-[600px] w-full rounded-lg overflow-hidden border">
          <PropertiesMap 
            properties={properties}
          />
        </div>
      ) : (
        /* List View - Properties Grid */
        properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property: any) => (
              <div key={property.id} className="group">
                <Link href={`/property/${property.propertyId}`}>
                  <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-200 overflow-hidden h-full">
                    <div className="relative">
                      {/* Image Container */}
                      <div className="relative h-48 bg-gray-100 overflow-hidden">
                        <PropertyImage 
                          propertyName={property.projectName || property.name}
                          images={property.images || []}
                          className="h-full w-full"
                        />
                        
                        {/* Property type badge */}
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-white text-blue-600 font-medium">
                            {property.propertyType}
                          </Badge>
                        </div>
                        
                        {/* Star rating */}
                        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1">
                          <div className="flex items-center gap-1">
                            <StarIcon className="w-3 h-3 text-yellow-400 fill-current" />
                            <span className="text-white text-xs font-medium">4.2</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <CardContent className="p-0">
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
                          
                          {/* Property specs */}
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            {/* Configuration */}
                            {property.configurations && (
                              <div className="flex flex-col">
                                <div className="flex items-center gap-1 text-gray-500 mb-1">
                                  <BedDoubleIcon size={14} />
                                  <span className="text-xs">Configuration</span>
                                </div>
                                <span className="text-sm font-medium line-clamp-1">
                                  {property.configurations}
                                </span>
                              </div>
                            )}
                            
                            {/* Size */}
                            {(property.minSizeSqft > 0 || property.area > 0) && (
                              <div className="flex flex-col">
                                <div className="flex items-center gap-1 text-gray-500 mb-1">
                                  <span className="text-xs">Size</span>
                                </div>
                                <span className="text-sm font-medium">
                                  {property.minSizeSqft > 0 && property.maxSizeSqft > 0 && property.minSizeSqft !== property.maxSizeSqft
                                    ? `${property.minSizeSqft}-${property.maxSizeSqft} sq.ft`
                                    : `${property.minSizeSqft || property.area} sq.ft`}
                                </span>
                              </div>
                            )}
                            
                            {/* Possession */}
                            {property.possessionDate && (
                              <div className="flex flex-col">
                                <div className="flex items-center gap-1 text-gray-500 mb-1">
                                  <CalendarIcon size={14} />
                                  <span className="text-xs">Possession</span>
                                </div>
                                <span className="text-sm font-medium line-clamp-1">
                                  {property.possessionDate}
                                </span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                        
                        <CardFooter className="px-0 pt-0 pb-0">
                          <div className="flex justify-between items-end w-full">
                            <div>
                              <p className="text-sm text-gray-500">Price Per Sq.ft</p>
                              <p className="text-lg font-bold text-blue-600">
                                {property.price_per_sqft || property.pricePerSqft ? 
                                 `₹${(property.price_per_sqft || property.pricePerSqft).toLocaleString()}` : 
                                 'N/A'}
                              </p>
                            </div>
                            
                            <div className="text-right">
                              <p className="text-sm text-gray-500">Total Price</p>
                              <p className="text-lg font-semibold">{formatBudgetRange(property)}</p>
                            </div>
                          </div>
                        </CardFooter>
                      </div>
                    </div>
                  </Card>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <HomeIcon size={48} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">No Residential Properties Found</h2>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              No apartments or villas found matching your criteria. Try adjusting your filters.
            </p>
            <Link href="/all-properties" className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
              Browse All Properties
            </Link>
          </div>
        )
      )}
    </div>
  );
}