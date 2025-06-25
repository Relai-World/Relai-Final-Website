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
  Download
} from "lucide-react";
import { useLocation } from "wouter";
import PDFDownloadForm from "./PDFDownloadForm";

import { Property } from '@shared/schema';

interface PropertyResultsNewProps {
  properties: Property[];
  preferences: any;
}

export default function PropertyResultsNew({ properties, preferences }: PropertyResultsNewProps) {
  const [, navigate] = useLocation();
  const [showAllProperties, setShowAllProperties] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showPDFForm, setShowPDFForm] = useState(false);

  const allProperties = properties || [];
  const initialDisplayCount = 6;
  const displayProperties = showAllProperties ? allProperties : allProperties.slice(0, initialDisplayCount);

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
    
    if (minBudget === 0 && maxBudget === 0) {
      return "Price on Request";
    }
    
    if (minBudget > 0 && maxBudget > 0 && minBudget !== maxBudget) {
      return `${formatPrice(minBudget)} - ${formatPrice(maxBudget)}`;
    } else if (minBudget > 0) {
      return formatPrice(minBudget);
    } else if (maxBudget > 0) {
      return formatPrice(maxBudget);
    }
    
    return "Price on Request";
  };

  const formatPossessionDate = (possessionDate: string) => {
    if (!possessionDate) return "Ready to Move";
    
    const date = new Date(possessionDate);
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
    
    if (property.possessionDate && property.possessionDate !== null) {
      try {
        const possessionDate = new Date(property.possessionDate);
        const currentDate = new Date();
        if (possessionDate <= currentDate) {
          rating += 0.3;
        }
      } catch (error) {
        // Invalid date format, skip this rating factor
      }
    }
    
    return Math.min(rating, 5.0);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
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
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Enhanced Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          >
            <Award className="h-4 w-4 mr-2" />
            Perfect Matches Found!
          </motion.div>
          
          <motion.h2 
            className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            {allProperties.length} Properties Match Your Dreams
          </motion.h2>
          
          <motion.p 
            className="text-lg text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Curated properties that perfectly align with your preferences and budget
          </motion.p>

          {/* Stats Bar */}
          <motion.div 
            className="flex justify-center items-center space-x-8 mt-6 text-sm text-gray-600"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <motion.div 
              className="flex items-center group cursor-pointer hover:text-green-700 transition-colors duration-300"
              whileHover={{ scale: 1.05, y: -2 }}
            >
              <TrendingUp className="h-4 w-4 mr-1 text-green-600" />
              <span>AI Matched</span>
            </motion.div>
            
            <motion.div 
              className="flex items-center group cursor-pointer hover:text-blue-700 transition-colors duration-300"
              whileHover={{ scale: 1.05, y: -2 }}
            >
              <Shield className="h-4 w-4 mr-1 text-blue-600" />
              <span>RERA Verified</span>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Property Grid - Full Width */}
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
              whileHover={{ 
                y: -8, 
                scale: 1.02,
                transition: { duration: 0.3 }
              }}
              whileTap={{ scale: 0.98 }}
            >
              <Card className="group border-0 shadow-lg shadow-gray-100/50 hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300 bg-white/80 backdrop-blur-sm overflow-hidden h-full flex flex-col">
                <CardContent className="p-0 flex flex-col h-full">
                  {/* Property Image Placeholder */}
                  <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 h-48 flex items-center justify-center">
                    <motion.div
                      className="text-gray-400"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Home className="h-16 w-16" />
                    </motion.div>
                    
                    {/* Price Badge */}
                    <motion.div 
                      className="absolute top-4 left-4 bg-gradient-to-r from-[#1752FF] to-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 + 0.3 }}
                    >
                      {formatBudgetRange(property)}
                    </motion.div>

                    {/* Smart Rating Badge */}
                    <motion.div 
                      className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-800 px-2 py-1 rounded-full text-sm font-medium shadow-lg flex items-center"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 + 0.4 }}
                    >
                      <Star className="h-3 w-3 text-yellow-400 fill-current mr-1" />
                      {calculateSmartRating(property).toFixed(1)}
                    </motion.div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <motion.h3 
                      className="font-bold text-xl text-gray-900 mb-4 group-hover:text-[#1752FF] transition-colors duration-300 line-clamp-2 min-h-[3.5rem]"
                      whileHover={{ scale: 1.02 }}
                    >
                      {property.projectName}
                    </motion.h3>

                    <div className="space-y-3 mb-6 flex-1">
                      <motion.div 
                        className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                        whileHover={{ x: 3 }}
                      >
                        <MapPin className="h-4 w-4 mr-3 text-blue-500 flex-shrink-0" />
                        <span className="text-sm font-medium truncate">{property.location}</span>
                      </motion.div>
                      
                      <motion.div 
                        className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                        whileHover={{ x: 3 }}
                      >
                        <Building className="h-4 w-4 mr-3 text-purple-500 flex-shrink-0" />
                        <span className="text-sm font-medium truncate">{property.propertyType}</span>
                      </motion.div>

                      {property.communityType && (
                        <motion.div 
                          className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                          whileHover={{ x: 3 }}
                        >
                          <Home className="h-4 w-4 mr-3 text-green-500 flex-shrink-0" />
                          <span className="text-sm font-medium truncate">{property.communityType}</span>
                        </motion.div>
                      )}

                      <motion.div 
                        className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                        whileHover={{ x: 3 }}
                      >
                        <Users className="h-4 w-4 mr-3 text-orange-500 flex-shrink-0" />
                        <span className="text-sm font-medium truncate">By {property.developerName}</span>
                      </motion.div>

                      {property.configurations && (
                        <motion.div 
                          className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                          whileHover={{ x: 3 }}
                        >
                          <Badge className="h-4 w-4 mr-3 text-indigo-500 flex-shrink-0" />
                          <span className="text-sm font-medium truncate">{property.configurations}</span>
                        </motion.div>
                      )}

                      <motion.div 
                        className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                        whileHover={{ x: 3 }}
                      >
                        <Calendar className="h-4 w-4 mr-3 text-emerald-500 flex-shrink-0" />
                        <span className="text-sm font-medium truncate">{property.possessionDate ? formatPossessionDate(property.possessionDate) : 'TBD'}</span>
                      </motion.div>
                    </div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        className="w-full bg-gradient-to-r from-[#1752FF] to-purple-600 hover:from-[#1752FF]/90 hover:to-purple-600/90 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                        onClick={() => navigate(`/property/${property.id}`)}
                      >
                        <span className="flex items-center justify-center">
                          View Details
                          <motion.div
                            className="ml-2"
                            initial={{ x: 0 }}
                            whileHover={{ x: 3 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                          >
                            →
                          </motion.div>
                        </span>
                      </Button>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Action Buttons Section */}
        {!showAllProperties && allProperties.length > initialDisplayCount && (
          <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.button
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowContactForm(true)}
              >
                <Building className="h-5 w-5 inline mr-2" />
                View {allProperties.length - initialDisplayCount} More Properties
              </motion.button>

              <motion.button
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowPDFForm(true)}
              >
                <Download className="h-5 w-5 inline mr-2" />
                Download PDF Report
              </motion.button>
            </div>
            <p className="text-sm text-gray-600 mt-3">
              Get personalized recommendations and access to all matching properties
            </p>
          </motion.div>
        )}

        {/* PDF Download for all properties when showing all */}
        {showAllProperties && allProperties.length > 0 && (
          <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <motion.button
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowPDFForm(true)}
            >
              <Download className="h-5 w-5 inline mr-2" />
              Download Complete Property Report ({allProperties.length} Properties)
            </motion.button>
            <p className="text-sm text-gray-600 mt-3">
              Download a comprehensive PDF report of all matched properties
            </p>
          </motion.div>
        )}

        {/* Contact Form Dialog */}
        <Dialog open={showContactForm} onOpenChange={setShowContactForm}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center text-xl font-bold text-gray-900">
                Find Your Dream Property
              </DialogTitle>
              <p className="text-center text-gray-600 mt-2">
                Complete this simple wizard to get personalized property recommendations
              </p>
            </DialogHeader>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
              <p className="text-center text-blue-800 font-medium">
                We've found properties that match your criteria!
              </p>
              <p className="text-center text-blue-600 text-sm mt-1">
                Please provide your contact details and schedule a consultation with our property expert.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="flex items-center text-gray-700 mb-2">
                  <Users className="h-4 w-4 mr-2 text-blue-600" />
                  Your Name
                </Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  className="w-full"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="flex items-center text-gray-700 mb-2">
                  <Phone className="h-4 w-4 mr-2 text-blue-600" />
                  WhatsApp Number
                </Label>
                <Input
                  id="phone"
                  placeholder="Enter your 10-digit mobile number"
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  We'll send meeting details to this WhatsApp number
                </p>
              </div>

              <div>
                <Label htmlFor="date" className="flex items-center text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                  Appointment Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Select a date within the next 30 days (excluding Sundays)
                </p>
              </div>

              <div>
                <Label htmlFor="time" className="flex items-center text-gray-700 mb-2">
                  <Clock className="h-4 w-4 mr-2 text-blue-600" />
                  Appointment Time
                </Label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select a time slot</option>
                  <option value="9:00">9:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="14:00">2:00 PM</option>
                  <option value="15:00">3:00 PM</option>
                  <option value="16:00">4:00 PM</option>
                  <option value="17:00">5:00 PM</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Our property experts are available from 9 AM to 8 PM
                </p>
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

        {/* PDF Download Form */}
        <PDFDownloadForm
          properties={allProperties}
          isOpen={showPDFForm}
          onClose={() => setShowPDFForm(false)}
        />
      </div>
    </div>
  );
}