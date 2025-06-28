// import React, { useState, useEffect, useRef } from 'react';
// import { useParams, useLocation } from 'wouter';
// import { useQuery } from '@tanstack/react-query';
// import { apiRequest } from '@/lib/queryClient';
// import { motion, AnimatePresence } from 'framer-motion';
// import { 
//   MapPinIcon, 
//   Share2, 
//   Download, 
//   BedDouble as BedDoubleIcon, 
//   Home as HomeIcon, 
//   Heart, 
//   Star,
//   Calendar,
//   MapPin,
//   Navigation2,
//   Info,
//   RefreshCw,
//   CheckCircle2,
//   IndianRupee,
//   Phone,
//   MessageSquare,
//   ChevronDown,
//   ChevronUp,
//   Maximize2,
//   Banknote,
//   TrendingUp,
//   HelpCircle,
//   AlertTriangle,
//   Building,
//   Award,
//   BarChart4,
//   Clock
// } from 'lucide-react';

// // UI components
// import Container from '@/components/ui/container';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import { Separator } from '@/components/ui/separator';
// import { Progress } from '@/components/ui/progress';

// // Property detail components
// import PropertyMap from '@/components/property-detail/PropertyMap';
// import PropertyExpertContact from '@/components/property-detail/PropertyExpertContact';
// import PropertyAmenities from '@/components/property-detail/PropertyAmenities';
// import PropertyNearbyPlaces from '@/components/property-detail/PropertyNearbyPlaces';
// import EnhancedPropertyGallery from '@/components/property-detail/EnhancedPropertyGallery';
// import PropertyDetails from '@/components/property-detail/PropertyDetails';

// // Define the configuration type
// type Configuration = {
//   type?: string;
//   sizeRange?: number;
//   sizeUnit?: string;
//   facing?: string;
//   BaseProjectPrice?: number;
// };

// // Define the property type matching our Supabase data
// type Property = {
//   // Basic identifiers
//   id: string | number;
//   propertyId?: string;  // From database
//   property_id?: string;  // For compatibility
//   developerName: string;
//   reraNumber: string;
  
//   // Project identity & status
//   projectName: string;
//   constructionStatus: string;
//   propertyType: string;
//   location: string;
//   possessionDate: string;
  
//   // API response format fields (capitalized)
//   ProjectName?: string;
//   BuilderName?: string;
//   Area?: string;
//   Possession_date?: string;
//   Price_per_sft?: number;
//   RERA_Number?: string;
  
//   // Community and scale
//   isGatedCommunity: boolean;
//   totalUnits: number;
//   areaSizeAcres: number;
  
//   // Configuration & dimensions
//   configurations: Configuration[];
//   minSizeSqft: number;
//   maxSizeSqft: number;
//   pricePerSqft: number;
//   price_per_sqft?: number;  // From database
//   pricePerSqftOTP: number;
//   price: number;
  
//   // Geo & source info
//   longitude: number;
//   latitude: number;
//   projectDocumentsLink: string;
//   source: string;
  
//   // Contact & sales info
//   builderContactInfo: string;
//   listingType: string;
//   loanApprovedBanks: string[];
  
//   // Contextual & supporting info
//   nearbyLocations: string[];
//   remarksComments: string;
//   amenities: string[];
//   faq: string[];
  
//   // Legacy fields to maintain compatibility
//   name: string;
//   bedrooms: number;
//   bathrooms: number;
//   area: number;
//   description: string;
//   features: string[];
//   images: string[];
//   builder: string;
//   possession: string;
//   rating: number;
  
//   // Additional detailed property information from Supabase
//   createdAt?: Date;
//   legalClearance?: string;
//   constructionQuality?: string;
//   waterSupply?: string;
//   powerBackup?: string;
//   parkingFacilities?: string;
//   communityType?: string;
//   buildQuality?: string;
//   investmentPotential?: string;
//   propertyAge?: string;
//   environmentalFeatures?: string;
//   views?: string;
//   noiseLevel?: string;
//   connectivityAndTransit?: string;
//   medicalFacilities?: string;
//   educationalInstitutions?: string;
//   shoppingAndEntertainment?: string;
//   specialFeatures?: string[];
//   videoTour?: string;
//   virtualTour?: string;
//   siteVisitSchedule?: string;
//   homeLoans?: string;
//   maintenanceCharges?: string;
//   taxAndCharges?: string;
//   legalDocuments?: string[];
//   floorPlans?: string[];
//   masterPlan?: string;
//   relaiRating?: number;
//   relaiReview?: string;
//   discounts?: string;
//   bookingAmount?: string;
//   paymentSchedule?: string;
//   _id?: string | { $oid: string };
// };

// // Animation variants
// const fadeIn = {
//   hidden: { opacity: 0 },
//   visible: { opacity: 1, transition: { duration: 0.5 } }
// };

// const slideUp = {
//   hidden: { y: 30, opacity: 0 },
//   visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
// };

// const staggerContainer = {
//   hidden: { opacity: 0 },
//   visible: {
//     opacity: 1,
//     transition: {
//       staggerChildren: 0.1
//     }
//   }
// };

// const staggerItem = {
//   hidden: { y: 20, opacity: 0 },
//   visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } }
// };

// const pulse = {
//   scale: [1, 1.05, 1],
//   transition: { duration: 1, repeat: Infinity, repeatType: "reverse" }
// };

// export default function PropertyDetailPage() {
//   const { id } = useParams<{ id: string }>();
//   const [_, navigate] = useLocation();
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);
//   const [isRefreshing, setIsRefreshing] = useState(false);
//   const [showFullDescription, setShowFullDescription] = useState(false);
//   const [isImpactScoreExpanded, setIsImpactScoreExpanded] = useState(false);
//   const [galleryMode, setGalleryMode] = useState<'grid' | 'slider'>('slider');
//   const [galleryFullscreen, setGalleryFullscreen] = useState<boolean>(false);
//   const [isHovered, setIsHovered] = useState(false);
  
//   // Animated elements visibility states
//   const [visibleSections, setVisibleSections] = useState({
//     header: false,
//     gallery: false,
//     quickInfo: false,
//     pricing: false,
//     features: false,
//     specifications: false
//   });

//   // References for intersection observer
//   const headerRef = useRef<HTMLDivElement>(null);
//   const galleryRef = useRef<HTMLDivElement>(null);
//   const quickInfoRef = useRef<HTMLDivElement>(null);
//   const pricingRef = useRef<HTMLDivElement>(null);
//   const featuresRef = useRef<HTMLDivElement>(null);
//   const specificationsRef = useRef<HTMLDivElement>(null);
  
//   // Fetch property data from API
//   const { data, isLoading, error, refetch } = useQuery({
//     queryKey: ['/api/property-by-id', id],
//     queryFn: async () => {
//       console.log(`Fetching property with ID: ${id}`);
      
//       // Make the API request
//       const response = await apiRequest<Property>(`/api/property-by-id/${encodeURIComponent(id)}`);
      
//       // Log what we got back to help with debugging
//       console.log(`Got property data from API:`, response?.ProjectName || response?.projectName || 'No property found');
      
//       return response;
//     },
//     enabled: !!id,
//     retry: 2, // Retry failed requests up to 2 times
//     refetchOnWindowFocus: false // Don't refetch when window regains focus
//   });
  
//   // Set up intersection observer to trigger animations when scrolling
//   useEffect(() => {
//     const observerOptions = {
//       root: null,
//       rootMargin: '0px',
//       threshold: 0.2,
//     };

//     const handleIntersection = (entries: IntersectionObserverEntry[]) => {
//       entries.forEach(entry => {
//         if (entry.isIntersecting) {
//           if (entry.target === headerRef.current) {
//             setVisibleSections(prev => ({ ...prev, header: true }));
//           } else if (entry.target === galleryRef.current) {
//             setVisibleSections(prev => ({ ...prev, gallery: true }));
//           } else if (entry.target === quickInfoRef.current) {
//             setVisibleSections(prev => ({ ...prev, quickInfo: true }));
//           } else if (entry.target === pricingRef.current) {
//             setVisibleSections(prev => ({ ...prev, pricing: true }));
//           } else if (entry.target === featuresRef.current) {
//             setVisibleSections(prev => ({ ...prev, features: true }));
//           } else if (entry.target === specificationsRef.current) {
//             setVisibleSections(prev => ({ ...prev, specifications: true }));
//           }
//         }
//       });
//     };

