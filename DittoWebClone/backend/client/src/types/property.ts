export type Property = {
  // Basic identifiers
  id: string | number;
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
};

// Types for property preferences and user information
export type PropertyPreference = {
  budget?: string;
  possession?: string;
  configuration?: string;
  locations?: string[];
  otherLocation?: string;
  propertyType?: string;
  communityType?: string;
  minBudget?: number;
  maxBudget?: number;
  minPricePerSqft?: number;
  maxPricePerSqft?: number;
};

export type UserInfo = {
  name: string;
  phone: string;
  appointmentDate: Date | undefined;
  appointmentTime: string;
};