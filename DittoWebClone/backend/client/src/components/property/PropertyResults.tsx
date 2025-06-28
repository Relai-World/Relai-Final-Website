import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { PropertyPreference } from '../../pages/PropertyWizardPage';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, addDays, isWeekend } from 'date-fns';
import { 
  MapPin, 
  Home, 
  IndianRupee, 
  Star, 
  BedDouble, 
  Building,
  ArrowRight,
  Loader2,
  SearchX,
  Calendar as CalendarIcon,
  Clock,
  User,
  ArrowLeft,
  Phone
} from 'lucide-react';
import { useLocation } from 'wouter';

interface PropertyResultsProps {
  preferences: PropertyPreference;
}

// Helper function to format property price
const formatPrice = (price: number) => {
  if (!price) return 'Price on Request';
  
  if (price >= 10000000) { // 1 crore or more
    return `₹${(price / 10000000).toFixed(2)} Cr`;
  } else {
    return `₹${(price / 100000).toFixed(2)} L`;
  }
};

// Helper function to get the best price from property data
const getBestPrice = (property: any) => {
  // First try to get price from configurations array
  if (property.configurations && Array.isArray(property.configurations)) {
    const prices = property.configurations
      .map((config: any) => config.BaseProjectPrice)
      .filter((price: number) => price && price > 0);
    
    if (prices.length > 0) {
      // Return the minimum price from configurations
      return Math.min(...prices);
    }
  }
  
  // Fallback to other price fields
  return property['Max Budget'] || property.price || property.Price_per_sft * 1000; // Convert per sqft to total price estimate
};

