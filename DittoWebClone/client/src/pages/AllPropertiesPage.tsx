import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { SearchIcon, FilterIcon, HomeIcon, MapPinIcon, BedDoubleIcon, Calendar as CalendarIcon, X, ChevronLeft, ChevronRight, MapIcon, ListIcon, Target, Check, AlertCircle, Info as InfoIcon, SearchX, Loader2, ChevronDown } from 'lucide-react';
import { StarRating } from '@/components/ui/star-rating';
import { calculatePropertyRating } from '@shared/property-rating';
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
import { RelaiLogo } from '../assets/svg/logo';
import { apiRequest } from '@/lib/queryClient';

type Property = {
  // Basic identifiers
  id: string;
  property_id?: string;  // From database
  developerName: string;
  reraNumber: string;
  
  // Project identity & status
  projectName: string;
  constructionStatus: string;
  propertyType: string;
  location: string;
  possessionDate: string;
  
  // Community and scale
  isGatedCommunity: boolean;
  totalUnits: number;
  areaSizeAcres: number;
  
  // Configuration & dimensions
  configurations: string;
  minSizeSqft: number;
  maxSizeSqft: number;
  pricePerSqft: number;
  price_per_sqft?: number;  // From database
  pricePerSqftOTP: number;
  price: number;
  
  // Geo & source info
  longitude: number;
  latitude: number;
  projectDocumentsLink: string;
  source: string;
  
  // Contact & sales info
  builderContactInfo: string;
  listingType: string;
  loanApprovedBanks: string[];
  
  // Contextual & supporting info
  nearbyLocations: string[];
  remarksComments: string;
  amenities: string[];
  faq: string[];
  
  // Legacy fields to maintain compatibility
  name: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  description: string;
  features: string[];
  images: string[];
  builder: string;
  possession: string;
  rating: number;
  googleRating?: number;
};

