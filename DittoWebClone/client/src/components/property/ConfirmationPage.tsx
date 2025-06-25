import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { PropertyPreference, UserInfo } from "../../pages/PropertyWizardPage";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BedDoubleIcon, HomeIcon, MapPinIcon } from "lucide-react";

// Helper function to format property price
const formatPrice = (price: number) => {
  if (!price) return 'N/A';
  
  if (price >= 10000000) { // 1 crore or more
    return `₹${(price / 10000000).toFixed(2)} Cr`;
  } else {
    return `₹${(price / 100000).toFixed(2)} L`;
  }
};
import {
  CheckCircle,
  CalendarDays,
  Clock,
  Phone,
  Home,
  MapPin,
  IndianRupee,
  Calendar,
  Building,
  User,
  Search
} from "lucide-react";

interface ConfirmationPageProps {
  propertyPreference: PropertyPreference;
  userInfo: UserInfo;
}

// Function to get display text for preference values
const getBudgetText = (value?: string) => {
  if (!value) return "Not specified";
  if (value === "not-decided") return "Not decided yet";
  
  const map: {[key: string]: string} = {
    "under-50-lakhs": "Under ₹50 Lakhs",
    "50-75-lakhs": "₹50 Lakhs - ₹75 Lakhs",
    "75-1-crore": "₹75 Lakhs - ₹1 Crore",
    "1-1.5-crore": "₹1 Crore - ₹1.5 Crore",
    "1.5-2-crore": "₹1.5 Crore - ₹2 Crore",
    "above-2-crore": "Above ₹2 Crore"
  };
  return map[value] || value;
};

const getPossessionText = (value?: string) => {
  if (!value) return "Not specified";
  if (value === "not-decided") return "Not decided yet";
  
  const map: {[key: string]: string} = {
    "ready-to-move": "Ready to Move In",
    "3-6-months": "3-6 Months",
    "6-12-months": "6-12 Months",
    "1-2-years": "1-2 Years",
    "more-than-2-years": "More than 2 Years"
  };
  return map[value] || value;
};

const getConfigurationText = (value?: string) => {
  if (!value) return "Not specified";
  if (value === "not-decided") return "Not decided yet";
  
  const map: {[key: string]: string} = {
    "1bhk": "1 BHK",
    "2bhk": "2 BHK",
    "3bhk": "3 BHK",
    "4bhk": "4 BHK",
    "villa": "Villa",
    "plot": "Plot"
  };
  return map[value] || value;
};

const getCommunityTypeText = (value?: string) => {
  if (!value) return "Not specified";
  if (value === "not-decided") return "Not decided yet";
  
  const map: {[key: string]: string} = {
    "gated-community": "Gated Community",
    "standalone": "Standalone Building",
    "both": "No Preference"
  };
  return map[value] || value;
};

const getLocationText = (locationIds?: string[], otherLocation?: string) => {
  if (!locationIds || locationIds.length === 0) return "Not specified";
  
  // Special handling for "not-decided"
  if (locationIds.includes("not-decided")) return "Not decided yet";
  
  const locationMap: {[key: string]: string} = {
    "gachibowli": "Gachibowli",
    "kondapur": "Kondapur",
    "hitech-city": "HITEC City",
    "banjara-hills": "Banjara Hills",
    "jubilee-hills": "Jubilee Hills",
    "kukatpally": "Kukatpally",
    "manikonda": "Manikonda",
    "financial-district": "Financial District",
    "madhapur": "Madhapur",
    "shamshabad": "Shamshabad",
    "other": otherLocation || "Other"
  };
  
  return locationIds.map(id => id === "other" && otherLocation ? otherLocation : locationMap[id] || id).join(", ");
};