//     const observer = new IntersectionObserver(handleIntersection, observerOptions);
    
//     // Observe all section refs
//     [headerRef, galleryRef, quickInfoRef, pricingRef, featuresRef, specificationsRef].forEach(ref => {
//       if (ref.current) {
//         observer.observe(ref.current);
//       }
//     });

//     return () => {
//       observer.disconnect();
//     };
//   }, []);

//   // Function to refresh property images
//   const refreshImages = async () => {
//     if (!id) return;
    
//     setIsRefreshing(true);
//     try {
//       // Make a request with refresh=true parameter to force new image fetching
//       await apiRequest<Property>(`/api/property-by-id/${encodeURIComponent(id)}?refresh=true`);
//       await refetch();
//       setCurrentImageIndex(0); // Reset to first image
//     } catch (error) {
//       console.error('Error refreshing images:', error);
//     } finally {
//       setIsRefreshing(false);
//     }
//   };

//   const property = data;
//   // Touch references for swipe functionality
//   const touchStartXRef = useRef<number | null>(null);

//   // Format price display
//   const formatPrice = (price: number) => {
//     if (price >= 10000000) {
//       return `₹${(price / 10000000).toFixed(2)} Cr`;
//     } else if (price >= 100000) {
//       return `₹${(price / 100000).toFixed(2)} Lac`;
//     } else {
//       return `₹${price.toLocaleString()}`;
//     }
//   };
  
//   // Navigation functions for the image gallery
//   const nextImage = () => {
//     if (!property?.images?.length) return;
//     setCurrentImageIndex((prevIndex) => 
//       prevIndex === property.images.length - 1 ? 0 : prevIndex + 1
//     );
//   };
  
//   const prevImage = () => {
//     if (!property?.images?.length) return;
//     setCurrentImageIndex((prevIndex) => 
//       prevIndex === 0 ? property.images.length - 1 : prevIndex - 1
//     );
//   };
  
//   // Touch handlers for swipe functionality
//   const handleTouchStart = (e: React.TouchEvent) => {
//     touchStartXRef.current = e.touches[0].clientX;
//   };
  
//   const handleTouchEnd = (e: React.TouchEvent) => {
//     if (!touchStartXRef.current || !property?.images?.length) return;
    
//     const touchEndX = e.changedTouches[0].clientX;
//     const diffX = touchEndX - touchStartXRef.current;
    
//     // If swipe distance is significant (more than 50px)
//     if (Math.abs(diffX) > 50) {
//       if (diffX > 0) {
//         // Swiped right, show previous image
//         prevImage();
//       } else {
//         // Swiped left, show next image
//         nextImage();
//       }
//     }
    
//     // Reset touch position
//     touchStartXRef.current = null;
//   };

//   // Generate random impact score between 70-95 for demonstration
//   const relaiImpactScore = Math.floor(Math.random() * 26) + 70;
  
//   // Calculate investment potential (random for demo)
//   const investmentPotential = {
//     growth: Math.floor(Math.random() * 16) + 10,
//     rentalYield: (Math.random() * 3 + 2).toFixed(1),
//     demandScore: Math.floor(Math.random() * 31) + 70
//   };

//   // Generate EMI estimate based on property price
//   const calculateEmi = (price: number) => {
//     const loanAmount = price * 0.8; // Assuming 80% loan
//     const rateOfInterest = 8.5; // 8.5% interest rate
//     const loanTenureMonths = 20 * 12; // 20 years

//     const monthlyInterestRate = rateOfInterest / 12 / 100;
//     const emi = loanAmount * monthlyInterestRate * 
//                 Math.pow(1 + monthlyInterestRate, loanTenureMonths) / 
//                 (Math.pow(1 + monthlyInterestRate, loanTenureMonths) - 1);
    
//     return Math.round(emi);
//   };

//   // Map backend fields to frontend fields if missing
//   const normalizedProperty = property ? {
//     ...property,
//     id: property.id || (property._id && (typeof property._id === 'object' ? property._id.$oid : property._id)) || '',
//     projectName: property.projectName || property.ProjectName || '',
//     developerName: property.developerName || property.BuilderName || '',
//     reraNumber: property.reraNumber || property.RERA_Number || '',
//     location: property.location || property.Area || '',
//     possessionDate: property.possessionDate || property.Possession_date || '',
//     pricePerSqft: property.pricePerSqft || property.Price_per_sft || '',
//     configurations: Array.isArray(property.configurations) ? property.configurations : [],
//     price: (Array.isArray(property.configurations) && property.configurations[0] && property.configurations[0].BaseProjectPrice) || property.price || 0,
//     // Add more mappings as needed for your UI
//   } : null;

//   if (isLoading) {
//     return (
//       <Container className="py-20">
//         <div className="flex flex-col items-center justify-center min-h-[60vh]">
//           <div className="h-16 w-16 border-4 border-t-[#1752FF] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
//           <p className="mt-4 text-lg text-gray-600">Loading property details...</p>
//         </div>
//       </Container>
//     );
//   }

//   if (error) {
//     return (
//       <Container className="py-20">
//         <div className="flex flex-col items-center justify-center min-h-[60vh]">
//           <h2 className="text-2xl font-bold text-gray-800">Property Not Found</h2>
//           <p className="mt-2 text-gray-600">The property you're looking for doesn't exist or has been removed.</p>
//           <Button className="mt-4 bg-[#1752FF]" onClick={() => navigate("/properties")}>Browse All Properties</Button>
//         </div>
//       </Container>
//     );
//   }
  
//   if (!normalizedProperty) {
//     return (
//       <Container className="py-20">
//         <div className="flex flex-col items-center justify-center min-h-[60vh]">
//           <div className="animate-spin w-12 h-12 mb-4 border-4 border-blue-600 border-t-transparent rounded-full"></div>
//           <h2 className="text-2xl font-bold text-gray-800">Loading Property Details</h2>
//           <p className="mt-2 text-gray-600">Please wait while we fetch the complete property information...</p>
//         </div>
//       </Container>
//     );
//   }

//   const emiEstimate = calculateEmi(normalizedProperty.price);

//   return (
//     <div className="bg-[#FFFFFF]">
//       {/* Property Header */}
//       <div className="bg-blue-600 text-white mb-6">
//         <Container className="py-6">
//           <h1 className="text-2xl md:text-3xl font-bold">{normalizedProperty.projectName || normalizedProperty.name}</h1>
//           <div className="flex items-center mt-2">
//             <MapPinIcon className="w-4 h-4 mr-1 flex-shrink-0" />
//             <p className="text-sm">{normalizedProperty.location}</p>
//           </div>
//         </Container>
//       </div>
      
//       <Container className="pb-8">
//         {/* Breadcrumbs */}
//         <div className="text-sm text-gray-500 mb-4">
//           <span onClick={() => navigate("/")} className="hover:text-[#1752FF] cursor-pointer">Home</span> &gt;{' '}
//           <span onClick={() => navigate("/properties")} className="hover:text-[#1752FF] cursor-pointer">Properties</span> &gt;{' '}
//           <span className="text-[#1752FF]">{normalizedProperty.projectName || normalizedProperty.name}</span>
//         </div>
        
//         {/* Property Gallery */}
//         <div className="mb-6">
//           <h2 className="text-xl font-semibold mb-4">Property Gallery</h2>
//           <EnhancedPropertyGallery 
//             images={normalizedProperty.images || []} 
//             propertyName={normalizedProperty.projectName || normalizedProperty.name || 'Property'}
//           />
//         </div>
        
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Left content - Main property details */}
//           <div className="lg:col-span-2">
//             {/* Key details, Property specs, and Status cards in a row */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//               {/* Key Details Card */}
//               <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
//                 <h3 className="text-md font-semibold mb-4 flex items-center">
//                   <Info className="w-5 h-5 text-blue-500 mr-2" />
//                   Key Details
//                 </h3>
                