export default function AllPropertiesPage() {
  // Set page title when component mounts
  useEffect(() => {
    document.title = "All Properties | Relai";
    
    // Restore title when component unmounts
    return () => {
      document.title = "Relai | The Ultimate Real Estate Buying Experience";
    };
  }, []);



  // Format complete budget range using Min Budget and Max Budget from database
  const formatBudgetRange = (property: Property) => {
    const minBudget = (property as any).minimumBudget || property.price || 0;
    const maxBudget = (property as any).maximumBudget || 0;
    
    // Use the existing formatPrice function that's already defined in the file
    const formatPriceValue = (price: number) => {
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
      return `${formatPriceValue(minBudget)} -- ${formatPriceValue(maxBudget)}`;
    } else if (minBudget > 0) {
      return formatPriceValue(minBudget);
    } else if (maxBudget > 0) {
      return formatPriceValue(maxBudget);
    }
    
    return "Price on Request";
  };

  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocations, setSelectedLocations] = useState<string[]>(['any']);
  const [propertyType, setPropertyType] = useState('any');
  const [configurations, setConfigurations] = useState('any');
  const [constructionStatus, setConstructionStatus] = useState('any');

  // Initial price range with fallback values
  const [pricePerSqftRange, setPricePerSqftRange] = useState<[number, number]>([0, 20000]);
  const [radiusKm, setRadiusKm] = useState('0'); // Default: 0 km (no radius)
  const [showFilters, setShowFilters] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [locationSearchTerm, setLocationSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list'); // Default view: list
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [propertiesPerPage] = useState(12); // 12 properties per page for good distribution
  
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
  const locationParam = useMemo(() => selectedLocations.includes('any') 
    ? 'any' 
    : selectedLocations.join(','), [selectedLocations]);
  
  // For exact location or radius search, the system should behave consistently:
  // - When 'exact location only' is selected: we should include only properties with exact location match
  // - When any radius is selected (e.g. 2km): we should include properties within the radius
  // - In both cases, we need to use the radius-search endpoint with the appropriate radius
  
  // Determine whether to use radius search API with radius 0 (exact location) or with selected radius
  // We'll use the radius search API for both exact location and with radius, to ensure consistent behavior
  const exactLocationOnly = radiusKm === 'exact';
  const actualRadius = useMemo(() => (exactLocationOnly ? 'exact' : parseInt(radiusKm, 10)), [exactLocationOnly, radiusKm]);
  const useRadiusSearch = useMemo(() => locationParam !== 'any' && locationParam !== '', [locationParam]);
  
  // Log for debugging
  useEffect(() => {
    if (exactLocationOnly) {
      console.log('Search mode: Exact location only');
    } else {
      console.log(`Search mode: ${actualRadius}km radius`);
    }
    console.log(`Selected locations: ${locationParam}`);
  }, [exactLocationOnly, actualRadius, locationParam]);
  
  // Fetch properties data from API - always use database endpoint
  const { data, isLoading, error } = useQuery({
    queryKey: [
      useRadiusSearch ? '/api/radius-search' : '/api/all-properties', 
      debouncedSearchTerm, 
      locationParam, 
      propertyType, 
      pricePerSqftRange[0], 
      pricePerSqftRange[1], 
      configurations,
      constructionStatus,
      actualRadius
    ],
    queryFn: () => {
      // Use the dedicated radius search endpoint when locations are specified
      if (useRadiusSearch) {
        if (exactLocationOnly) {
          console.log('Using radius search API with exact location only');
        } else {
          console.log(`Using radius search API with radius: ${actualRadius}km`);
        }
        return apiRequest<{ properties: Property[]; total: number }>(
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
        // Use the standard API endpoint
        const endpoint = 'http://localhost:5001/api/all-properties'; // Updated to absolute URL
        console.log(`Using standard properties endpoint`);
        // Build query params only for real values
        const params = new URLSearchParams();
        if (debouncedSearchTerm && debouncedSearchTerm !== 'any') params.append('search', debouncedSearchTerm);
        if (locationParam && locationParam !== 'any' && locationParam !== '') params.append('location', locationParam);
        if (propertyType && propertyType !== 'any' && propertyType !== '') params.append('propertyType', propertyType);
        if (pricePerSqftRange[0] !== 0) params.append('minPricePerSqft', String(pricePerSqftRange[0]));
        if (pricePerSqftRange[1] !== 20000) params.append('maxPricePerSqft', String(pricePerSqftRange[1]));
        if (configurations && configurations !== 'any' && configurations !== '') params.append('configurations', configurations);
        if (constructionStatus && constructionStatus !== 'any' && constructionStatus !== '') params.append('constructionStatus', constructionStatus);
        const url = params.toString() ? `${endpoint}?${params.toString()}` : endpoint;
        return apiRequest<{ properties: Property[]; total: number; imageQualityEnabled?: boolean }>(url);
      }
    },
  });
  
  // Get the properties data from the API and apply intelligent possession timeline filtering
  const rawProperties = useMemo(() => data?.properties || [], [data]);
  
  // Use raw properties directly since filtering is now handled by backend and radius logic
  const allProperties = rawProperties;
  
  // Calculate pagination
  const totalPages = Math.ceil(allProperties.length / propertiesPerPage);
  const startIndex = (currentPage - 1) * propertiesPerPage;
  const endIndex = startIndex + propertiesPerPage;
  const properties = useMemo(() => allProperties.slice(startIndex, endIndex), [allProperties, startIndex, endIndex]);
  
  // Reset current page when filters change or search results change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, locationParam, propertyType, pricePerSqftRange, configurations, constructionStatus, actualRadius]);
  
  // Fetch filter options from API
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
  const propertyTypes = filterOptionsData?.filterOptions?.propertyTypes || ['Apartment', 'Villa', 'Plot', 'Commercial', 'Penthouse'];
  const configurationOptions = filterOptionsData?.filterOptions?.configurations || [];
  const constructionStatusOptions = filterOptionsData?.filterOptions?.constructionStatuses || [];
  
  // Get price range from filter options API
  const minPricePerSqft = filterOptionsData?.filterOptions?.priceRange?.min || 0;
  const maxPricePerSqft = filterOptionsData?.filterOptions?.priceRange?.max || 20000;
  
  // Update price range when filter options change
  useEffect(() => {
    if (filterOptionsData?.filterOptions?.priceRange) {
      setPricePerSqftRange([
        filterOptionsData.filterOptions.priceRange.min || 0,
        filterOptionsData.filterOptions.priceRange.max || 20000
      ]);
    }
  }, [filterOptionsData]);
  
  // Fetch location options from API (using Google Maps geocoded locations)
  const { data: locationData } = useQuery({
    queryKey: ['/api/property-geocoded-locations'],
    queryFn: () => apiRequest<{ locations: string[] }>('/api/property-geocoded-locations'),
  });
  
  // Use locations from API or fallback to empty array if data is loading
  const locations = locationData?.locations || [];
  
  // Filter locations based on search term and remove any 'any' entries since we handle it separately
  // Also normalize all location strings to avoid duplicates with different cases
  const normalizedLocations = new Set(
    locations.map((loc: string) => loc.toLowerCase())
  );
  
  // Filter locations based on search term
  const filteredLocations = Array.from(normalizedLocations)
    .filter((loc: string) => 
      // Exclude "any" and "any location" from the locations list as we handle it separately
      loc !== 'any' && 
      loc !== 'any location' &&
      loc.includes(locationSearchTerm.toLowerCase())
    )
    // Convert back to proper case format (capitalize first letter of each word)
    .map((loc: string) => 
      loc.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    );
  
  const formatPrice = (price: number | null | undefined) => {
    if (!price) return '₹N/A';
    
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)} Lac`;
    } else {
      return `₹${price.toLocaleString()}`;
    }
  };
  
  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedLocations(['any']);
    setPropertyType('any');
    setConfigurations('any');
    setConstructionStatus('any');
    setPricePerSqftRange([minPricePerSqft, maxPricePerSqft]);
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
              className="pl-10"
            />
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
          
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FilterIcon size={18} />
            Filters
          </Button>
        </div>
      </div>
      
      {/* Filters Section */}
      {showFilters && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Filters</h2>
            <Button variant="ghost" size="sm" onClick={resetFilters} className="text-gray-500">
              Reset All
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Locations</label>
              <div className="relative">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full justify-between font-normal"
                    >
                      {selectedLocations.includes('any') 
                        ? "Any location" 
                        : selectedLocations.length === 1 
                          ? selectedLocations[0].charAt(0).toUpperCase() + selectedLocations[0].slice(1)
                          : `${selectedLocations.length} locations selected`
                      }
                      <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search locations..." 
                        value={locationSearchTerm}
                        onValueChange={setLocationSearchTerm}
                        className="h-9"
                      />
                      <CommandList>
                        <CommandEmpty>No locations found.</CommandEmpty>
                        <CommandGroup className="max-h-[200px] overflow-y-auto">
                          <CommandItem
                            key="any-location"
                            onSelect={() => {
                              setSelectedLocations(['any']);
                              setRadiusKm('exact');
                            }}
                            className="flex items-center cursor-pointer"
                          >
                            <div className="flex items-center mr-2">
                              <Checkbox
                                checked={selectedLocations.includes('any')}
                                id="any-location"
                                className="mr-2"
                              />
                            </div>
                            Any location
                          </CommandItem>
                          
                          {filteredLocations.map((loc: string) => (
                            <CommandItem
                              key={loc}
                              onSelect={() => {
                                if (selectedLocations.includes('any')) {
                                  // If 'any' was selected, we're switching to specific locations
                                  setSelectedLocations([loc.toLowerCase()]);
                                } else if (selectedLocations.includes(loc.toLowerCase())) {
                                  // Remove this location if it's already selected
                                  const newLocations = selectedLocations.filter(l => l !== loc.toLowerCase());
                                  // If no locations left, revert to 'any'
                                  setSelectedLocations(newLocations.length ? newLocations : ['any']);
                                } else {
                                  // Add this location to the selection
                                  setSelectedLocations([...selectedLocations, loc.toLowerCase()]);
                                }
                              }}
                              className="flex items-center cursor-pointer"
                            >
                              <div className="flex items-center mr-2">
                                <Checkbox
                                  checked={selectedLocations.includes(loc.toLowerCase())}
                                  id={`location-${loc}`}
                                  className="mr-2"
                                />
                              </div>
                              {loc}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                
                {selectedLocations.length > 0 && !selectedLocations.includes('any') && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {selectedLocations.map((loc: string) => (
                      <Badge 
                        key={loc} 
                        variant="outline" 
                        className="bg-blue-50 text-xs py-1"
                      >
                        {loc.charAt(0).toUpperCase() + loc.slice(1)}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newLocations = selectedLocations.filter(l => l !== loc);
                            setSelectedLocations(newLocations.length ? newLocations : ['any']);
                          }}
                          className="h-4 w-4 p-0 ml-1 text-gray-400 hover:text-gray-900"
                        >
                          <X size={12} />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Show radius filter only when specific locations are selected (not 'any') */}
              {!selectedLocations.includes('any') && (
                <div className="mt-3">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Also include projects around</label>
                  <Select value={radiusKm} onValueChange={setRadiusKm}>
                    <SelectTrigger>
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
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger>
                  <SelectValue placeholder="Any type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any type</SelectItem>
                  {propertyTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
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
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Also include projects around</label>
              <Select value={radiusKm} onValueChange={setRadiusKm}>
                <SelectTrigger>
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
            
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Per Sq.ft: ₹{pricePerSqftRange[0]} - ₹{pricePerSqftRange[1]}
              </label>
              <Slider
                defaultValue={[minPricePerSqft, maxPricePerSqft]}
                min={minPricePerSqft}
                max={maxPricePerSqft}
                step={Math.max(100, Math.floor((maxPricePerSqft - minPricePerSqft) / 40))} // Appropriate step size
                value={pricePerSqftRange}
                onValueChange={(value) => setPricePerSqftRange(value as [number, number])}
                className="mt-6"
              />
            </div>
          </div>
          
          <div className="flex justify-end mt-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowFilters(false)}
              className="text-gray-500 mr-2"
            >
              Cancel
            </Button>
            <Button onClick={() => setShowFilters(false)}>
              Apply Filters
            </Button>
          </div>
        </div>
      )}
      
      {/* Active Filters */}
      {((!selectedLocations.includes('any')) || (propertyType && propertyType !== 'any') || (configurations && configurations !== 'any') || (constructionStatus && constructionStatus !== 'any') || pricePerSqftRange[0] > 0 || pricePerSqftRange[1] < 20000) && (
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="text-sm text-gray-500 mr-2 mt-1">Active Filters:</span>
          
          {!selectedLocations.includes('any') && selectedLocations.map((loc: string) => (
            <Badge key={loc} variant="outline" className="flex items-center gap-1 py-1">
              <MapPinIcon size={14} /> {loc.charAt(0).toUpperCase() + loc.slice(1)}
              <button 
                onClick={() => {
                  const newLocations = selectedLocations.filter(l => l !== loc);
                  setSelectedLocations(newLocations.length ? newLocations : ['any']);
                }} 
                className="ml-1"
              >
                <X size={14} />
              </button>
            </Badge>
          ))}
          
          {propertyType && propertyType !== 'any' && (
            <Badge variant="outline" className="flex items-center gap-1 py-1">
              <HomeIcon size={14} /> {propertyType}
              <button onClick={() => setPropertyType('any')} className="ml-1">
                <X size={14} />
              </button>
            </Badge>
          )}
          
          {configurations && configurations !== 'any' && (
            <Badge variant="outline" className="flex items-center gap-1 py-1">
              <BedDoubleIcon size={14} /> {configurations}
              <button onClick={() => setConfigurations('any')} className="ml-1">
                <X size={14} />
              </button>
            </Badge>
          )}
          
          {constructionStatus && constructionStatus !== 'any' && (
            <Badge variant="outline" className="flex items-center gap-1 py-1">
              <CalendarIcon size={14} /> {constructionStatus}
              <button onClick={() => setConstructionStatus('any')} className="ml-1">
                <X size={14} />
              </button>
            </Badge>
          )}
          
          {(pricePerSqftRange[0] > minPricePerSqft || pricePerSqftRange[1] < maxPricePerSqft) && (
            <Badge variant="outline" className="flex items-center gap-1 py-1">
              ₹{pricePerSqftRange[0]}-₹{pricePerSqftRange[1]}/sq.ft
              <button onClick={() => setPricePerSqftRange([minPricePerSqft, maxPricePerSqft])} className="ml-1">
                <X size={14} />
              </button>
            </Badge>
          )}
          
          {!selectedLocations.includes('any') && radiusKm && radiusKm !== 'exact' && (
            <Badge variant="outline" className="flex items-center gap-1 py-1">
              <Target size={14} /> {radiusKm}km radius
              <button onClick={() => setRadiusKm('exact')} className="ml-1">
                <X size={14} />
              </button>
            </Badge>
          )}
        </div>
      )}
      
      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin w-12 h-12 border-t-2 border-blue-500 border-r-2 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Loading properties...</p>
        </div>
      )}
      
      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-8 rounded-lg text-center">
          <p className="text-lg font-medium mb-2">Unable to load properties</p>
          <p className="text-sm">Please try again later or contact support if the problem persists.</p>
          <div className="mt-4">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      )}
      
      {/* No Results */}
      {!isLoading && !error && properties.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-10 text-center">
          <div className="mb-4">
            <HomeIcon className="w-12 h-12 text-gray-400 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
          <p className="text-gray-500 mb-6">Try adjusting your search or filters to find what you're looking for.</p>
          <Button onClick={resetFilters}>
            Clear All Filters
          </Button>
        </div>
      )}
      
      {/* View Toggle */}
      {!isLoading && !error && allProperties.length > 0 && (
        <div className="flex justify-between items-center mb-6">
          <p className="text-sm text-gray-500">
            Showing {startIndex + 1}-{Math.min(endIndex, allProperties.length)} of {allProperties.length} properties
          </p>
          
          <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-md">
            <button 
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
            >
              <ListIcon size={18} />
              <span className="text-sm font-medium">List</span>
            </button>
            <button 
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded ${viewMode === 'map' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
            >
              <MapIcon size={18} />
              <span className="text-sm font-medium">Map</span>
            </button>
          </div>
        </div>
      )}
      
      {/* Map View */}
      {viewMode === 'map' && (
        <div className="mb-8">
          {isLoading ? (
            <div className="h-[500px] bg-gray-100 rounded-lg flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-3" />
              <p className="text-gray-600">Loading properties...</p>
            </div>
          ) : error ? (
            <div className="h-[500px] bg-gray-100 rounded-lg flex flex-col items-center justify-center p-4 text-center">
              <AlertCircle className="h-8 w-8 text-red-500 mb-3" />
              <p className="text-red-600 font-medium mb-2">Error loading properties</p>
              <p className="text-gray-600 max-w-md">There was a problem fetching property data. Please try again later.</p>
            </div>
          ) : properties.length === 0 ? (
            <div className="h-[500px] bg-gray-100 rounded-lg flex flex-col items-center justify-center p-4 text-center">
              <SearchX className="h-8 w-8 text-gray-400 mb-3" />
              <p className="text-gray-700 font-medium mb-2">No properties found</p>
              <p className="text-gray-600 max-w-md">Try adjusting your search filters to see more results.</p>
            </div>
          ) : (
            <PropertiesMap properties={properties} />
          )}
        </div>
      )}
      
      {/* Properties Grid - List View */}
      {!isLoading && !error && properties.length > 0 && viewMode === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <div key={property.id} className="block">
                <Link href={`/property/${property.id}`}>
                  <Card className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
                    {/* Top part: Property image carousel */}
                    <div className="relative w-full">
                      {/* Property image carousel */}
                      <div className="w-full h-64 relative">
                        <div 
                          className="relative w-full h-full group"
                        >
                          {property.images && property.images.length > 0 ? (
                            <img 
                              src={property.images[0]}
                              alt={(property as any)['ProjectName'] || property.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                              <div className="text-gray-400">No image available</div>
                            </div>
                          )}
                            
                            {/* Star Rating - Top Left Corner */}
                            <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1">
                              <StarRating 
                                rating={calculatePropertyRating(property).overall} 
                                size="sm" 
                                showNumber={true}
                                className="text-white"
                              />
                            </div>
                            
                            {/* Navigation controls - always visible on mobile, visible on hover for desktop */}
                            {((property.images && property.images.length > 1) || (property.images && property.images.length > 1)) && (
                              <>
                                <button 
                                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/60 rounded-full p-1.5 text-white sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10"
                                  aria-label="Previous image"
                                >
                                  <ChevronLeft size={18} />
                                </button>
                                <button 
                                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/60 rounded-full p-1.5 text-white sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10"
                                  aria-label="Next image"
                                >
                                  <ChevronRight size={18} />
                                </button>
                              </>
                            )}
                          </div>
                      </div>
                      
                      {/* Property type badge */}
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-white text-blue-600 font-medium">
                          {property.propertyType || 'Property'}
                        </Badge>
                      </div>
                      
                      {/* Location Rating Badge - Temporarily disabled */}
                      {/* TODO: Re-enable when Google ratings are available in the data */}
                    </div>
                    
                    {/* Bottom part: Property details */}
                    <div className="flex flex-col flex-grow">
                      <CardContent className="p-4 flex-grow">
                        {/* Property name and construction status */}
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                            {(property as any)['ProjectName'] || "No Name"}
                          </h3>
                          {property.constructionStatus && (
                            <Badge 
                              className={
                                property.constructionStatus.toLowerCase().includes('ready') 
                                  ? "bg-green-100 text-green-800" 
                                  : "bg-blue-100 text-blue-800"
                              }
                            >
                              {property.constructionStatus}
                            </Badge>
                          )}
                        </div>
                        
                        {/* Developer and location */}
                        <div className="space-y-1 mb-3">
                          <div className="flex items-center gap-1 text-gray-600">
                            <span className="text-sm">By {(property as any)['BuilderName'] || "Unknown Builder"}</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-600">
                            <MapPinIcon size={14} className="flex-shrink-0" />
                            <span className="text-sm line-clamp-1">{(property as any)['Area'] || "Unknown Area"}</span>
                          </div>
                        </div>
                        
                        {/* Property specifications in a grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                          {/* Configuration */}
                          {property.configurations && Array.isArray(property.configurations) && property.configurations.length > 0 && (
                            <div className="flex flex-col">
                              <div className="flex items-center gap-1 text-gray-500 mb-1">
                                <BedDoubleIcon size={14} />
                                <span className="text-xs">Configuration</span>
                              </div>
                              <span className="text-sm font-medium">
                                {property.configurations.map((conf: any, idx: number) => `${conf.type} ${conf.sizeRange}${conf.sizeUnit}${conf.facing ? ' ' + conf.facing : ''}`).join(', ')}
                              </span>
                            </div>
                          )}
                          
                          {/* Size */}
                          {(property.minSizeSqft > 0 || property.area > 0) && (
                            <div className="flex flex-col">
                              <div className="flex items-center gap-1 text-gray-500 mb-1">
                                <span className="text-xs flex items-center gap-1">
                                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 21H3V3" />
                                    <path d="M21 3H7" />
                                    <path d="M3 21L21 3" />
                                  </svg>
                                  Area
                                </span>
                              </div>
                              <span className="text-sm font-medium">
                                {property.minSizeSqft > 0 && property.maxSizeSqft > 0 && property.minSizeSqft !== property.maxSizeSqft
                                  ? `${property.minSizeSqft}-${property.maxSizeSqft} sq.ft`
                                  : `${property.minSizeSqft || property.area} sq.ft`}
                              </span>
                            </div>
                          )}
                          
                          {/* Possession */}
                          {(property as any)['Possession_date'] && (
                            <div className="flex flex-col">
                              <div className="flex items-center gap-1 text-gray-500 mb-1">
                                <CalendarIcon size={14} />
                                <span className="text-xs">Possession</span>
                              </div>
                              <span className="text-sm font-medium line-clamp-1">
                                {(property as any)['Possession_date']}
                              </span>
                            </div>
                          )}
                        </div>
                        

                      </CardContent>
                      
                      <CardFooter className="px-4 pt-0 pb-4">
                        <div className="flex justify-between items-end w-full">
                          <div>
                            <p className="text-sm text-gray-500">Price Per Sq.ft</p>
                            <p className="text-lg font-bold text-blue-600">
                              {(property as any)['Price_per_sft'] ? `₹${(property as any)['Price_per_sft'].toLocaleString()}` : 'N/A'}
                            </p>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Total Price</p>
                            <p className="text-lg font-semibold">{formatBudgetRange(property)}</p>
                          </div>
                        </div>
                      </CardFooter>
                    </div>
                  </Card>
                </Link>
              </div>
            ))}
          </div>
      )}
      
      {/* Pagination Controls */}
      {!isLoading && !error && allProperties.length > propertiesPerPage && (
        <div className="flex justify-center items-center mt-8 space-x-2">
          <Button
            variant="outline"
            onClick={() => {
              setCurrentPage(prev => Math.max(prev - 1, 1));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            disabled={currentPage === 1}
            className="flex items-center gap-2"
          >
            <ChevronLeft size={16} />
            Previous
          </Button>
          
          <div className="flex items-center space-x-1">
            {/* Page Numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  onClick={() => {
                    setCurrentPage(pageNum);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-10 h-10 p-0"
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            onClick={() => {
              setCurrentPage(prev => Math.min(prev + 1, totalPages));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            disabled={currentPage === totalPages}
            className="flex items-center gap-2"
          >
            Next
            <ChevronRight size={16} />
          </Button>
        </div>
      )}
      
      {/* Total properties info */}
      {!isLoading && !error && allProperties.length > 0 && (
        <div className="text-center mt-6 text-sm text-gray-500">
          Page {currentPage} of {totalPages} • Total {allProperties.length} properties
        </div>
      )}
    </div>
  );
}