export default function ConfirmationPage({ propertyPreference, userInfo }: ConfirmationPageProps) {
  // Format appointment time for display
  const formatTimeSlot = (timeStr: string) => {
    const [hour, minute] = timeStr.split(':');
    const hourNum = parseInt(hour, 10);
    const amPm = hourNum < 12 ? 'AM' : 'PM';
    const hour12 = hourNum % 12 === 0 ? 12 : hourNum % 12;
    return `${hour12}:${minute} ${amPm}`;
  };
  
  // Fetch matching properties based on preferences
  const { data: matchedProperties, isLoading: isLoadingProperties } = useQuery({
    queryKey: ['/api/properties-db', propertyPreference],
    queryFn: async () => {
      // Construct URL with filter parameters
      let url = '/api/properties-db?';
      
      // Only add filters if they are specified and not "not-decided"
      
      // Add price filters if available
      if (propertyPreference.minPricePerSqft && propertyPreference.maxPricePerSqft) {
        url += `minPricePerSqft=${propertyPreference.minPricePerSqft}&maxPricePerSqft=${propertyPreference.maxPricePerSqft}&`;
      }
      
      // Add configuration filter if specified and not "not-decided"
      if (propertyPreference.configuration && propertyPreference.configuration !== "not-decided") {
        url += `configurations=${encodeURIComponent(propertyPreference.configuration)}&`;
      }
      
      // Add location filter if available and not "not-decided"
      if (propertyPreference.locations && 
          propertyPreference.locations.length > 0 && 
          !propertyPreference.locations.includes("not-decided")) {
        // Filter out "other" location as it's not in the database
        const dbLocations = propertyPreference.locations.filter(loc => loc !== "other");
        if (dbLocations.length > 0) {
          const locationParam = dbLocations.join(',');
          url += `location=${encodeURIComponent(locationParam)}&`;
        }
      }
      
      // Remove trailing ampersand
      url = url.endsWith('&') ? url.slice(0, -1) : url;
      
      console.log('Fetching properties with URL:', url);
      
      // Fetch properties with these filters
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch matching properties');
      }
      return response.json();
    },
    enabled: true, // Start the query automatically
  });

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center text-center"
      >
        <div className="rounded-full bg-green-100 p-3 mb-4">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
        <h3 className="text-3xl font-bold mb-2">Appointment Confirmed!</h3>
        <p className="text-base text-gray-600 mb-4">
          Thank you for scheduling a consultation with our property expert.
          We've sent a confirmation to your WhatsApp number.
        </p>
        
        {/* Appointment Details Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-blue-50 border border-blue-100 rounded-lg p-4 w-full mb-4"
        >
          <h4 className="text-xl font-semibold mb-3 text-blue-800 flex items-center">
            <CalendarDays className="h-5 w-5 mr-1" />
            Your Appointment Details
          </h4>
          <div className="space-y-3">
            <div className="flex items-center">
              <User className="h-4 w-4 text-blue-600 mr-2" />
              <span className="text-gray-700">{userInfo.name}</span>
            </div>
            <div className="flex items-center">
              <Phone className="h-4 w-4 text-blue-600 mr-2" />
              <span className="text-gray-700">{userInfo.phone}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 text-blue-600 mr-2" />
              <span className="text-gray-700">
                {userInfo.appointmentDate ? format(userInfo.appointmentDate, "EEEE, MMMM d, yyyy") : ""}
              </span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-blue-600 mr-2" />
              <span className="text-gray-700">
                {userInfo.appointmentTime ? formatTimeSlot(userInfo.appointmentTime) : ""}
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Property Preferences Summary */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="border rounded-lg p-4"
      >
        <h4 className="text-xl font-semibold mb-3 flex items-center">
          <Home className="h-5 w-5 mr-1 text-[#1752FF]" />
          Your Property Preferences
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-start">
            <IndianRupee className="h-4 w-4 text-[#1752FF] mr-2 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Budget Range</p>
              <p className="font-medium">{getBudgetText(propertyPreference.budget)}</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <Calendar className="h-4 w-4 text-[#1752FF] mr-2 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Possession Timeline</p>
              <p className="font-medium">{getPossessionText(propertyPreference.possession)}</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <Building className="h-4 w-4 text-[#1752FF] mr-2 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Configuration</p>
              <p className="font-medium">{getConfigurationText(propertyPreference.configuration)}</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <Home className="h-4 w-4 text-[#1752FF] mr-2 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Community Type</p>
              <p className="font-medium">{getCommunityTypeText(propertyPreference.communityType)}</p>
            </div>
          </div>
          
          <div className="flex items-start col-span-1 md:col-span-2">
            <MapPin className="h-4 w-4 text-[#1752FF] mr-2 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Preferred Locations</p>
              <p className="font-medium">{getLocationText(propertyPreference.locations, propertyPreference.otherLocation)}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Matching Properties Section */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        <h4 className="text-xl font-semibold flex items-center">
          <Search className="h-5 w-5 mr-2 text-[#1752FF]" />
          Properties That Match Your Preferences
        </h4>
        
        {isLoadingProperties ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1752FF]"></div>
          </div>
        ) : matchedProperties && matchedProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matchedProperties.slice(0, 6).map((property: any) => (
              <Link key={property.id || property.property_id} href={`/property/${encodeURIComponent(property.property_id || property.id)}`}>
                <Card className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
                  {/* Property image */}
                  <div className="relative w-full h-48">
                    {property.images && property.images.length > 0 ? (
                      <img 
                        src={property.images[0]} 
                        alt={property.projectName || property.name}
                        className="w-full h-full object-cover"
                        loading="eager"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='14' text-anchor='middle' fill='%23999'%3EProperty Image%3C/text%3E%3C/svg%3E";
                        }}
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gray-100">
                        <HomeIcon className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Property type badge */}
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-white text-blue-600 font-medium">
                        {property.propertyType}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Property details */}
                  <CardContent className="flex flex-col flex-grow p-4">
                    <div className="mb-2">
                      <h3 className="font-semibold text-lg line-clamp-1">{property.projectName || property.name}</h3>
                      <div className="flex items-center text-gray-500 text-sm">
                        <MapPinIcon size={14} className="mr-1" />
                        <span className="line-clamp-1">{property.location}</span>
                      </div>
                    </div>
                    
                    {/* Property specs */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      {/* Configuration */}
                      {(property.configurations || property.bedrooms > 0) && (
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1 text-gray-500 mb-1">
                            <BedDoubleIcon size={14} />
                            <span className="text-xs">Configuration</span>
                          </div>
                          <span className="text-sm font-medium">
                            {property.configurations || `${property.bedrooms} BHK`}
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
                            {property.minSizeSqft || property.area} sq.ft
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
                          {property.price_per_sqft || property.pricePerSqft ? 
                           `₹${(property.price_per_sqft || property.pricePerSqft).toLocaleString()}` : 
                           'N/A'}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Total Price</p>
                        <p className="text-lg font-semibold">
                          {formatPrice(property.price)}
                        </p>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border border-dashed rounded-lg">
            <div className="mx-auto w-16 h-16 bg-gray-100 flex items-center justify-center rounded-full mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h5 className="font-medium text-lg mb-2">No Exact Matches Found</h5>
            <p className="text-gray-600 max-w-md mx-auto">
              Our team will search for properties that meet your requirements during your consultation.
            </p>
          </div>
        )}
        
        {matchedProperties && matchedProperties.length > 6 && (
          <div className="text-center pt-4">
            <Link href="/properties">
              <Button variant="outline">
                View All {matchedProperties.length} Matching Properties
              </Button>
            </Link>
          </div>
        )}
      </motion.div>

      {/* What Happens Next */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="space-y-4"
      >
        <h4 className="text-xl font-semibold">What Happens Next?</h4>
        <ol className="space-y-3 list-decimal pl-5">
          <li className="text-gray-700">
            You'll receive a WhatsApp message with a confirmation of your appointment and a meeting link.
          </li>
          <li className="text-gray-700">
            Our property expert will prepare a curated list of properties based on your preferences.
          </li>
          <li className="text-gray-700">
            During the consultation, we'll discuss the available options and answer any questions you might have.
          </li>
          <li className="text-gray-700">
            We'll arrange property visits for the options you're interested in.
          </li>
        </ol>
      </motion.div>

      {/* Return to Homepage Button */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="pt-4 flex justify-center"
      >
        <Link href="/">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              variant="outline" 
              className="px-8 py-2"
            >
              Return to Homepage
            </Button>
          </motion.div>
        </Link>
      </motion.div>
    </div>
  );
}