//                 {normalizedProperty.projectName && (
//                   <div className="mb-3">
//                     <p className="text-sm text-gray-500">Project Name</p>
//                     <p className="font-medium">{normalizedProperty.projectName}</p>
//                   </div>
//                 )}
                
//                 {normalizedProperty.developerName && (
//                   <div className="mb-3">
//                     <p className="text-sm text-gray-500">Developer</p>
//                     <p className="font-medium">{normalizedProperty.developerName}</p>
//                   </div>
//                 )}
                
//                 {normalizedProperty.reraNumber && (
//                   <div>
//                     <p className="text-sm text-gray-500">RERA Number</p>
//                     <p className="font-medium">{normalizedProperty.reraNumber}</p>
//                   </div>
//                 )}
//               </div>
              
//               {/* Property Specs Card */}
//               <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
//                 <h3 className="text-md font-semibold mb-4 flex items-center">
//                   <HomeIcon className="w-5 h-5 text-blue-500 mr-2" />
//                   Property Specs
//                 </h3>
                
//                 {normalizedProperty.propertyType && (
//                   <div className="mb-3">
//                     <p className="text-sm text-gray-500">Property Type</p>
//                     <p className="font-medium">{normalizedProperty.propertyType}</p>
//                   </div>
//                 )}
                
//                 {normalizedProperty.configurations && (
//                   <div className="mb-3">
//                     <p className="text-sm text-gray-500">Configuration</p>
//                     <p className="font-medium">
//                       {Array.isArray(normalizedProperty.configurations) && normalizedProperty.configurations.length > 0
//                         ? normalizedProperty.configurations.map(cfg => cfg.type).filter(Boolean).join(', ')
//                         : 'N/A'}
//                     </p>
//                   </div>
//                 )}
                
//                 {(normalizedProperty.minSizeSqft || normalizedProperty.maxSizeSqft) && (
//                   <div>
//                     <p className="text-sm text-gray-500">Size</p>
//                     <p className="font-medium">
//                       {normalizedProperty.minSizeSqft} 
//                       {normalizedProperty.maxSizeSqft && normalizedProperty.minSizeSqft && normalizedProperty.maxSizeSqft > normalizedProperty.minSizeSqft ? ` - ${normalizedProperty.maxSizeSqft}` : ''} sq.ft.
//                     </p>
//                   </div>
//                 )}
//               </div>
              
//               {/* Status & Timeline Card */}
//               <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
//                 <h3 className="text-md font-semibold mb-4 flex items-center">
//                   <Clock className="w-5 h-5 text-blue-500 mr-2" />
//                   Status & Timeline
//                 </h3>
                
//                 {normalizedProperty.constructionStatus && (
//                   <div className="mb-3">
//                     <p className="text-sm text-gray-500">Construction Status</p>
//                     <Badge className={
//                       normalizedProperty.constructionStatus.toLowerCase().includes('ready') 
//                         ? "bg-green-100 text-green-800 hover:bg-green-100" 
//                         : "bg-blue-100 text-blue-800 hover:bg-blue-100"
//                     }>
//                       {normalizedProperty.constructionStatus}
//                     </Badge>
//                   </div>
//                 )}
                
//                 {normalizedProperty.possessionDate && (
//                   <div className="mb-3">
//                     <p className="text-sm text-gray-500">Possession Date</p>
//                     <p className="font-medium">{normalizedProperty.possessionDate}</p>
//                   </div>
//                 )}
                
//                 {normalizedProperty.areaSizeAcres && (
//                   <div>
//                     <p className="text-sm text-gray-500">Project Area</p>
//                     <p className="font-medium">{normalizedProperty.areaSizeAcres} acres</p>
//                   </div>
//                 )}
//               </div>
//             </div>
            
//             {/* Description */}
//             {normalizedProperty.description && (
//               <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
//                 <h3 className="text-lg font-semibold mb-3">Description</h3>
//                 <p className="text-gray-700 whitespace-pre-line">{normalizedProperty.description}</p>
//               </div>
//             )}
            
//             {/* Additional Information */}
//             {normalizedProperty.remarksComments && (
//               <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
//                 <h3 className="text-lg font-semibold mb-3">Additional Information</h3>
//                 <p className="text-gray-700 whitespace-pre-line">{normalizedProperty.remarksComments}</p>
//               </div>
//             )}
            
//             {/* Amenities, Location, Nearby Places tabs */}
//             <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
//               <Tabs defaultValue="amenities">
//                 <TabsList className="mb-4">
//                   <TabsTrigger value="amenities">Amenities</TabsTrigger>
//                   <TabsTrigger value="location">Location</TabsTrigger>
//                   <TabsTrigger value="nearby">Nearby Places</TabsTrigger>
//                   <TabsTrigger value="legal">Legal Info</TabsTrigger>
//                   <TabsTrigger value="faqs">FAQs</TabsTrigger>
//                 </TabsList>
                
//                 <TabsContent value="amenities">
//                   <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//                     {(normalizedProperty.amenities || []).concat(
//                       ["Round-the-clock security", "CCTV surveillance"]
//                     ).map((amenity, index) => (
//                       <div key={index} className="flex items-start gap-3">
//                         <CheckCircle2 className="text-blue-500 h-5 w-5 mt-0.5 flex-shrink-0" />
//                         <span>{amenity}</span>
//                       </div>
//                     ))}
//                   </div>
//                 </TabsContent>
                
//                 <TabsContent value="location">
//                   <PropertyMap 
//                     latitude={normalizedProperty.latitude} 
//                     longitude={normalizedProperty.longitude}
//                     propertyName={normalizedProperty.projectName || normalizedProperty.name || 'Property'}
//                     location={normalizedProperty.location || 'Hyderabad'}
//                   />
//                 </TabsContent>
                
//                 <TabsContent value="nearby">
//                   <PropertyNearbyPlaces 
//                     property_id={normalizedProperty.property_id ? String(normalizedProperty.property_id) : normalizedProperty.id ? String(normalizedProperty.id) : undefined} 
//                     latitude={normalizedProperty.latitude} 
//                     longitude={normalizedProperty.longitude}
//                     propertyName={normalizedProperty.projectName || normalizedProperty.name || 'Property'}
//                   />
//                 </TabsContent>
                
//                 <TabsContent value="legal">
//                   <div className="p-4 bg-gray-50 rounded-lg">
//                     <p className="text-gray-600">Legal information about this property will be displayed here.</p>
//                   </div>
//                 </TabsContent>
                
//                 <TabsContent value="faqs">
//                   <div className="p-4 bg-gray-50 rounded-lg">
//                     <p className="text-gray-600">Frequently asked questions about this property will be displayed here.</p>
//                   </div>
//                 </TabsContent>
//               </Tabs>
//             </div>
//           </div>
          
//           {/* Right sidebar - Contact and benefits */}
//           <div className="lg:col-span-1">
//             <div className="sticky top-24 space-y-4">
//               {/* Interested in this property card */}
//               <div className="bg-blue-600 text-white p-6 rounded-lg shadow-md">
//                 <h3 className="text-xl font-bold mb-2">Interested in this property?</h3>
//                 <div className="mb-4">
//                   <p className="text-2xl font-bold">₹{normalizedProperty.price.toLocaleString()}</p>
//                 </div>
//                 <Button className="w-full bg-white text-blue-600 hover:bg-gray-100 mb-2 flex items-center justify-center gap-2">
//                   <MessageSquare className="h-4 w-4" /> Contact Property Expert
//                 </Button>
//               </div>
              
//               {/* Relai Buyer Benefits */}
//               <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
//                 <h3 className="text-lg font-bold mb-4">Relai Buyer Benefits</h3>
//                 <ul className="space-y-3">
//                   <li className="flex gap-2">
//                     <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
//                     <span>Legal fees waiver up to ₹10,000</span>
//                   </li>
//                   <li className="flex gap-2">
//                     <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
//                     <span>First EMI covered up to ₹1 Lakh</span>
//                   </li>
//                   <li className="flex gap-2">
//                     <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
//                     <span>Loyalty discount of ₹1 Lakh</span>
//                   </li>
//                   <li className="flex gap-2">
//                     <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
//                     <span>30% discount on interior design</span>
//                   </li>
//                 </ul>
//                 <div className="mt-4 text-center">
//                   <Button variant="link" className="text-blue-600">View All Benefits</Button>
//                 </div>
//               </div>
              
