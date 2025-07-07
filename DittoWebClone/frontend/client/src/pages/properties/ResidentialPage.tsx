import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { 
  SearchIcon, FilterIcon, HomeIcon, MapPinIcon, Calendar as CalendarIcon, 
  ChevronLeft, ChevronRight, MapIcon, ListIcon, AlertCircle, 
  SearchX, Loader2, Building2 
} from 'lucide-react';

// Assuming these are custom components from your project, like shadcn/ui
import { StarRating } from '@/components/ui/star-rating';
import PropertiesMap from '@/components/map/PropertiesMap';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Assuming you have a shared API request function
import { apiRequest } from '@/lib/queryClient';

//================================================================================
// HELPER TYPES & CONSTANTS
//================================================================================

type ApiProperty = {
  id: string;
  _id: string;
  [key: string]: any; 
};

const API_BASE_URL_PROPERTIES = import.meta.env.VITE_API_URL_PROPERTIES || 'http://localhost:5001';
const API_BASE_URL_OTHERS = import.meta.env.VITE_API_URL_OTHERS || 'http://localhost:5001';

//================================================================================
// HELPER FUNCTIONS
//================================================================================

/**
 * Helper to get property image path like All Properties page
 */
function getPropertyImagePath(property: any): string {
  const API_URL = "http://13.235.48.178:5001";
  if (property.images && property.images.length > 0) {
    if (property.images[0].startsWith('http')) return property.images[0];
    // Remove '/property_images/' if present
    const imgName = property.images[0].replace(/^\/property_images\//, '');
    return `${API_URL}/property_images/${imgName}`;
  }
  const name = (property.ProjectName || property.projectName || '').toLowerCase().replace(/\s+/g, '_20');
  const loc = (property.Area || property.location || '').toLowerCase().replace(/\s+/g, '_20');
  if (!name || !loc) return '/img/placeholder-property.png';
  // Remove '/property_images/' from the start if present
  const imgName = `${name}_${loc}_0.jpg`.replace(/^\/property_images\//, '');
  return `${API_URL}/property_images/${imgName}`;
}

/**
 * Extracts the plain data object from a potential Mongoose document structure.
 */
const extractPropertyData = (property: any): any => {
  if (property && property._doc) {
    return { ...property._doc, id: property.id || property._id };
  }
  return property || {};
};

/**
 * Formats a date string from DD-MM-YYYY to MM-YY (e.g., "01-08-2028" -> "08-28").
 */
const formatPossessionDate = (dateStr?: string): string => {
  if (!dateStr || typeof dateStr !== 'string' || !/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
    return "N/A";
  }
  try {
    const parts = dateStr.split('-');
    return `${parts[1]}-${parts[2].slice(-2)}`;
  } catch (error) {
    return "N/A";
  }
};

/**
 * Robustly extracts and formats property configurations (e.g., "2 BHK, 3 BHK").
 */
const getFormattedConfigurations = (property: any): string => {
  let configs = property.configurations;
  if (Array.isArray(configs) && configs.length > 0) {
      const types = new Set(configs.map(c => c.type || c.Type).filter(Boolean));
      if (types.size > 0) return Array.from(types).join(', ');
  }

  let configDetails = property.configurationDetails;
  if (Array.isArray(configDetails) && configDetails.length > 0) {
    const types = new Set(configDetails.map(c => c.type || c.Type || c.bhkType).filter(Boolean));
    if (types.size > 0) return Array.from(types).join(', ');
  }

  const possibleFields = [property.Configurations, property.configuration, property.bhk, property.BHK, property.unitType, property.UnitType];
  const foundField = possibleFields.find(field => typeof field === 'string' && field.trim());
  if (foundField) return foundField;

  if (property.bedrooms) return `${property.bedrooms} BHK`;

  return 'N/A';
};


//================================================================================
// MAIN COMPONENT
//================================================================================

export default function AllPropertiesPage() {
  // --- STATE AND HOOKS ---
  const [_, setLocation] = useLocation();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [currentPage, setCurrentPage] = useState(1);
  const [propertiesPerPage] = useState(12);

  // --- EFFECTS ---

  useEffect(() => {
    document.title = "All Properties | Relai";
    return () => {
      document.title = "Relai | The Ultimate Real Estate Buying Experience";
    };
  }, []);
  
  useEffect(() => {
    const timerId = setTimeout(() => setDebouncedSearchTerm(searchTerm), 500);
    return () => clearTimeout(timerId);
  }, [searchTerm]);

  // --- DATA FETCHING ---
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['properties', debouncedSearchTerm],
    queryFn: () => {
      const params = new URLSearchParams();
      if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
      const url = `${API_BASE_URL_PROPERTIES}/api/all-properties?${params.toString()}`;
      return apiRequest<{ properties: ApiProperty[] }>(url);
    },
  });

  // --- DERIVED STATE ---
  
  const allProperties = useMemo(() => data?.properties || [], [data]);
  const totalPages = Math.ceil(allProperties.length / propertiesPerPage);
  const paginatedProperties = useMemo(() => {
    const startIndex = (currentPage - 1) * propertiesPerPage;
    return allProperties.slice(startIndex, startIndex + propertiesPerPage);
  }, [allProperties, currentPage, propertiesPerPage]);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  // --- HELPER FUNCTION (specific to this component's render logic) ---
  
  const formatBudgetRange = (property: any): string => {
    const propertyData = extractPropertyData(property);
    
    const formatPriceValue = (price: number): string | null => {
      if (!price) return null;
      if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
      if (price >= 100000) return `₹${(price / 100000).toFixed(2)} Lac`;
      return `₹${price.toLocaleString()}`;
    };

    const minBudget = propertyData.minimumBudget || 0;
    const maxBudget = propertyData.maximumBudget || 0;
    
    if (minBudget || maxBudget) {
      const formattedMin = formatPriceValue(minBudget);
      const formattedMax = formatPriceValue(maxBudget);
      if (formattedMin && formattedMax && formattedMin !== formattedMax) {
        return `${formattedMin} - ${formattedMax}`;
      }
      return formattedMin || formattedMax || "On Request";
    }

    const pricePerSqft = propertyData.Price_per_sft;
    if (!pricePerSqft) return "On Request";

    let minSize = 1000, maxSize = 3000;
    const configDetails = propertyData.configurationDetails;
    if (configDetails && Array.isArray(configDetails) && configDetails.length > 0) {
      const sizes = configDetails
        .map((conf: any) => conf.sizeRange || conf.area || conf.size || conf.superBuiltupArea)
        .filter((size: number | null) => typeof size === 'number' && size !== null);

      if (sizes.length > 0) {
        minSize = Math.min(...sizes);
        maxSize = Math.max(...sizes);
      }
    }
    
    const minBudgetCalculated = pricePerSqft * minSize;
    const maxBudgetCalculated = pricePerSqft * maxSize;
    const formattedMin = formatPriceValue(minBudgetCalculated);
    const formattedMax = formatPriceValue(maxBudgetCalculated);

    if (formattedMin && formattedMax && formattedMin !== formattedMax) {
      return `${formattedMin} - ${formattedMax}`;
    }
    return formattedMin || formattedMax || "On Request";
  };

  // --- EVENT HANDLERS ---
  
  const handleCardClick = (propertyId: string) => {
    setLocation(`/property/${propertyId}`);
  };

  // --- RENDER ---

  return (
    <div className="container mx-auto px-4 pt-32 pb-16">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Residential Properties</h1>
        <div className="w-full md:w-auto flex items-center gap-3">
          <div className="relative flex-grow md:w-64">
            <Input
              placeholder="Search properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11"
            />
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          </div>
          <Button variant="outline" className="h-11" onClick={() => setShowFilters(!showFilters)}>
            <FilterIcon size={16} className="mr-2" />
            Filters
          </Button>
        </div>
      </header>

      {showFilters && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 border">
          <h3 className="text-lg font-semibold text-gray-800">Advanced Filters</h3>
          <p className="text-gray-500 text-sm mt-4">Filter controls would be displayed here.</p>
        </div>
      )}

      {!isLoading && !error && allProperties.length > 0 && (
        <div className="flex justify-between items-center mb-6">
          <p className="text-sm text-gray-500">
            Showing {Math.min((currentPage - 1) * propertiesPerPage + 1, allProperties.length)}-{Math.min(currentPage * propertiesPerPage, allProperties.length)} of {allProperties.length} properties
          </p>
          <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-md">
            <button onClick={() => setViewMode('list')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium ${viewMode === 'list' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:bg-gray-200'}`}>
              <ListIcon size={16} /> List
            </button>
            <button onClick={() => setViewMode('map')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium ${viewMode === 'map' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:bg-gray-200'}`}>
              <MapIcon size={16} /> Map
            </button>
          </div>
        </div>
      )}

      <main>
        {isLoading && <div className="text-center py-24 flex flex-col items-center gap-4"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /><p className="text-gray-600 text-lg">Loading Properties...</p></div>}
        {error && <div className="text-center py-20 bg-red-50 p-8 rounded-lg border border-red-200"><AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" /><h3 className="text-xl font-semibold text-red-800">Failed to Load Properties</h3><p className="text-red-600 mt-2">Please try again later.</p></div>}
        {!isLoading && !error && paginatedProperties.length === 0 && <div className="text-center py-20 bg-gray-50 p-8 rounded-lg border"><SearchX className="w-12 h-12 text-gray-400 mx-auto mb-4" /><h3 className="text-xl font-semibold text-gray-800">No Properties Found</h3><p className="text-gray-500 mt-2">Try adjusting your search filters.</p></div>}
        
        {viewMode === 'map' && !isLoading && !error && (
          <div className="mb-8 h-[600px] rounded-lg overflow-hidden shadow-md border">
            <PropertiesMap properties={allProperties.map(extractPropertyData)} />
          </div>
        )}

        {viewMode === 'list' && paginatedProperties.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedProperties.map((property) => {
              const propertyData = extractPropertyData(property);
              return (
                <div key={propertyData.id || propertyData._id} onClick={() => handleCardClick(propertyData.id || propertyData._id)} className="cursor-pointer">
                  <Card className="flex flex-col h-full overflow-hidden rounded-md border-gray-200 hover:shadow-lg transition-shadow duration-300">
                    <div className="relative w-full h-48 bg-gray-200">
                      {propertyData.images && propertyData.images.length > 0 ? (
                        <img src={getPropertyImagePath(propertyData)} alt={propertyData.ProjectName || 'Property Image'} className="w-full h-full object-cover" loading="lazy" onError={e => { (e.target as HTMLImageElement).src = '/img/placeholder-property.png'; }} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100"><HomeIcon className="w-12 h-12 text-gray-400" /></div>
                      )}
                      <div className="absolute top-2 left-2"><div className="bg-black/60 backdrop-blur-sm rounded-md px-2 py-1"><StarRating rating={propertyData.rating || 4} size="sm" showNumber={false} className="text-yellow-400" /></div></div>
                      {propertyData.Possession_date && (
                         <div className="absolute bottom-2 right-2"><Badge className="bg-blue-600 text-white font-bold text-xs tracking-wider border-2 border-white/50 shadow-lg">{formatPossessionDate(propertyData.Possession_date)}</Badge></div>
                      )}
                    </div>
                    
                    <CardContent className="p-4 flex flex-col flex-grow">
                      <h3 className="text-base font-bold text-gray-800 truncate uppercase">{propertyData.ProjectName || "Unnamed Project"}</h3>
                      <p className="text-xs text-gray-500 mb-2">By {propertyData.BuilderName || "Unknown Builder"}</p>
                      <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-4">
                        <MapPinIcon size={12} className="flex-shrink-0" /> {propertyData.Area || "N/A"}
                      </div>

                      <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-3 mb-auto">
                        <div className="flex flex-col"><span className="text-xs text-gray-400">Configuration</span><span className="text-sm font-semibold text-gray-700">{getFormattedConfigurations(propertyData)}</span></div>
                        <div className="flex flex-col text-right"><span className="text-xs text-gray-400">Possession</span><span className="text-sm font-semibold text-gray-700">{formatPossessionDate(propertyData.Possession_date)}</span></div>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="px-4 py-3 bg-gray-50 border-t">
                      <div className="flex justify-between items-end w-full">
                        <div>
                          <p className="text-xs text-gray-500">Price Per Sq.ft</p>
                          <p className="text-base font-bold text-blue-600">{propertyData.Price_per_sft ? `₹${propertyData.Price_per_sft.toLocaleString()}` : 'N/A'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Budget Price</p>
                          <p className="text-base font-bold text-gray-800">{formatBudgetRange(propertyData)}</p>
                        </div>
                      </div>
                    </CardFooter>
                  </Card>
                </div>
              );
            })}
          </div>
        )}
        
        {totalPages > 1 && viewMode === 'list' && (
          <div className="flex justify-center items-center mt-12 space-x-2">
            <Button variant="outline" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}><ChevronLeft size={16} className="mr-2" /> Previous</Button>
            <span className="text-sm text-gray-700 font-medium px-4 py-2 bg-white border rounded-md shadow-sm">Page {currentPage} of {totalPages}</span>
            <Button variant="outline" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>Next <ChevronRight size={16} className="ml-2" /></Button>
          </div>
        )}
      </main>
    </div>
  );
}