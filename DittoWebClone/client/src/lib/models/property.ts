// Property types and interfaces

export type PossessionStatus = 
  | 'Immediate' 
  | '0-1 Year' 
  | '1-2 Years' 
  | '2-3 Years' 
  | '3-4 Years' 
  | '5+ Years';

export type PropertyConfiguration = 
  | '1 BHK'
  | '2 BHK'
  | '3 BHK'
  | '4 BHK'
  | '5 BHK'
  | 'Villa'
  | 'Plot';

export type PropertyFacing = 
  | 'East' 
  | 'West' 
  | 'North' 
  | 'South' 
  | 'North-East'
  | 'North-West'
  | 'South-East'
  | 'South-West';

export interface PropertyLocation {
  address: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface NearbyPlace {
  name: string;
  type: 'School' | 'Hospital' | 'Mall' | 'Park' | 'Metro' | 'Restaurant' | 'Bus Stand' | 'Airport' | 'Railway Station';
  distance: string; // e.g., "2.5 km"
  travelTime?: string; // e.g., "15 mins"
}

export interface BuilderInfo {
  name: string;
  established: string;
  reraId: string;
  completedProjects: number;
  ongoingProjects: number;
  rating: number; // out of 5
}

export interface PropertyAmenity {
  name: string;
  category: 'Sports' | 'Leisure' | 'Convenience' | 'Security' | 'Health' | 'Kids' | 'Utility';
  available: boolean;
}

export interface PropertyReview {
  userName: string;
  rating: number; // out of 5
  comment: string;
  date: string;
  source: 'Google' | 'Relai' | 'Other';
}

export interface PropertyRating {
  overall: number; // out of 10
  categories: {
    location: number; // out of 10
    construction: number; // out of 10
    amenities: number; // out of 10
    valueForMoney: number; // out of 10
    connectivity: number; // out of 10
    legalCompliance: number; // out of 10
    environment: number; // out of 10
  };
}

export interface FloorPlan {
  configuration: PropertyConfiguration;
  carpetArea: number;
  builtUpArea: number;
  superBuiltUpArea: number;
  price: number;
  pricePerSqFt: number;
  image: string;
}

export interface PropertyGallery {
  mainImage: string;
  images: string[];
  floorPlans?: string[];
  videos?: string[];
  threeSixtyViews?: string[];
}

export interface PropertyDetails {
  id: string;
  name: string;
  description: string;
  type: 'Apartment' | 'Villa' | 'Plot' | 'Independent House' | 'Commercial';
  status: 'Under Construction' | 'Ready to Move' | 'Resale';
  possession: PossessionStatus;
  configurations: PropertyConfiguration[];
  priceRange: {
    min: number;
    max: number;
  };
  gallery: PropertyGallery;
  location: PropertyLocation;
  nearbyPlaces: NearbyPlace[];
  builder: BuilderInfo;
  amenities: PropertyAmenity[];
  specifications: {
    structure: string;
    walls: string;
    flooring: string;
    kitchen: string;
    bathroom: string;
    doors: string;
    windows: string;
    electrical: string;
  };
  floorPlans: FloorPlan[];
  legalInfo: {
    reraId: string;
    approvals: string[];
    legalDocuments: string[];
  };
  projectDetails: {
    totalArea: number; // in acres
    totalUnits: number;
    density: number; // units per acre
    launchDate: string;
    completionDate: string;
    groundVehicleMovement: boolean;
  };
  environmentFactors: {
    greenSpace: string; // percentage
    waterConservation: string[];
    wasteManagement: string[];
    airQuality: string;
    noiseLevel: string;
  };
  constructionQuality: {
    materials: string[];
    earthquake: string;
    fireSafety: string;
    waterproofing: string;
  };
  investmentPotential: {
    resaleValue: string;
    appreciationTrend: string;
    rentalYield: string;
    upcomingDevelopments: string[];
  };
  ratings: PropertyRating;
  reviews: PropertyReview[];
  financingOptions: {
    banks: string[];
    interestRates: {
      min: number;
      max: number;
    };
    processingFee: string;
    specialOffers: string[];
  };
}