//               {/* Share and Save */}
//               <div className="flex gap-2">
//                 <Button variant="outline" className="flex-1 flex items-center justify-center gap-2">
//                   <Share2 className="h-4 w-4" /> Share
//                 </Button>
//                 <Button variant="outline" className="flex-1 flex items-center justify-center gap-2">
//                   <Heart className="h-4 w-4" /> Save
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </Container>
//     </div>

//     {/* Property Header */}
//     <Container className="pt-6">
//       <motion.div 
//         initial="hidden"
//         animate="visible"
//         variants={staggerContainer}
//         className="space-y-6"
//       >
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
//             <div>
//               <div className="flex flex-wrap items-center gap-2">
//                 <motion.h1 
//                   className="text-2xl md:text-3xl font-bold text-gray-900"
//                   variants={slideUp}
//                 >
//                   {normalizedProperty?.ProjectName || normalizedProperty?.projectName || normalizedProperty?.name}
//                 </motion.h1>
//                 {normalizedProperty?.constructionStatus && (
//                   <motion.div variants={slideUp}>
//                     <Badge 
//                       className={
//                         normalizedProperty.constructionStatus.toLowerCase().includes('ready') 
//                           ? "bg-green-100 text-green-800" 
//                           : "bg-blue-100 text-blue-800"
//                       }
//                     >
//                       {normalizedProperty.constructionStatus}
//                     </Badge>
//                   </motion.div>
//                 )}
//               </div>
//               <motion.p 
//                 className="text-sm md:text-lg text-gray-600 mt-1 flex items-center gap-1 flex-wrap"
//                 variants={slideUp}
//               >
//                 <MapPinIcon size={16} className="text-gray-400 flex-shrink-0" />
//                 <span className="break-all">{normalizedProperty?.Area || normalizedProperty?.location}</span>
//               </motion.p>
//             </div>
//             <motion.div 
//               className="mt-4 md:mt-0 flex flex-wrap items-center gap-2"
//               variants={staggerContainer}
//             >
//               <motion.div variants={staggerItem}>
//                 <Button 
//                   variant="outline" 
//                   size="sm" 
//                   className="text-sm h-9"
//                   onClick={() => {
//                     if (navigator.share) {
//                       navigator.share({
//                         title: normalizedProperty?.ProjectName || normalizedProperty?.projectName || normalizedProperty?.name,
//                         text: `Check out this property: ${normalizedProperty?.ProjectName || normalizedProperty?.projectName || normalizedProperty?.name} in ${normalizedProperty?.Area || normalizedProperty?.location}`,
//                         url: window.location.href
//                       })
//                       .catch(err => {
//                         alert('Sharing failed. Please copy the URL manually.');
//                         console.error('Error sharing:', err);
//                       });
//                     } else {
//                       // Fallback for browsers that don't support navigator.share
//                       const el = document.createElement('textarea');
//                       el.value = window.location.href;
//                       document.body.appendChild(el);
//                       el.select();
//                       document.execCommand('copy');
//                       document.body.removeChild(el);
//                       alert('Link copied to clipboard!');
//                     }
//                   }}
//                 >
//                   <Share2 className="mr-1 h-4 w-4" /> Share
//                 </Button>
//               </motion.div>
//               <motion.div variants={staggerItem}>
//                 <Button 
//                   variant="outline" 
//                   size="sm" 
//                   className="text-sm h-9"
//                   onClick={() => {
//                     // Save to local storage
//                     const savedProperties = JSON.parse(localStorage.getItem('savedProperties') || '[]');
//                     const isAlreadySaved = savedProperties.some((p: any) => p.id === normalizedProperty.id);
                    
//                     if (isAlreadySaved) {
//                       // Remove from saved
//                       const updatedSaved = savedProperties.filter((p: any) => p.id !== normalizedProperty.id);
//                       localStorage.setItem('savedProperties', JSON.stringify(updatedSaved));
//                       alert('Property removed from saved properties');
//                     } else {
//                       // Add to saved
//                       savedProperties.push({
//                         id: normalizedProperty.id,
//                         name: normalizedProperty.projectName || normalizedProperty.name,
//                         location: normalizedProperty.location,
//                         image: normalizedProperty.images?.[0] || '',
//                         savedAt: new Date().toISOString()
//                       });
//                       localStorage.setItem('savedProperties', JSON.stringify(savedProperties));
//                       alert('Property saved to your favorites');
//                     }
//                   }}
//                 >
//                   <Heart className="mr-1 h-4 w-4" /> Save
//                 </Button>
//               </motion.div>
//               <motion.div variants={staggerItem}>
//                 <Button 
//                   variant="outline" 
//                   size="sm" 
//                   className="text-sm h-9"
//                   onClick={() => {
//                     // Open Google Maps directions to this location
//                     const destinationQuery = encodeURIComponent(`${normalizedProperty.projectName || normalizedProperty.name}, ${normalizedProperty.location}`);
//                     const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destinationQuery}`;
//                     window.open(mapsUrl, '_blank');
//                   }}
//                 >
//                   <Navigation2 className="mr-1 h-4 w-4" /> Directions
//                 </Button>
//               </motion.div>
//               {normalizedProperty.projectDocumentsLink && (
//                 <motion.div variants={staggerItem}>
//                   <Button 
//                     variant="outline" 
//                     size="sm" 
//                     className="text-sm h-9"
//                     onClick={() => window.open(normalizedProperty.projectDocumentsLink, '_blank')}
//                   >
//                     <Download className="mr-1 h-4 w-4" /> Brochure
//                   </Button>
//                 </motion.div>
//               )}
//             </motion.div>
//           </div>

//           {/* New Header Highlight Stats */}
//           <motion.div 
//             className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 bg-white p-3 rounded-lg shadow-sm"
//             variants={staggerContainer}
//             initial="hidden"
//             animate={visibleSections.header ? "visible" : "hidden"}
//           >
//             <motion.div 
//               className="flex flex-col items-center justify-center p-3 border-r border-gray-100"
//               variants={staggerItem}
//             >
//               <div className="text-[#1752FF] mb-1">
//                 <IndianRupee size={20} />
//               </div>
//               <p className="text-lg font-bold">
//                 {normalizedProperty.price ? formatPrice(normalizedProperty.price) : 'Contact for details'}
//               </p>
//               <p className="text-xs text-gray-500">Price</p>
//             </motion.div>
//             <motion.div 
//               className="flex flex-col items-center justify-center p-3 border-r border-gray-100"
//               variants={staggerItem}
//             >
//               <div className="text-[#1752FF] mb-1">
//                 <HomeIcon size={20} />
//               </div>
//               <p className="text-lg font-bold">
//                 {normalizedProperty.minSizeSqft || normalizedProperty.maxSizeSqft || normalizedProperty.area ? 
//                   (normalizedProperty.minSizeSqft === normalizedProperty.maxSizeSqft || !normalizedProperty.maxSizeSqft
//                     ? `${normalizedProperty.minSizeSqft || normalizedProperty.area || 0} sq.ft` 
//                     : `${normalizedProperty.minSizeSqft || 0}-${normalizedProperty.maxSizeSqft} sq.ft`)
//                   : 'Contact for details'}
//               </p>
//               <p className="text-xs text-gray-500">Size</p>
//             </motion.div>
//             <motion.div 
//               className="flex flex-col items-center justify-center p-3 border-r border-gray-100"
//               variants={staggerItem}
//             >
//               <div className="text-[#1752FF] mb-1">
//                 <BedDoubleIcon size={20} />
//               </div>
//               <p className="text-lg font-bold">
//                 {normalizedProperty.configurations || (normalizedProperty.bedrooms ? `${normalizedProperty.bedrooms}BHK` : 'Contact for details')}
//               </p>
//               <p className="text-xs text-gray-500">Configuration</p>
//             </motion.div>
//             <motion.div 
//               className="flex flex-col items-center justify-center p-3"
//               variants={staggerItem}
//             >
//               <div className="text-[#1752FF] mb-1">
//                 <Calendar size={20} />
//               </div>
//               <p className="text-lg font-bold">{normalizedProperty.possessionDate || normalizedProperty.possession || 'Contact for details'}</p>
//               <p className="text-xs text-gray-500">Possession</p>
//             </motion.div>
//           </motion.div>
//         </motion.div>