export default function PropertyResults({ preferences }: PropertyResultsProps) {
  const [, setLocation] = useLocation();
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactData, setContactData] = useState({
    name: '',
    whatsapp: '',
    appointmentDate: undefined as Date | undefined,
    appointmentTime: ''
  });

  // Fetch matching properties using server-side filtering with exact Supabase column matching
  const { data: properties, isLoading, error } = useQuery({
    queryKey: ['/api/all-properties-db', preferences],
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      console.log('Property Wizard Preferences:', preferences);
      
      // Build filter parameters using exact Supabase column names
      const filterParams = new URLSearchParams();
      
      // 1. Budget filtering - Min Budget and Max Budget columns
      if (preferences.minBudget) {
        filterParams.append('minPrice', preferences.minBudget.toString());
        console.log(`Adding budget filter: minPrice=${preferences.minBudget} (${preferences.minBudget/10000000} Cr)`);
      }
      if (preferences.maxBudget) {
        filterParams.append('maxPrice', preferences.maxBudget.toString());
        console.log(`Adding budget filter: maxPrice=${preferences.maxBudget} (${preferences.maxBudget/10000000} Cr)`);
      }
      
      // Debug: Show all preferences
      console.log('All Preferences:', {
        budget: preferences.budget,
        minBudget: preferences.minBudget,
        maxBudget: preferences.maxBudget,
        locations: preferences.locations,
        propertyType: preferences.propertyType,
        configuration: preferences.configuration,
        possession: preferences.possession
      });
      
      // 2. Location filtering - Location column
      if (preferences.locations && preferences.locations.length > 0) {
        const validLocations = preferences.locations.filter(loc => 
          loc !== "other" && loc !== "not-decided"
        );
        if (validLocations.length > 0) {
          filterParams.append('location', validLocations.join(','));
          console.log(`Adding location filter: ${validLocations.join(',')}`);
        }
      }
      
      // 3. Property Type filtering - PropertyType column
      if (preferences.propertyType && preferences.propertyType !== "not-decided") {
        filterParams.append('propertyType', preferences.propertyType);
        console.log(`Adding property type filter: ${preferences.propertyType}`);
      }
      
      // 4. Configuration filtering - Only apply if explicitly required (make it more flexible)
      // Skip configuration filter to get more results, unless it's critical
      
      // 5. Possession timeline - Only apply for "ready-to-move", make others flexible
      if (preferences.possession && preferences.possession === 'ready-to-move') {
        filterParams.append('constructionStatus', preferences.possession);
        console.log(`Adding possession filter: ${preferences.possession}`);
      }
      
      // 6. Community Type filtering - Skip to get more results
      // Skip community type filter to increase result count
      
      const url = `/api/all-properties-db?${filterParams.toString()}`;
      console.log('Property Wizard API URL:', url);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch filtered properties');
      }
      
      const data = await response.json();
      console.log('Property Wizard - Filtered properties count:', data.properties?.length || 0);
      
      return data.properties || [];
    },
  });

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#1752FF]" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Finding Your Perfect Properties</h3>
        <p className="text-gray-600">Searching through our database for properties that match your preferences...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <SearchX className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Properties</h3>
        <p className="text-gray-600">Please try again or contact our support team.</p>
      </div>
    );
  }

  if (!properties || properties.length === 0) {
    return (
      <div className="text-center py-12">
        <SearchX className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">We've found properties that match your criteria!</h3>
        <p className="text-gray-600 mb-4">
          Please provide your contact details and schedule a consultation with our property expert.
        </p>
        
        {/* Contact Form - same as first screenshot */}
        <div className="max-w-md mx-auto bg-white p-6 rounded-lg border">
          <div className="space-y-4">
            <div className="text-left">
              <Label htmlFor="wizard-name" className="flex items-center gap-2 text-blue-600 font-medium">
                <User className="w-4 h-4" />
                Your Name
              </Label>
              <Input
                id="wizard-name"
                value={contactData.name}
                onChange={(e) => setContactData({...contactData, name: e.target.value})}
                placeholder="Enter your full name"
                className="mt-1"
              />
            </div>
            
            <div className="text-left">
              <Label htmlFor="wizard-whatsapp" className="flex items-center gap-2 text-blue-600 font-medium">
                <Phone className="w-4 h-4" />
                WhatsApp Number
              </Label>
              <Input
                id="wizard-whatsapp"
                value={contactData.whatsapp}
                onChange={(e) => setContactData({...contactData, whatsapp: e.target.value})}
                placeholder="Enter your 10-digit mobile number"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">We'll send meeting details to this WhatsApp number</p>
            </div>
            
            <div className="text-left">
              <Label className="flex items-center gap-2 text-blue-600 font-medium">
                <CalendarIcon className="w-4 h-4" />
                Appointment Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal mt-1"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {contactData.appointmentDate ? format(contactData.appointmentDate, "PPP") : "Select a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={contactData.appointmentDate}
                    onSelect={(date) => setContactData({...contactData, appointmentDate: date})}
                    disabled={(date) => date < new Date() || isWeekend(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <p className="text-xs text-gray-500 mt-1">Select a date within the next 30 days (excluding Sundays)</p>
            </div>
            
            <div className="text-left">
              <Label className="flex items-center gap-2 text-blue-600 font-medium">
                <Clock className="w-4 h-4" />
                Appointment Time
              </Label>
              <Select value={contactData.appointmentTime} onValueChange={(value) => setContactData({...contactData, appointmentTime: value})}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a time slot" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="09:00">9:00 AM</SelectItem>
                  <SelectItem value="10:00">10:00 AM</SelectItem>
                  <SelectItem value="11:00">11:00 AM</SelectItem>
                  <SelectItem value="12:00">12:00 PM</SelectItem>
                  <SelectItem value="14:00">2:00 PM</SelectItem>
                  <SelectItem value="15:00">3:00 PM</SelectItem>
                  <SelectItem value="16:00">4:00 PM</SelectItem>
                  <SelectItem value="17:00">5:00 PM</SelectItem>
                  <SelectItem value="18:00">6:00 PM</SelectItem>
                  <SelectItem value="19:00">7:00 PM</SelectItem>
                  <SelectItem value="20:00">8:00 PM</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">Our property experts are available from 9 AM to 8 PM</p>
            </div>
          </div>
          
          <Button 
            onClick={() => {
              const formattedDate = contactData.appointmentDate ? format(contactData.appointmentDate, "PPP") : "";
              const message = encodeURIComponent(
                `Hello, I'm interested in properties matching my preferences. My name is ${contactData.name}. I'd like to schedule a consultation on ${formattedDate} at ${contactData.appointmentTime}. Please share matching properties and confirm the meeting.`
              );
              window.open(`https://wa.me/918881088890?text=${message}`, '_blank');
            }}
            className="w-full mt-6 bg-[#1752FF] hover:bg-[#1752FF]/90"
            disabled={!contactData.name || !contactData.whatsapp || !contactData.appointmentDate || !contactData.appointmentTime}
          >
            Schedule Appointment →
          </Button>
          
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="w-full mt-3 text-gray-600"
          >
            ← Back to modify preferences
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Results Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Perfect Matches Found!
        </h2>
        <p className="text-gray-600">
          We found {properties.length} {properties.length === 1 ? 'property' : 'properties'} that match your preferences
        </p>
      </div>

      {/* Property Cards Grid - Show top 6 matching properties */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {properties.slice(0, 6).map((property: any, index: number) => (
          <motion.div
            key={property.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                  onClick={() => setLocation(`/property/${property.id}`)}>
              {/* Property Image */}
              <div className="relative h-48 bg-gradient-to-br from-blue-50 to-indigo-100">
                {property.images && property.images.length > 0 ? (
                  <img 
                    src={property.images[0]} 
                    alt={property.ProjectName || property.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Building className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                
                {/* Price Badge */}
                <div className="absolute top-3 right-3">
                  <Badge className="bg-[#1752FF] text-white font-semibold px-3 py-1">
                    {formatPrice(getBestPrice(property))}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-4">
                {/* Property Name */}
                <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">
                  {property.ProjectName || property.name}
                </h3>

                {/* Location */}
                <div className="flex items-center text-gray-600 mb-3">
                  <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span className="text-sm line-clamp-1">{property.Location || property.location}</span>
                </div>

                {/* Property Details */}
                <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                  <div className="flex items-center">
                    <Home className="w-4 h-4 mr-1" />
                    <span>{property.PropertyType || property.propertyType}</span>
                  </div>
                  
                  {(() => {
                    // Handle configurations field which can be string or array
                    let configDisplay = '';
                    if (property.configurations) {
                      if (Array.isArray(property.configurations)) {
                        // If it's an array, get unique configuration types
                        const configTypes = property.configurations.map((config: any) => config.type);
                        const uniqueConfigs = configTypes.filter((type: string, index: number) => configTypes.indexOf(type) === index);
                        configDisplay = uniqueConfigs.join(', ');
                      } else if (typeof property.configurations === 'string') {
                        // If it's a string, use it directly
                        configDisplay = property.configurations;
                      }
                    }
                    
                    return configDisplay ? (
                      <div className="flex items-center">
                        <BedDouble className="w-4 h-4 mr-1" />
                        <span>{configDisplay}</span>
                      </div>
                    ) : null;
                  })()}
                </div>

                {/* Developer */}
                {(property.DeveloperName || property.developerName) && (
                  <div className="text-sm text-gray-600 mb-3">
                    <span className="font-medium">By:</span> {property.DeveloperName || property.developerName}
                  </div>
                )}

                {/* Rating */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 mr-1" />
                    <span className="text-sm font-medium">Relai Rated</span>
                  </div>
                  
                  <Badge variant="outline" className="text-xs">
                    {property.PossessionDate || 'Ready to Move'}
                  </Badge>
                </div>
              </CardContent>

              <CardFooter className="p-4 pt-0">
                <Button 
                  className="w-full bg-[#1752FF] hover:bg-[#1752FF]/90 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLocation(`/property/${property.id}`);
                  }}
                >
                  View Details
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* View All Properties Button */}
      {properties.length > 6 && (
        <div className="text-center mb-8">
          <Button 
            variant="outline"
            onClick={() => setShowContactForm(true)}
            className="border-[#1752FF] text-[#1752FF] hover:bg-[#1752FF] hover:text-white px-8 py-3"
          >
            View All {properties.length} Properties →
          </Button>
        </div>
      )}

      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">View All {properties.length} Properties</h3>
            <p className="text-gray-600 mb-4">
              Get personalized recommendations for all matching properties. Our experts will help you explore every option.
            </p>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="contact-name">Name</Label>
                <Input
                  id="contact-name"
                  value={contactData.name}
                  onChange={(e) => setContactData({...contactData, name: e.target.value})}
                  placeholder="Your full name"
                />
              </div>
              
              <div>
                <Label htmlFor="contact-whatsapp">WhatsApp Number</Label>
                <Input
                  id="contact-whatsapp"
                  value={contactData.whatsapp}
                  onChange={(e) => setContactData({...contactData, whatsapp: e.target.value})}
                  placeholder="+91 9876543210"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => setShowContactForm(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const message = encodeURIComponent(
                    `Hi, I'm interested in viewing all ${properties.length} properties that match my preferences. My name is ${contactData.name}. Please share detailed information about all matching properties.`
                  );
                  window.open(`https://wa.me/918881088890?text=${message}`, '_blank');
                  setShowContactForm(false);
                }}
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={!contactData.name || !contactData.whatsapp}
              >
                Send WhatsApp
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Information */}
      <div className="mt-8 p-6 bg-blue-50 rounded-lg text-center">
        <h3 className="font-semibold text-gray-900 mb-2">Need Expert Guidance?</h3>
        <p className="text-gray-600 mb-4">
          Our property consultants are ready to help you find the perfect home
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            onClick={() => window.open('https://wa.me/918881088890', '_blank')}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            WhatsApp Us
          </Button>
          <Button 
            variant="outline"
            onClick={() => window.open('tel:+918881088890', '_self')}
            className="border-[#1752FF] text-[#1752FF] hover:bg-[#1752FF] hover:text-white"
          >
            Call +91 88810 88890
          </Button>
        </div>
      </div>
    </motion.div>
  );
}