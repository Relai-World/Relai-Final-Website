import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  MapPin, 
  Building, 
  Home, 
  Star, 
  Calendar, 
  Users, 
  Award, 
  TrendingUp, 
  Shield,
  Phone,
  Clock,
  Search
} from "lucide-react";
import { useLocation } from "wouter";

interface Property {
  id: number;
  projectName: string;
  location: string;
  propertyType: string;
  communityType?: string;
  developerName: string;
  configurations?: string;
  possessionDate: string;
  minimumBudget?: number;
  maximumBudget?: number;
  area?: number;
  pricePerSqft?: number;
}

interface PropertyResultsNewProps {
  properties: Property[];
  preferences: any;
}

export default function PropertyResultsNew({ properties, preferences }: PropertyResultsNewProps) {
  const [showAllProperties, setShowAllProperties] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [location, navigate] = useLocation();

  const allProperties = properties || [];
  const initialDisplayCount = 6;
  const displayProperties = allProperties.slice(0, 9); // Show 6 clear + 3 blurred

  if (allProperties.length === 0) {
    return (
      <div className="text-center py-12">
        <Home className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
        <p className="text-gray-600 mb-6">
          We couldn't find any properties matching your criteria. Try adjusting your preferences.
        </p>
        <Button onClick={() => setShowContactForm(true)}>
          Contact Our Experts
        </Button>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)} L`;
    } else {
      return `₹${price.toLocaleString()}`;
    }
  };

  const formatBudgetRange = (property: Property) => {
    const minBudget = property.minimumBudget || 0;
    const maxBudget = property.maximumBudget || 0;
    
    if (minBudget > 0 && maxBudget > 0) {
      return `${formatPrice(minBudget)} - ${formatPrice(maxBudget)}`;
    } else if (minBudget > 0) {
      return `From ${formatPrice(minBudget)}`;
    } else if (maxBudget > 0) {
      return `Up to ${formatPrice(maxBudget)}`;
    }
    return "Price on Request";
  };

  const formatPossessionDate = (possessionDate: string) => {
    if (!possessionDate || possessionDate === 'Information Not available') {
      return "Information Not Available";
    }
    
    // Handle MM-YY format (e.g., "12-25" for December 2025)
    if (possessionDate.includes('-') && possessionDate.length <= 5) {
      const [month, year] = possessionDate.split('-');
      const fullYear = parseInt(year) > 50 ? 1900 + parseInt(year) : 2000 + parseInt(year);
      const date = new Date(fullYear, parseInt(month) - 1);
      
      if (isNaN(date.getTime())) {
        return "Ready to Move";
      }
      
      const currentDate = new Date();
      if (date <= currentDate) {
        return "Ready to Move";
      }
      
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      return `${monthName} ${fullYear}`;
    }
    
    // Handle other date formats
    const date = new Date(possessionDate);
    if (isNaN(date.getTime())) {
      return "Ready to Move";
    }
    
    const currentDate = new Date();
    if (date <= currentDate) {
      return "Ready to Move";
    }
    
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${month} ${year}`;
  };

  const calculateSmartRating = (property: Property) => {
    let rating = 3.0;
    
    if (property.minimumBudget && preferences?.budget) {
      const budgetMatch = preferences.budget.includes('crore') ? 
        property.minimumBudget >= 10000000 : property.minimumBudget < 10000000;
      if (budgetMatch) rating += 0.5;
    }
    
    if (property.propertyType === preferences?.propertyType) {
      rating += 0.3;
    }
    
    if (preferences?.locations?.includes(property.location)) {
      rating += 0.4;
    }
    
    const possessionDate = new Date(property.possessionDate);
    const currentDate = new Date();
    if (possessionDate <= currentDate) {
      rating += 0.3;
    }
    
    return Math.min(rating, 5.0);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="w-full px-6 py-8">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex gap-8">
            {/* Main Content - Centered */}
            <div className="flex-1 space-y-8">
              {/* Enhanced Header */}
              <motion.div 
                className="text-center mb-12"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-full mb-4">
                  <Award className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">AI Verified</span>
                  <Badge variant="secondary" className="text-xs">RERA Verified</Badge>
                </div>
                
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                  {allProperties.length} Properties Match Your Dreams
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  Curated properties that perfectly align with your preferences and budget
                </p>
                
                <motion.div 
                  className="flex items-center justify-center gap-6 mt-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  <motion.div 
                    className="flex items-center gap-2 px-3 py-2 bg-white/80 rounded-full border border-gray-200 shadow-sm"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.5, type: "spring" }}
                    whileHover={{ scale: 1.05, y: -2 }}
                  >
                    <motion.div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <motion.div
                          key={star}
                          initial={{ opacity: 0, rotate: -180 }}
                          animate={{ opacity: 1, rotate: 0 }}
                          transition={{ delay: 0.6 + star * 0.1, duration: 0.3 }}
                        >
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        </motion.div>
                      ))}
                    </motion.div>
                    <span className="text-sm font-medium text-gray-700">AI Matched</span>
                  </motion.div>
                  
                  <motion.div 
                    className="flex items-center gap-2 px-3 py-2 bg-white/80 rounded-full border border-gray-200 shadow-sm"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, duration: 0.5, type: "spring" }}
                    whileHover={{ scale: 1.05, y: -2 }}
                  >
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Shield className="h-4 w-4 text-green-500" />
                    </motion.div>
                    <span className="text-sm font-medium text-gray-700">RERA Verified</span>
                  </motion.div>
                  
                  <motion.div 
                    className="flex items-center gap-2 px-3 py-2 bg-white/80 rounded-full border border-gray-200 shadow-sm"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7, duration: 0.5, type: "spring" }}
                    whileHover={{ scale: 1.05, y: -2 }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.2 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Award className="h-4 w-4 text-yellow-500" />
                    </motion.div>
                    <span className="text-sm font-medium text-gray-700">Premium Properties</span>
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* Property Grid */}
              <motion.div 
                className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {displayProperties.map((property, index) => (
                  <motion.div
                    key={property.id}
                    variants={cardVariants}
                    className={index >= 6 && index < 9 ? "blur-sm opacity-60 pointer-events-none" : ""}
                  >
                    <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-white/80 backdrop-blur-sm hover:bg-white h-full">
                      <div className="relative">
                        {/* Budget Badge */}
                        <div className="absolute top-4 left-4 z-10">
                          <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-3 py-1">
                            {formatBudgetRange(property)}
                          </Badge>
                        </div>
                        
                        {/* Smart Rating */}
                        <div className="absolute top-4 right-4 z-10">
                          <div className="bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            <span className="text-xs font-semibold text-gray-700">
                              {calculateSmartRating(property).toFixed(1)}
                            </span>
                          </div>
                        </div>

                        {/* Property Image Placeholder */}
                        <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                          <Building className="h-16 w-16 text-gray-400" />
                        </div>
                      </div>

                      <CardContent className="p-6 space-y-4 flex-1">
                        {/* Property Title */}
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                            {property.projectName}
                          </h3>
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span className="text-sm">{property.location}</span>
                          </div>
                        </div>

                        {/* Property Details */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Home className="h-4 w-4 text-blue-500" />
                              <span className="text-sm text-gray-600 capitalize">{property.propertyType}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-green-500" />
                              <span className="text-sm text-gray-600">By {property.developerName}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {property.configurations && (
                              <div className="flex items-center gap-2">
                                <Building className="h-4 w-4 text-purple-500" />
                                <span className="text-sm text-gray-600">{property.configurations}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-orange-500" />
                              <span className="text-sm text-gray-600">{formatPossessionDate(property.possessionDate)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Community Type */}
                        {property.communityType && (
                          <div className="pt-2">
                            <Badge variant="outline" className="text-xs">
                              {property.communityType}
                            </Badge>
                          </div>
                        )}

                        {/* Action Button */}
                        <motion.div
                          className="pt-4"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button 
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                            onClick={() => setShowContactForm(true)}
                          >
                            View Details →
                          </Button>
                        </motion.div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>

              {/* View More Properties Button */}
              {allProperties.length > 9 && (
                <motion.div 
                  className="text-center mt-12"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                >
                  <motion.button
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowContactForm(true)}
                  >
                    <Building className="h-5 w-5 inline mr-2" />
                    View {allProperties.length - 9} More Properties
                  </motion.button>
                  <p className="text-sm text-gray-600 mt-3">
                    Get personalized recommendations and access to all matching properties
                  </p>
                  
                  <motion.div 
                    className="mt-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.0 }}
                  >
                    <Button
                      className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-semibold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                      onClick={() => setShowContactForm(true)}
                    >
                      <Phone className="h-5 w-5 inline mr-2" />
                      Get Expert Property Consultation
                    </Button>
                    <p className="text-sm text-gray-600 mt-2">
                      Connect with our property experts for personalized guidance
                    </p>
                  </motion.div>
                </motion.div>
              )}

              {/* Contact Form Dialog */}
              <Dialog open={showContactForm} onOpenChange={setShowContactForm}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-center text-xl font-bold text-gray-900">
                      Get Expert Property Consultation
                    </DialogTitle>
                    <div className="text-center text-gray-600 mt-2">
                      Connect with our property experts for personalized guidance
                    </div>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact-name" className="text-sm font-medium">Your Name</Label>
                      <Input
                        id="contact-name"
                        placeholder="Enter your full name"
                        className="w-full"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="contact-phone" className="text-sm font-medium">WhatsApp Number</Label>
                      <Input
                        id="contact-phone"
                        placeholder="Enter your WhatsApp number"
                        className="w-full"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="contact-email" className="text-sm font-medium">Email Address</Label>
                      <Input
                        id="contact-email"
                        type="email"
                        placeholder="Enter your email address"
                        className="w-full"
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={() => setShowContactForm(false)}
                        variant="outline"
                        className="flex-1"
                      >
                        ← Back to property preferences
                      </Button>
                      <Button
                        onClick={() => {
                          setShowContactForm(false);
                          window.open("https://wa.me/918881088890?text=Hi, I'd like to schedule a consultation to discuss my property requirements.", "_blank");
                        }}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        Schedule Appointment →
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            {/* Right Sidebar */}
            <div className="w-80 space-y-6 flex-shrink-0">
              {/* Search Summary */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:shadow-lg transition-shadow duration-300">
                  <motion.h3 
                    className="text-lg font-semibold mb-4 flex items-center gap-2 text-blue-800"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <motion.div 
                      className="p-2 bg-blue-100 rounded-lg"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <Search className="h-4 w-4 text-blue-600" />
                    </motion.div>
                    Search Summary
                  </motion.h3>
                  <div className="space-y-3">
                    <motion.div 
                      className="flex justify-between items-center py-2 px-3 bg-white/60 rounded-lg hover:bg-white/80 transition-all duration-200 cursor-pointer"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      whileHover={{ scale: 1.02, x: 5 }}
                    >
                      <span className="text-gray-600 text-sm">📍 Found</span>
                      <motion.span 
                        className="font-bold text-blue-600 text-lg"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.6, type: "spring" }}
                      >
                        {allProperties.length}
                      </motion.span>
                    </motion.div>
                    {preferences?.budget && (
                      <motion.div 
                        className="flex justify-between items-center py-2 px-3 bg-white/60 rounded-lg hover:bg-white/80 transition-all duration-200 cursor-pointer"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        whileHover={{ scale: 1.02, x: 5 }}
                      >
                        <span className="text-gray-600 text-sm">💰 Budget</span>
                        <span className="font-semibold text-green-600">{preferences.budget}</span>
                      </motion.div>
                    )}
                    {preferences?.propertyType && (
                      <motion.div 
                        className="flex justify-between items-center py-2 px-3 bg-white/60 rounded-lg hover:bg-white/80 transition-all duration-200 cursor-pointer"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                        whileHover={{ scale: 1.02, x: 5 }}
                      >
                        <span className="text-gray-600 text-sm">🏠 Type</span>
                        <span className="font-semibold text-blue-600 capitalize">{preferences.propertyType}</span>
                      </motion.div>
                    )}
                    {preferences?.communityType && (
                      <motion.div 
                        className="flex justify-between items-center py-2 px-3 bg-white/60 rounded-lg hover:bg-white/80 transition-all duration-200 cursor-pointer"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.7 }}
                        whileHover={{ scale: 1.02, x: 5 }}
                      >
                        <span className="text-gray-600 text-sm">🏘️ Community</span>
                        <span className="font-semibold text-orange-600 capitalize">{preferences.communityType.replace('-', ' ')}</span>
                      </motion.div>
                    )}
                    {preferences?.possession && (
                      <motion.div 
                        className="flex justify-between items-center py-2 px-3 bg-white/60 rounded-lg hover:bg-white/80 transition-all duration-200 cursor-pointer"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.8 }}
                        whileHover={{ scale: 1.02, x: 5 }}
                      >
                        <span className="text-gray-600 text-sm">📅 Possession</span>
                        <span className="font-semibold text-red-600 capitalize">{preferences.possession.replace('-', ' ')}</span>
                      </motion.div>
                    )}
                  </div>
                </Card>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 hover:shadow-lg transition-shadow duration-300">
                  <motion.h3 
                    className="text-lg font-semibold mb-4 text-purple-800"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    Quick Actions
                  </motion.h3>
                  <div className="space-y-3">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.6 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        variant="outline" 
                        className="w-full justify-start text-left border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                        onClick={() => setShowContactForm(true)}
                      >
                        <motion.div 
                          className="p-1 bg-blue-100 rounded mr-3"
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.5 }}
                        >
                          <Phone className="h-3 w-3 text-blue-600" />
                        </motion.div>
                        Book Expert Session
                      </Button>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.7 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        variant="outline" 
                        className="w-full justify-start text-left border-green-200 hover:bg-green-50 hover:border-green-300 transition-all duration-200"
                        onClick={() => setShowContactForm(true)}
                      >
                        <motion.div 
                          className="p-1 bg-green-100 rounded mr-3"
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.5 }}
                        >
                          <Calendar className="h-3 w-3 text-green-600" />
                        </motion.div>
                        Start Advisory Process
                      </Button>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.8 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        variant="outline" 
                        className="w-full justify-start text-left border-purple-200 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
                        onClick={() => setShowContactForm(true)}
                      >
                        <motion.div 
                          className="p-1 bg-purple-100 rounded mr-3"
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.5 }}
                        >
                          <Building className="h-3 w-3 text-purple-600" />
                        </motion.div>
                        Schedule Consultation
                      </Button>
                    </motion.div>
                  </div>
                </Card>
              </motion.div>

              {/* Market Insights */}
              <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <h3 className="text-lg font-semibold mb-4 text-green-800">Market Insights</h3>
                <div className="space-y-4">
                  <div className="bg-white/60 p-3 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Average Price</div>
                    <div className="text-xl font-bold text-green-600">₹1.8 Cr</div>
                  </div>
                  <div className="bg-white/60 p-3 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Most Common Type</div>
                    <div className="font-semibold text-blue-600">Apartment</div>
                  </div>
                  <div className="bg-white/60 p-3 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Availability</div>
                    <div className="font-semibold text-orange-600">High Demand</div>
                  </div>
                </div>
              </Card>

              {/* Need Expert Help */}
              <Card className="p-6 bg-gradient-to-br from-orange-100 to-red-100 border-orange-300 shadow-lg">
                <h3 className="text-lg font-semibold mb-2 text-orange-800">Need Expert Help?</h3>
                <p className="text-sm text-orange-700 mb-4">
                  Get personalized guidance from our property experts
                </p>
                <Button 
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => setShowContactForm(true)}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Schedule Consultation
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}