//         {/* Property Gallery - Enhanced and Animated */}
//         <motion.div 
//           ref={galleryRef}
//           initial="hidden"
//           animate={visibleSections.gallery ? "visible" : "hidden"}
//           variants={fadeIn}
//           className="mb-8"
//         >
//           <div className="flex justify-between items-center mb-3">
//             <h3 className="text-lg font-semibold">Property Gallery</h3>
//             <div className="flex gap-2">
//               <Button 
//                 variant={galleryMode === 'slider' ? "default" : "outline"} 
//                 size="sm"
//                 onClick={() => setGalleryMode('slider')}
//                 className={galleryMode === 'slider' ? "bg-[#1752FF]" : ""}
//               >
//                 Slider
//               </Button>
//               <Button 
//                 variant={galleryMode === 'grid' ? "default" : "outline"} 
//                 size="sm"
//                 onClick={() => setGalleryMode('grid')}
//                 className={galleryMode === 'grid' ? "bg-[#1752FF]" : ""}
//               >
//                 Grid
//               </Button>
//             </div>
//           </div>

//           {galleryMode === 'slider' ? (
//             // Slider Gallery View
//             <div 
//               className="overflow-hidden rounded-lg h-96 bg-gray-100 relative group"
//               onTouchStart={handleTouchStart}
//               onTouchEnd={handleTouchEnd}
//             >
//               {normalizedProperty.images && Array.isArray(normalizedProperty.images) && normalizedProperty.images.length > 0 ? (
//                 <>
//                   {/* Main Image */}
//                   <AnimatePresence initial={false} mode="wait">
//                     <motion.img 
//                       key={currentImageIndex}
//                       initial={{ opacity: 0 }}
//                       animate={{ opacity: 1 }}
//                       exit={{ opacity: 0 }}
//                       transition={{ duration: 0.3 }}
//                       src={normalizedProperty.images[currentImageIndex]} 
//                       alt={normalizedProperty.projectName || normalizedProperty.name || 'Property Image'}
//                       className="w-full h-full object-cover"
//                       onError={(e) => {
//                         // On error, replace with a placeholder
//                         (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x600?text=Image+Unavailable';
//                       }}
//                     />
//                   </AnimatePresence>
                  
//                   {/* Navigation arrows */}
//                   {normalizedProperty.images.length > 1 && (
//                     <>
//                       {/* Left Arrow */}
//                       <motion.button 
//                         onClick={prevImage}
//                         className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-opacity opacity-0 group-hover:opacity-100"
//                         whileHover={{ scale: 1.1 }}
//                         whileTap={{ scale: 0.9 }}
//                         aria-label="Previous image"
//                       >
//                         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                           <path d="M15 18l-6-6 6-6" />
//                         </svg>
//                       </motion.button>
                      
//                       {/* Right Arrow */}
//                       <motion.button 
//                         onClick={nextImage}
//                         className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-opacity opacity-0 group-hover:opacity-100"
//                         whileHover={{ scale: 1.1 }}
//                         whileTap={{ scale: 0.9 }}
//                         aria-label="Next image"
//                       >
//                         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                           <path d="M9 18l6-6-6-6" />
//                         </svg>
//                       </motion.button>
//                     </>
//                   )}
                  
//                   {/* Image counter */}
//                   <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
//                     {currentImageIndex + 1}/{normalizedProperty.images.length} Photos
//                   </div>
                  
//                   {/* Refresh Images Button */}
//                   <button
//                     onClick={refreshImages}
//                     disabled={isRefreshing}
//                     className="absolute top-4 left-4 bg-black/70 hover:bg-black/90 text-white rounded-full p-2 transition-all"
//                     aria-label="Refresh property images"
//                     title="Get fresh images for this property"
//                   >
//                     <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
//                   </button>
                  
//                   {/* Thumbnails gallery */}
//                   {normalizedProperty.images.length > 1 && (
//                     <div className="absolute bottom-4 left-0 right-0 mx-auto flex justify-center gap-1 md:gap-2 overflow-x-auto px-2 md:px-4 py-2 md:py-3 bg-gradient-to-t from-black/50 to-transparent">
//                       {normalizedProperty.images.map((img, index) => (
//                         <motion.div 
//                           key={index}
//                           className={`h-12 w-12 md:h-16 md:w-16 flex-shrink-0 rounded-md overflow-hidden border-2 ${
//                             index === currentImageIndex ? 'border-white' : 'border-transparent'
//                           } hover:border-white cursor-pointer`}
//                           onClick={() => setCurrentImageIndex(index)}
//                           whileHover={{ scale: 1.05 }}
//                           whileTap={{ scale: 0.95 }}
//                         >
//                           <img 
//                             src={img} 
//                             alt={`${normalizedProperty.projectName} - ${index + 1}`} 
//                             className="h-full w-full object-cover"
//                           />
//                         </motion.div>
//                       ))}
//                     </div>
//                   )}
//                 </>
//               ) : (
//                 <div className="w-full h-full flex items-center justify-center">
//                   <HomeIcon size={64} className="text-gray-300" />
//                 </div>
//               )}
//             </div>
//           ) : (
//             // Grid Gallery View
//             <motion.div 
//               className="grid grid-cols-2 md:grid-cols-3 gap-2 h-96 overflow-hidden rounded-lg"
//               variants={staggerContainer}
//             >
//               {normalizedProperty.images && Array.isArray(normalizedProperty.images) && normalizedProperty.images.length > 0 ? (
//                 normalizedProperty.images.slice(0, 6).map((img, index) => (
//                   <motion.div 
//                     key={index}
//                     className={`${
//                       index === 0 ? 'col-span-2 row-span-2 md:col-span-2 md:row-span-2' : ''
//                     } relative rounded-md overflow-hidden cursor-pointer`}
//                     variants={staggerItem}
//                     whileHover={{ scale: 1.02 }}
//                     whileTap={{ scale: 0.98 }}
//                     onClick={() => {
//                       setCurrentImageIndex(index);
//                       setGalleryMode('slider');
//                     }}
//                   >
//                     <img 
//                       src={img} 
//                       alt={`${normalizedProperty.projectName || normalizedProperty.name || 'Property'} - ${index + 1}`}
//                       className="w-full h-full object-cover"
//                       onError={(e) => {
//                         // On error, replace with a placeholder
//                         (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x600?text=Image+Unavailable';
//                       }}
//                     />
//                     {index === 5 && normalizedProperty.images.length > 6 && (
//                       <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white">
//                         <p className="font-semibold">+{normalizedProperty.images.length - 6} more</p>
//                       </div>
//                     )}
//                   </motion.div>
//                 ))
//               ) : (
//                 <div className="col-span-3 flex items-center justify-center bg-gray-100 rounded-lg">
//                   <HomeIcon size={64} className="text-gray-300" />
//                 </div>
//               )}
//             </motion.div>
//           )}
//         </motion.div>

//         {/* Main Content with 2-column layout */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Left Column - Property Details */}
//           <div className="lg:col-span-2 space-y-8">
//             {/* Quick Info & Description Card */}
//             <motion.div
//               ref={quickInfoRef}
//               initial="hidden"
//               animate={visibleSections.quickInfo ? "visible" : "hidden"}
//               variants={fadeIn}
//               className="bg-white rounded-lg shadow-sm overflow-hidden"
//             >
//               {/* Relai Impact Score - New Feature */}
//               <div 
//                 className="bg-gradient-to-r from-[#1752FF] to-[#0A348F] text-white p-4"
//                 onClick={() => setIsImpactScoreExpanded(!isImpactScoreExpanded)}
//               >
//                 <div className="flex justify-between items-center cursor-pointer">
//                   <div className="flex items-center gap-2">
//                     <Award className="h-6 w-6" />
//                     <h3 className="text-lg font-semibold">Relai Impact Score</h3>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <span className="text-2xl font-bold">{relaiImpactScore}</span>
//                     <span className="text-sm">/100</span>
//                     <ChevronDown 
//                       className={`h-5 w-5 transition-transform ${isImpactScoreExpanded ? 'rotate-180' : ''}`} 
//                     />
//                   </div>
//                 </div>
                
//                 {isImpactScoreExpanded && (
//                   <motion.div 
//                     initial={{ height: 0, opacity: 0 }}
//                     animate={{ height: 'auto', opacity: 1 }}
//                     exit={{ height: 0, opacity: 0 }}
//                     transition={{ duration: 0.3 }}
//                     className="mt-4 space-y-2"
//                   >
//                     <p className="text-sm">Our proprietary score based on location, amenities, builder reputation, and growth potential.</p>
                    
//                     <div className="space-y-3 mt-3">
//                       <div>
//                         <div className="flex justify-between text-xs mb-1">
//                           <span>Location Quality</span>
//                           <span>{Math.floor(Math.random() * 11) + 80}/100</span>
//                         </div>
//                         <Progress value={Math.floor(Math.random() * 11) + 80} className="h-1 bg-white/30" />
//                       </div>
                      
//                       <div>
//                         <div className="flex justify-between text-xs mb-1">
//                           <span>Builder Reputation</span>
//                           <span>{Math.floor(Math.random() * 11) + 80}/100</span>
//                         </div>
//                         <Progress value={Math.floor(Math.random() * 11) + 80} className="h-1 bg-white/30" />
//                       </div>
                      
//                       <div>
//                         <div className="flex justify-between text-xs mb-1">
//                           <span>Growth Potential</span>
//                           <span>{Math.floor(Math.random() * 11) + 70}/100</span>
//                         </div>
//                         <Progress value={Math.floor(Math.random() * 11) + 70} className="h-1 bg-white/30" />
//                       </div>
                      
//                       <div>
//                         <div className="flex justify-between text-xs mb-1">
//                           <span>Value For Money</span>
//                           <span>{Math.floor(Math.random() * 11) + 75}/100</span>
//                         </div>
//                         <Progress value={Math.floor(Math.random() * 11) + 75} className="h-1 bg-white/30" />
//                       </div>
//                     </div>
//                   </motion.div>
//                 )}
//               </div>
              
//               {/* Property Description */}
//               <div className="p-6">
//                 <h3 className="text-xl font-semibold mb-3">About this Property</h3>
//                 <div className="text-gray-700">
//                   {normalizedProperty.description ? (
//                     <>
//                       <p className="mb-3">
//                         {showFullDescription 
//                           ? normalizedProperty.description 
//                           : `${normalizedProperty.description.substring(0, 300)}${normalizedProperty.description.length > 300 ? '...' : ''}`
//                         }
//                       </p>
//                       {normalizedProperty.description.length > 300 && (
//                         <Button 
//                           variant="link" 
//                           onClick={() => setShowFullDescription(!showFullDescription)}
//                           className="p-0 h-auto text-[#1752FF]"
//                         >
//                           {showFullDescription ? 'Show Less' : 'Read More'}
//                         </Button>
//                       )}
//                     </>
//                   ) : (
//                     <p className="text-gray-500">Contact our property experts for detailed information about this development.</p>
//                   )}
//                 </div>
//               </div>
              
//               {/* Key Features Grid */}
//               <div className="px-6 pb-6">
//                 <h3 className="text-xl font-semibold mb-3">Key Features</h3>
//                 <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//                   <motion.div 
//                     className="flex items-start gap-2"
//                     whileHover={{ y: -3, transition: { duration: 0.2 } }}
//                   >
//                     <CheckCircle2 className="h-5 w-5 text-[#1752FF] flex-shrink-0 mt-0.5" />
//                     <div>
//                       <h4 className="font-medium">Property Type</h4>
//                       <p className="text-sm text-gray-600">{normalizedProperty.propertyType}</p>
//                     </div>
//                   </motion.div>
                  
//                   <motion.div 
//                     className="flex items-start gap-2"
//                     whileHover={{ y: -3, transition: { duration: 0.2 } }}
//                   >
//                     <CheckCircle2 className="h-5 w-5 text-[#1752FF] flex-shrink-0 mt-0.5" />
//                     <div>
//                       <h4 className="font-medium">RERA Number</h4>
//                       <p className="text-sm text-gray-600 break-all">{normalizedProperty.reraNumber || 'Contact for details'}</p>
//                     </div>
//                   </motion.div>
                  
//                   <motion.div 
//                     className="flex items-start gap-2"
//                     whileHover={{ y: -3, transition: { duration: 0.2 } }}
//                   >
//                     <CheckCircle2 className="h-5 w-5 text-[#1752FF] flex-shrink-0 mt-0.5" />
//                     <div>
//                       <h4 className="font-medium">Developer</h4>
//                       <p className="text-sm text-gray-600">{normalizedProperty.developerName || normalizedProperty.builder}</p>
//                     </div>
//                   </motion.div>
                  
//                   <motion.div 
//                     className="flex items-start gap-2"
//                     whileHover={{ y: -3, transition: { duration: 0.2 } }}
//                   >
//                     <CheckCircle2 className="h-5 w-5 text-[#1752FF] flex-shrink-0 mt-0.5" />
//                     <div>
//                       <h4 className="font-medium">Total Units</h4>
//                       <p className="text-sm text-gray-600">{normalizedProperty.totalUnits || 'Contact for details'}</p>
//                     </div>
//                   </motion.div>
                  
//                   <motion.div 
//                     className="flex items-start gap-2"
//                     whileHover={{ y: -3, transition: { duration: 0.2 } }}
//                   >
//                     <CheckCircle2 className="h-5 w-5 text-[#1752FF] flex-shrink-0 mt-0.5" />
//                     <div>
//                       <h4 className="font-medium">Project Area</h4>
//                       <p className="text-sm text-gray-600">{normalizedProperty.areaSizeAcres ? `${normalizedProperty.areaSizeAcres} acres` : 'Contact for details'}</p>
//                     </div>
//                   </motion.div>
                  
//                   <motion.div 
//                     className="flex items-start gap-2"
//                     whileHover={{ y: -3, transition: { duration: 0.2 } }}
//                   >
//                     <CheckCircle2 className="h-5 w-5 text-[#1752FF] flex-shrink-0 mt-0.5" />
//                     <div>
//                       <h4 className="font-medium">Gated Community</h4>
//                       <p className="text-sm text-gray-600">{normalizedProperty.isGatedCommunity ? 'Yes' : 'No'}</p>
//                     </div>
//                   </motion.div>
//                 </div>
//               </div>
//             </motion.div>

//             {/* Price Breakdown & Investment Section */}
//             <motion.div
//               ref={pricingRef}
//               initial="hidden"
//               animate={visibleSections.pricing ? "visible" : "hidden"}
//               variants={fadeIn}
//               className="bg-white rounded-lg shadow-sm overflow-hidden"
//             >
//               <div className="p-6">
//                 <h3 className="text-xl font-semibold mb-4">Price Breakdown</h3>
                
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   {/* Price Details */}
//                   <div className="space-y-4 md:border-r md:pr-6">
//                     <motion.div 
//                       className="flex justify-between items-center"
//                       whileHover={{ x: 3, transition: { duration: 0.2 } }}
//                     >
//                       <div className="flex items-center">
//                         <IndianRupee className="h-5 w-5 text-[#1752FF] mr-2" />
//                         <span className="text-gray-700">Base Price</span>
//                       </div>
//                       <span className="font-semibold">{formatPrice(normalizedProperty.price)}</span>
//                     </motion.div>
                    
//                     <motion.div 
//                       className="flex justify-between items-center"
//                       whileHover={{ x: 3, transition: { duration: 0.2 } }}
//                     >
//                       <div className="flex items-center">
//                         <HomeIcon className="h-5 w-5 text-[#1752FF] mr-2" />
//                         <span className="text-gray-700">Per sq.ft Rate</span>
//                       </div>
//                       <span className="font-semibold">₹{normalizedProperty.pricePerSqft || normalizedProperty.price_per_sqft || 'N/A'}</span>
//                     </motion.div>
                    
//                     <motion.div 
//                       className="flex justify-between items-center"
//                       whileHover={{ x: 3, transition: { duration: 0.2 } }}
//                     >
//                       <div className="flex items-center">
//                         <Building className="h-5 w-5 text-[#1752FF] mr-2" />
//                         <span className="text-gray-700">Construction Status</span>
//                       </div>
//                       <span className="font-semibold">{normalizedProperty.constructionStatus || 'Contact for details'}</span>
//                     </motion.div>
                    
//                     <motion.div 
//                       className="flex justify-between items-center"
//                       whileHover={{ x: 3, transition: { duration: 0.2 } }}
//                     >
//                       <div className="flex items-center">
//                         <Clock className="h-5 w-5 text-[#1752FF] mr-2" />
//                         <span className="text-gray-700">Possession Date</span>
//                       </div>
//                       <span className="font-semibold">{normalizedProperty.possessionDate || normalizedProperty.possession || 'Contact for details'}</span>
//                     </motion.div>
//                   </div>
                  
//                   {/* EMI & Investment */}
//                   <div className="space-y-4">
//                     <div className="mb-6">
//                       <h4 className="text-lg font-semibold mb-1">EMI Estimate</h4>
//                       <div className="flex items-baseline">
//                         <span className="text-2xl font-bold text-[#1752FF]">₹{emiEstimate.toLocaleString()}</span>
//                         <span className="text-gray-500 ml-1">/month</span>
//                       </div>
//                       <p className="text-xs text-gray-500 mt-1">Based on 80% loan, 8.5% interest, 20-year tenure</p>
//                     </div>
                    
//                     <div className="space-y-3">
//                       <h4 className="text-lg font-semibold">Investment Potential</h4>
                      
//                       <motion.div 
//                         className="flex justify-between items-center"
//                         whileHover={{ x: 3, transition: { duration: 0.2 } }}
//                       >
//                         <div className="flex items-center">
//                           <TrendingUp className="h-5 w-5 text-[#1752FF] mr-2" />
//                           <span className="text-gray-700">Expected Growth</span>
//                         </div>
//                         <span className="font-semibold text-green-600">+{investmentPotential.growth}% / year</span>
//                       </motion.div>
                      
//                       <motion.div 
//                         className="flex justify-between items-center"
//                         whileHover={{ x: 3, transition: { duration: 0.2 } }}
//                       >
//                         <div className="flex items-center">
//                           <Banknote className="h-5 w-5 text-[#1752FF] mr-2" />
//                           <span className="text-gray-700">Rental Yield</span>
//                         </div>
//                         <span className="font-semibold">{investmentPotential.rentalYield}%</span>
//                       </motion.div>
                      
//                       <motion.div 
//                         className="flex justify-between items-center"
//                         whileHover={{ x: 3, transition: { duration: 0.2 } }}
//                       >
//                         <div className="flex items-center">
//                           <BarChart4 className="h-5 w-5 text-[#1752FF] mr-2" />
//                           <span className="text-gray-700">Demand Score</span>
//                         </div>
//                         <span className="font-semibold">{investmentPotential.demandScore}/100</span>
//                       </motion.div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </motion.div>

//             {/* Tabbed Content (amenities, location, nearby places) */}
//             <Tabs defaultValue="amenities" className="w-full">
//               <TabsList className="mb-6 flex w-full overflow-x-auto space-x-1 pb-2 no-scrollbar">
//                 <TabsTrigger value="amenities" className="flex-shrink-0">Amenities</TabsTrigger>
//                 <TabsTrigger value="location" className="flex-shrink-0">Location</TabsTrigger>
//                 <TabsTrigger value="nearby" className="flex-shrink-0">Nearby Places</TabsTrigger>
//                 <TabsTrigger value="legals" className="flex-shrink-0">Legal Info</TabsTrigger>
//                 <TabsTrigger value="faq" className="flex-shrink-0">FAQs</TabsTrigger>
//               </TabsList>
              
//               <TabsContent value="amenities" className="bg-white rounded-lg shadow-sm p-6">
//                 <PropertyAmenities 
//                   amenities={
//                     Array.isArray(normalizedProperty.amenities) 
//                       ? normalizedProperty.amenities.filter(Boolean) 
//                       : Array.isArray(normalizedProperty.features) 
//                         ? normalizedProperty.features.filter(Boolean) 
//                         : []
//                   } 
//                 />
//               </TabsContent>
              
//               <TabsContent value="location" className="bg-white rounded-lg shadow-sm p-6">
//                 <h3 className="text-xl font-semibold mb-4">Location</h3>
//                 <p className="text-gray-700 mb-4">
//                   {normalizedProperty.projectName || normalizedProperty.name || 'This property'} is located in {normalizedProperty.location || 'Hyderabad'}.
//                 </p>
                
//                 {/* Map - Only show if we have coordinates */}
//                 {normalizedProperty.latitude && normalizedProperty.longitude ? (
//                   <div className="mt-4">
//                     <PropertyMap 
//                       latitude={normalizedProperty.latitude} 
//                       longitude={normalizedProperty.longitude} 
//                       propertyName={normalizedProperty.projectName || normalizedProperty.name || 'Property'}
//                       location={normalizedProperty.location || 'Hyderabad'}
//                     />
//                   </div>
//                 ) : (
//                   <div className="mt-4 p-6 bg-gray-50 rounded-lg text-center">
//                     <p className="text-gray-500">Map location data not available for this property.</p>
//                     <p className="text-sm text-gray-400 mt-1">Please contact the property expert for location details.</p>
//                   </div>
//                 )}

//                 {/* Nearby locations list if available */}
//                 {normalizedProperty.nearbyLocations && normalizedProperty.nearbyLocations.length > 0 && (
//                   <div className="mt-6">
//                     <h4 className="text-lg font-semibold mb-3">Key Areas Nearby</h4>
//                     <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
//                       {normalizedProperty.nearbyLocations.map((location, index) => (
//                         <motion.li 
//                           key={index}
//                           className="flex items-center"
//                           whileHover={{ x: 3, transition: { duration: 0.2 } }}
//                         >
//                           <MapPin className="h-4 w-4 text-[#1752FF] mr-2 flex-shrink-0" />
//                           <span className="text-gray-700">{location}</span>
//                         </motion.li>
//                       ))}
//                     </ul>
//                   </div>
//                 )}
//               </TabsContent>
              
//               <TabsContent value="nearby" className="bg-white rounded-lg shadow-sm p-6">
//                 <PropertyNearbyPlaces 
//                   property_id={normalizedProperty.property_id ? String(normalizedProperty.property_id) : normalizedProperty.id ? String(normalizedProperty.id) : undefined} 
//                   latitude={normalizedProperty.latitude} 
//                   longitude={normalizedProperty.longitude}
//                   propertyName={normalizedProperty.projectName || normalizedProperty.name || 'Property'}
//                 />
//               </TabsContent>
              
//               <TabsContent value="legals" className="bg-white rounded-lg shadow-sm p-6">
//                 <h3 className="text-xl font-semibold mb-4">Legal Information</h3>
//                 <div className="space-y-4">
//                   <div className="flex items-start">
//                     <CheckCircle2 className="h-5 w-5 text-[#1752FF] mr-2 mt-0.5 flex-shrink-0" />
//                     <div>
//                       <h4 className="font-medium">RERA Number</h4>
//                       <p className="text-gray-700">{normalizedProperty.reraNumber || 'Please contact the developer for RERA details'}</p>
//                     </div>
//                   </div>
                  
//                   {Array.isArray(normalizedProperty.loanApprovedBanks) && normalizedProperty.loanApprovedBanks.length > 0 && normalizedProperty.loanApprovedBanks.some(bank => bank) && (
//                     <div className="flex items-start">
//                       <CheckCircle2 className="h-5 w-5 text-[#1752FF] mr-2 mt-0.5 flex-shrink-0" />
//                       <div>
//                         <h4 className="font-medium">Loan Approved Banks</h4>
//                         <p className="text-gray-700">{normalizedProperty.loanApprovedBanks.filter(Boolean).join(', ')}</p>
//                       </div>
//                     </div>
//                   )}
                  
//                   <div className="flex items-start">
//                     <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
//                     <div>
//                       <h4 className="font-medium">Legal Disclaimer</h4>
//                       <p className="text-gray-700 text-sm">
//                         The information displayed is for informational purposes only. Interested buyers are advised to 
//                         verify all project details, approvals, and documents independently before making any purchase decisions.
//                         Relai is not responsible for any discrepancies or changes in the project details.
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </TabsContent>
              
//               <TabsContent value="faq" className="bg-white rounded-lg shadow-sm p-6">
//                 <h3 className="text-xl font-semibold mb-4">Frequently Asked Questions</h3>
                
//                 {Array.isArray(normalizedProperty.faq) && normalizedProperty.faq.length > 0 ? (
//                   <div className="space-y-4">
//                     {normalizedProperty.faq.map((faqItem, index) => {
//                       if (!faqItem || typeof faqItem !== 'string') {
//                         return null; // Skip invalid FAQ items
//                       }
                      
//                       // Safely parse FAQ item which should be in "Q: question A: answer" format
//                       let question = "About this property";
//                       let answer = "Please contact our property expert for detailed information.";
                      
//                       try {
//                         // Handle different FAQ formats
//                         if (faqItem.includes('Q:') && faqItem.includes('A:')) {
//                           const parts = faqItem.split('A:');
//                           question = parts[0].replace('Q:', '').trim();
//                           answer = parts[1] ? parts[1].trim() : answer;
//                         } else if (faqItem.includes('?')) {
//                           // Try to split by question mark
//                           const parts = faqItem.split('?');
//                           question = parts[0] ? `${parts[0]}?` : question;
//                           answer = parts[1] ? parts[1].trim() : answer;
//                         } else {
//                           // Use the whole string as an answer to a generic question
//                           answer = faqItem;
//                         }
//                       } catch (e) {
//                         // If any error in parsing, use the whole string as answer
//                         answer = faqItem;
//                       }
                      
//                       return (
//                         <div key={index} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
//                           <div className="flex items-start">
//                             <HelpCircle className="h-5 w-5 text-[#1752FF] mr-2 mt-0.5 flex-shrink-0" />
//                             <div>
//                               <h4 className="font-medium">{question}</h4>
//                               <p className="text-gray-700 mt-1">{answer}</p>
//                             </div>
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 ) : (
//                   <div className="flex flex-col items-center justify-center py-6 text-center">
//                     <HelpCircle className="h-10 w-10 text-gray-300 mb-2" />
//                     <p className="text-gray-600">
//                       Have questions about this property? Contact our property experts for detailed information.
//                     </p>
//                     <Button className="mt-4 bg-[#1752FF]">
//                       Ask a Question
//                     </Button>
//                   </div>
//                 )}
//               </TabsContent>
//             </Tabs>
//           </div>
          
//           {/* Right Column - Contact/CTA section */}
//           <div className="lg:col-span-1 space-y-6">
//             {/* Price Card with CTA */}
//             <motion.div 
//               className="bg-white rounded-lg shadow-sm overflow-hidden sticky top-24"
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.2, duration: 0.5 }}
//             >
//               {/* Header with Price */}
//               <div className="bg-[#1752FF] text-white p-5">
//                 <h3 className="text-xl font-semibold">Interested in this property?</h3>
//                 <div className="flex items-baseline mt-2">
//                   <span className="text-2xl font-bold">{formatPrice(normalizedProperty.price)}</span>
//                   {normalizedProperty.pricePerSqft && (
//                     <span className="text-sm ml-2 opacity-80">
//                       (₹{normalizedProperty.pricePerSqft}/sq.ft)
//                     </span>
//                   )}
//                 </div>
//               </div>
              
//               {/* Contact Form */}
//               <div className="p-5">
//                 <PropertyExpertContact property={normalizedProperty} />
//               </div>
              
//               {/* Benefits */}
//               <div className="p-5 bg-blue-50">
//                 <h4 className="font-semibold text-gray-800 mb-3">Relai Buyer Benefits</h4>
//                 <ul className="space-y-2">
//                   <motion.li 
//                     className="flex items-start"
//                     whileHover={{ x: 3 }}
//                   >
//                     <CheckCircle2 className="h-5 w-5 text-[#1752FF] mr-2 mt-0.5 flex-shrink-0" />
//                     <span className="text-sm">Legal fees waiver up to ₹10,000</span>
//                   </motion.li>
//                   <motion.li 
//                     className="flex items-start"
//                     whileHover={{ x: 3 }}
//                   >
//                     <CheckCircle2 className="h-5 w-5 text-[#1752FF] mr-2 mt-0.5 flex-shrink-0" />
//                     <span className="text-sm">First EMI covered up to ₹1 Lakh</span>
//                   </motion.li>
//                   <motion.li 
//                     className="flex items-start"
//                     whileHover={{ x: 3 }}
//                   >
//                     <CheckCircle2 className="h-5 w-5 text-[#1752FF] mr-2 mt-0.5 flex-shrink-0" />
//                     <span className="text-sm">Loyalty discount of ₹1 Lakh</span>
//                   </motion.li>
//                   <motion.li 
//                     className="flex items-start"
//                     whileHover={{ x: 3 }}
//                   >
//                     <CheckCircle2 className="h-5 w-5 text-[#1752FF] mr-2 mt-0.5 flex-shrink-0" />
//                     <span className="text-sm">30% discount on interior design</span>
//                   </motion.li>
//                 </ul>
//                 <div className="mt-4 text-center">
//                   <Button 
//                     variant="link" 
//                     className="text-[#1752FF] p-0 h-auto"
//                     onClick={() => navigate("/benefits")}
//                   >
//                     View All Benefits
//                   </Button>
//                 </div>
//               </div>
              
//               {/* Share & Save */}
//               <div className="p-5 border-t border-gray-100 flex justify-between">
//                 <Button 
//                   variant="outline" 
//                   size="sm" 
//                   className="flex-1 mr-2"
//                   onClick={() => {
//                     if (navigator.share) {
//                       navigator.share({
//                         title: normalizedProperty?.ProjectName || normalizedProperty?.projectName || normalizedProperty?.name,
//                         text: `Check out this property: ${normalizedProperty?.ProjectName || normalizedProperty?.projectName || normalizedProperty?.name} in ${normalizedProperty?.Area || normalizedProperty?.location}`,
//                         url: window.location.href
//                       });
//                     } else {
//                       const el = document.createElement('textarea');
//                       el.value = window.location.href;
//                       document.body.appendChild(el);
//                       el.select();
//                       document.execCommand('copy');
//                       document.body.removeChild(el);
//                       alert('Link copied to clipboard!');
//                     }
//                   }}
//                 >
//                   <Share2 className="h-4 w-4 mr-2" /> Share
//                 </Button>
//                 <Button 
//                   variant="outline" 
//                   size="sm" 
//                   className="flex-1"
//                   onClick={() => {
//                     // Save to local storage
//                     const savedProperties = JSON.parse(localStorage.getItem('savedProperties') || '[]');
//                     const isAlreadySaved = savedProperties.some((p: any) => p.id === normalizedProperty.id);
                    
//                     if (isAlreadySaved) {
//                       // Remove from saved
//                       const updatedSaved = savedProperties.filter((p: any) => p.id !== normalizedProperty.id);
//                       localStorage.setItem('savedProperties', JSON.stringify(updatedSaved));
//                       alert('Property removed from saved properties');
//                     } else {
//                       // Add to saved
//                       savedProperties.push({
//                         id: normalizedProperty.id,
//                         name: normalizedProperty.projectName || normalizedProperty.name,
//                         location: normalizedProperty.location,
//                         image: normalizedProperty.images?.[0] || '',
//                         savedAt: new Date().toISOString()
//                       });
//                       localStorage.setItem('savedProperties', JSON.stringify(savedProperties));
//                       alert('Property saved to your favorites');
//                     }
//                   }}
//                 >
//                   <Heart className="h-4 w-4 mr-2" /> Save
//                 </Button>
//               </div>
//             </motion.div>
//           </div>
//         </div>
//       </Container>
//     </div>
//   );
// }