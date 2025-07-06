// import { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { useQuery } from "@tanstack/react-query";
// // import PropertyPreferenceForm from "../components/property/PropertyPreferenceForm";
// import PropertyResultsNew from "../components/property/PropertyResultsNew";
// import { Card, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { 
//   ChevronLeft, 
//   ArrowRight, 
//   Search, 
//   Home,
//   CheckCircle,
//   Sparkles,
//   Target,
//   Clock,
//   Award,
//   Shield,
//   TrendingUp,
//   Star,
//   Loader2
// } from "lucide-react";
// import { Link } from "wouter";
// import { apiRequest } from "@/lib/queryClient";

// // Types for our multi-step form data
// export type PropertyPreference = {
//   budget?: string;
//   possession?: string;
//   configuration?: string;
//   locations?: string[];
//   otherLocation?: string;
//   propertyType?: string; // Added property type field
//   communityType?: string;
//   minBudget?: number;
//   maxBudget?: number;
// };

// export type UserInfo = {
//   name: string;
//   phone: string;
//   appointmentDate: Date | undefined;
//   appointmentTime: string;
// };

// // Step indicators for the wizard
// const steps = [
//   { id: "preferences", label: "Property Preferences", icon: Search },
//   { id: "results", label: "Matching Properties", icon: Home },
// ];

// export default function PropertyWizardPage() {
//   // Set page title and meta description when component mounts
//   useEffect(() => {
//     document.title = "Find Your Ideal Property | Relai Real Estate Matchmaking Tool";

//     // Set meta description
//     const metaDescription = document.querySelector('meta[name="description"]');
//     if (metaDescription) {
//       metaDescription.setAttribute('content', ' Not sure what to buy? Use Relai\'s Property Wizard to match your budget and preferences with the best real estate options in Hyderabad.');
//     } else {
//       const meta = document.createElement('meta');
//       meta.name = 'description';
//       meta.content = ' Not sure what to buy? Use Relai\'s Property Wizard to match your budget and preferences with the best real estate options in Hyderabad.';
//       document.getElementsByTagName('head')[0].appendChild(meta);
//     }

//     // Restore title when component unmounts
//     return () => {
//       document.title = "Genuine, Smarter, and End to End Real Estate Services in Hyderabad";
//       // Restore original meta description
//       const metaDesc = document.querySelector('meta[name="description"]');
//       if (metaDesc) {
//         metaDesc.setAttribute('content', 'Discover smarter real estate with Relai. Buy RERA verified properties with expert real estate guidance—all in one place');
//       }
//     };
//   }, []);
//   // State for tracking the current step
//   const [currentStep, setCurrentStep] = useState<string>("preferences");
  
//   // State for storing form data
//   const [propertyPreference, setPropertyPreference] = useState<PropertyPreference>({
//     budget: "",
//     possession: "",
//     configuration: "",
//     locations: [],
//     otherLocation: "",
//     communityType: "",
//   });
  
//   const [userInfo, setUserInfo] = useState<UserInfo>({
//     name: "",
//     phone: "",
//     appointmentDate: undefined,
//     appointmentTime: "",
//   });

//   // Fetch properties based on user preferences when showing results
//   const { data: propertiesData, isLoading: isLoadingProperties } = useQuery({
//     queryKey: ['/api/properties', propertyPreference, currentStep],
//     queryFn: async () => {
//       if (currentStep !== 'results' || !propertyPreference.budget) {
//         return { properties: [], total: 0 };
//       }

//       console.log('Fetching properties with preferences:', propertyPreference);
      
//       const requestBody = {
//         budget: propertyPreference.budget,
//         propertyType: propertyPreference.propertyType || 'any',
//         location: propertyPreference.locations?.length ? propertyPreference.locations.join(',') : 'any',
//         communityType: propertyPreference.communityType || 'any',
//         possessionTimeline: propertyPreference.possession || 'any'
//       };

//       console.log('API Request body:', requestBody);

//       const response = await fetch('/api/properties', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(requestBody),
//       });

//       if (!response.ok) {
//         throw new Error('Failed to fetch properties');
//       }

//       const data = await response.json();
//       console.log('Properties fetched:', data.total);
//       return data;
//     },
//     enabled: currentStep === 'results'
//   });

//   // Handler functions for form submissions
//   const handlePropertyPreferenceSubmit = (data: PropertyPreference) => {
//     // Process the budget range to convert it to minBudget and maxBudget for database filtering
//     const processedData = {...data};
    
//     // Handle different budget formats
//     if (data.budget && data.budget.includes('-') && !data.budget.includes('above') && !data.budget.includes('under')) {
//       // Budget format is "min-max" in crores - convert to actual numbers
//       const [minBudgetCr, maxBudgetCr] = data.budget.split('-').map(val => parseFloat(val.trim()));
      
//       // Convert crores to actual rupee values (1 crore = 10,000,000)
//       processedData.minBudget = minBudgetCr * 10000000;
//       processedData.maxBudget = maxBudgetCr * 10000000;
      
//       console.log(`Budget converted: ${minBudgetCr}Cr-${maxBudgetCr}Cr = ${processedData.minBudget}-${processedData.maxBudget} rupees`);
//     } else if (data.budget && data.budget.includes('above')) {
//       // Handle "above-2-crore" format
//       const match = data.budget.match(/above-(\d+(?:\.\d+)?)-crore/);
//       if (match) {
//         const minBudgetCr = parseFloat(match[1]);
//         processedData.minBudget = minBudgetCr * 10000000;
//         processedData.maxBudget = undefined; // No upper limit
//         console.log(`Budget Above ${minBudgetCr}Cr = ${processedData.minBudget}+ rupees`);
//       }
//     } else if (data.budget && data.budget.includes('under')) {
//       // Handle "under-50l" format  
//       const match = data.budget.match(/under-(\d+)l/);
//       if (match) {
//         const maxBudgetL = parseFloat(match[1]);
//         processedData.minBudget = undefined; // No lower limit
//         processedData.maxBudget = maxBudgetL * 100000; // Convert lakhs to rupees
//         console.log(`Budget Under ${maxBudgetL}L = up to ${processedData.maxBudget} rupees`);
//       }
//     }
    
//     setPropertyPreference(processedData);
//     setCurrentStep("results"); // Show matching properties directly
//     window.scrollTo(0, 0); // Scroll to top for results
//   };

//   const handleUserInfoSubmit = (data: UserInfo) => {
//     setUserInfo(data);
//     setCurrentStep("confirmation");
//     window.scrollTo(0, 0); // Scroll to top for confirmation

//     // Send WhatsApp message with appointment details
//     if (data.phone && data.appointmentDate) {
//       const formattedDate = new Date(data.appointmentDate).toLocaleDateString('en-US', {
//         weekday: 'long', 
//         month: 'long', 
//         day: 'numeric'
//       });
      
//       // Format time from 24-hour format to 12-hour format
//       const formatTimeSlot = (timeStr: string) => {
//         const [hour, minute] = timeStr.split(':');
//         const hourNum = parseInt(hour, 10);
//         const amPm = hourNum < 12 ? 'AM' : 'PM';
//         const hour12 = hourNum % 12 === 0 ? 12 : hourNum % 12;
//         return `${hour12}:${minute} ${amPm}`;
//       };
      
//       const formattedTime = formatTimeSlot(data.appointmentTime);

//       // Prepare WhatsApp message
//       const message = encodeURIComponent(
//         `Hello ${data.name}, your property consultation with relai is confirmed for ${formattedDate} at ${formattedTime}. Our property expert will contact you shortly with the meeting details. Thank you for choosing relai!`
//       );
      
//       // Ensure phone number format is correct (remove any + prefix if present)
//       const phoneNumber = data.phone.startsWith('+') 
//         ? data.phone.substring(1) 
//         : data.phone;
      
//       // Open WhatsApp with the message
//       window.open(`https://wa.me/918881088890?text=${message}`, '_blank');
//     }
//   };

//   // Animation variants
//   const pageVariants = {
//     initial: { opacity: 0, x: 100 },
//     animate: { opacity: 1, x: 0 },
//     exit: { opacity: 0, x: -100 }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
//       <div className="w-full pt-28 pb-16 px-6">
//         {/* Breadcrumb navigation */}
//         <div className="mb-6">
//           <Link href="/">
//             <button className="flex items-center text-sm text-gray-600 hover:text-[#1752FF] transition-colors">
//               <ChevronLeft className="h-4 w-4 mr-1" />
//               Back to Home
//             </button>
//           </Link>
//         </div>

//         {/* Hero Section */}
//         <motion.div 
//           className="text-center mb-12 max-w-7xl mx-auto"
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6 }}
//         >
//           <div className="flex items-center justify-center mb-4">
//             <Sparkles className="h-8 w-8 text-[#1752FF] mr-3" />
//             <Badge className="bg-blue-100 text-blue-800 text-sm px-3 py-1">
//               AI-Powered Property Matching
//             </Badge>
//           </div>
          
//           <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-[#1752FF] to-purple-600 bg-clip-text text-transparent mb-4">
//             Find Your Dream Property
//           </h1>
          
//           <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
//             Complete our intelligent wizard and discover properties perfectly matched to your preferences
//           </p>

//           {/* Key Benefits */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 max-w-5xl mx-auto">
//             <motion.div 
//               className="group flex items-center justify-center p-6 bg-white/70 backdrop-blur-sm rounded-xl border border-gray-100 hover:border-[#1752FF]/30 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-blue-100/50"
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.2, duration: 0.5 }}
//               whileHover={{ y: -5, scale: 1.02 }}
//               whileTap={{ scale: 0.98 }}
//             >
//               <motion.div
//                 className="h-8 w-8 text-[#1752FF] mr-3 group-hover:text-purple-600 transition-colors"
//                 whileHover={{ rotate: 360 }}
//                 transition={{ duration: 0.6 }}
//               >
//                 <Target className="h-full w-full" />
//               </motion.div>
//               <span className="text-gray-700 font-medium group-hover:text-gray-900 transition-colors">Personalized Matches</span>
//             </motion.div>
            
//             <motion.div 
//               className="group flex items-center justify-center p-6 bg-white/70 backdrop-blur-sm rounded-xl border border-gray-100 hover:border-[#1752FF]/30 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-blue-100/50"
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.3, duration: 0.5 }}
//               whileHover={{ y: -5, scale: 1.02 }}
//               whileTap={{ scale: 0.98 }}
//             >
//               <motion.div
//                 className="h-8 w-8 text-[#1752FF] mr-3 group-hover:text-purple-600 transition-colors"
//                 whileHover={{ rotate: -360 }}
//                 transition={{ duration: 0.6 }}
//               >
//                 <Clock className="h-full w-full" />
//               </motion.div>
//               <span className="text-gray-700 font-medium group-hover:text-gray-900 transition-colors">Save Time & Effort</span>
//             </motion.div>
            
//             <motion.div 
//               className="group flex items-center justify-center p-6 bg-white/70 backdrop-blur-sm rounded-xl border border-gray-100 hover:border-[#1752FF]/30 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-blue-100/50"
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.4, duration: 0.5 }}
//               whileHover={{ y: -5, scale: 1.02 }}
//               whileTap={{ scale: 0.98 }}
//             >
//               <motion.div
//                 className="h-8 w-8 text-[#1752FF] mr-3 group-hover:text-purple-600 transition-colors"
//                 whileHover={{ scale: 1.2 }}
//                 transition={{ duration: 0.3 }}
//               >
//                 <Award className="h-full w-full" />
//               </motion.div>
//               <span className="text-gray-700 font-medium group-hover:text-gray-900 transition-colors">Expert Guidance</span>
//             </motion.div>
//           </div>
//         </motion.div>

//         {/* Content Container */}
//         <AnimatePresence mode="wait">
//           {currentStep === "preferences" && (
//             <motion.div
//               key="preferences"
//               variants={pageVariants}
//               initial="initial"
//               animate="animate"
//               exit="exit"
//               transition={{ duration: 0.3 }}
//               className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
//             >
//               {/* Left Decorative Section */}
//               <motion.div 
//                 className="hidden lg:block lg:col-span-3"
//                 initial={{ opacity: 0, x: -50 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: 0.3, duration: 0.6 }}
//               >
//                 <div className="space-y-6">
//                   {/* Trust Indicators */}
//                   <motion.div 
//                     className="group bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-gray-100 hover:border-green-300 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-green-100/50"
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ delay: 0.5 }}
//                     whileHover={{ y: -5, scale: 1.02 }}
//                     whileTap={{ scale: 0.98 }}
//                   >
//                     <div className="text-center">
//                       <motion.div 
//                         className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-green-200 transition-all duration-300"
//                         whileHover={{ rotate: 360, scale: 1.1 }}
//                         transition={{ duration: 0.6 }}
//                       >
//                         <CheckCircle className="h-6 w-6 text-green-600 group-hover:text-green-700" />
//                       </motion.div>
//                       <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-green-800 transition-colors">100% Verified</h3>
//                       <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">All properties are RERA verified and legally compliant</p>
//                     </div>
//                   </motion.div>

//                   <motion.div 
//                     className="group bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-gray-100 hover:border-blue-300 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-blue-100/50"
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ delay: 0.6 }}
//                     whileHover={{ y: -5, scale: 1.02 }}
//                     whileTap={{ scale: 0.98 }}
//                   >
//                     <div className="text-center">
//                       <motion.div 
//                         className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-200 transition-all duration-300"
//                         whileHover={{ rotate: -360, scale: 1.1 }}
//                         transition={{ duration: 0.6 }}
//                       >
//                         <Award className="h-6 w-6 text-blue-600 group-hover:text-blue-700" />
//                       </motion.div>
//                       <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-800 transition-colors">Expert Support</h3>
//                       <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">Get personalized guidance from our property experts</p>
//                     </div>
//                   </motion.div>

//                   <motion.div 
//                     className="group bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-gray-100 hover:border-purple-300 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-purple-100/50"
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ delay: 0.7 }}
//                     whileHover={{ y: -5, scale: 1.02 }}
//                     whileTap={{ scale: 0.98 }}
//                   >
//                     <div className="text-center">
//                       <motion.div 
//                         className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-200 transition-all duration-300"
//                         whileHover={{ scale: 1.2, rotate: 360 }}
//                         transition={{ duration: 0.6 }}
//                       >
//                         <Sparkles className="h-6 w-6 text-purple-600 group-hover:text-purple-700" />
//                       </motion.div>
//                       <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-purple-800 transition-colors">AI Matching</h3>
//                       <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">Advanced algorithms find your perfect property match</p>
//                     </div>
//                   </motion.div>

//                   {/* Additional Trust Elements */}
//                   <motion.div 
//                     className="space-y-4 mt-8"
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     transition={{ delay: 0.8 }}
//                   >
//                     <motion.div 
//                       className="flex items-center space-x-3 p-4 bg-white/50 rounded-lg hover:bg-white/70 transition-all duration-300"
//                       whileHover={{ x: 5 }}
//                     >
//                       <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
//                         <Clock className="h-5 w-5 text-orange-600" />
//                       </div>
//                       <span className="text-sm font-medium text-gray-700">24/7 Support</span>
//                     </motion.div>
                    
//                     <motion.div 
//                       className="flex items-center space-x-3 p-4 bg-white/50 rounded-lg hover:bg-white/70 transition-all duration-300"
//                       whileHover={{ x: 5 }}
//                     >
//                       <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
//                         <Shield className="h-5 w-5 text-indigo-600" />
//                       </div>
//                       <span className="text-sm font-medium text-gray-700">Secure Process</span>
//                     </motion.div>
                    
//                     <motion.div 
//                       className="flex items-center space-x-3 p-4 bg-white/50 rounded-lg hover:bg-white/70 transition-all duration-300"
//                       whileHover={{ x: 5 }}
//                     >
//                       <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
//                         <TrendingUp className="h-5 w-5 text-emerald-600" />
//                       </div>
//                       <span className="text-sm font-medium text-gray-700">Market Insights</span>
//                     </motion.div>
//                   </motion.div>

//                   {/* Customer Reviews */}
//                   <motion.div 
//                     className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-2xl border border-yellow-200 mt-8"
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ delay: 1.0 }}
//                     whileHover={{ scale: 1.02, y: -3 }}
//                   >
//                     <div className="text-center">
//                       <div className="flex justify-center mb-3">
//                         {[...Array(5)].map((_, i) => (
//                           <motion.div
//                             key={i}
//                             whileHover={{ scale: 1.2, rotate: 360 }}
//                             transition={{ duration: 0.3, delay: i * 0.1 }}
//                           >
//                             <Star className="h-4 w-4 text-yellow-500 fill-current" />
//                           </motion.div>
//                         ))}
//                       </div>
//                       <p className="text-sm text-gray-700 italic">"Found my dream home in just 2 weeks!"</p>
//                       <p className="text-xs text-gray-500 mt-2">- Happy Customer</p>
//                     </div>
//                   </motion.div>
//                 </div>
//               </motion.div>

//               {/* Main Form Section */}
//               <div className="lg:col-span-6">
//                 <Card className="border-0 shadow-2xl shadow-blue-100/50 w-full bg-white/80 backdrop-blur-sm">
//                   <CardContent className="p-8 md:p-12">
//                     <PropertyPreferenceForm 
//                       initialValues={propertyPreference} 
//                       onSubmit={handlePropertyPreferenceSubmit} 
//                     />
//                   </CardContent>
//                 </Card>
//               </div>

//               {/* Right Process Steps Section */}
//               <motion.div 
//                 className="hidden lg:block lg:col-span-3"
//                 initial={{ opacity: 0, x: 50 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: 0.4, duration: 0.6 }}
//               >
//                 <div className="space-y-6">
//                   {/* Quick Stats */}
//                   <motion.div 
//                     className="bg-gradient-to-r from-emerald-500 to-teal-600 p-4 rounded-2xl text-white text-center"
//                     initial={{ opacity: 0, scale: 0.8 }}
//                     animate={{ opacity: 1, scale: 1 }}
//                     transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
//                     whileHover={{ scale: 1.02, y: -3 }}
//                   >
//                     <motion.div 
//                       className="text-2xl font-bold"
//                       initial={{ scale: 0 }}
//                       animate={{ scale: 1 }}
//                       transition={{ delay: 0.7, type: "spring", stiffness: 300 }}
//                     >
//                       ⚡ Instant
//                     </motion.div>
//                     <div className="text-sm opacity-90">Property Matching</div>
//                   </motion.div>

//                   <motion.h3 
//                     className="text-lg font-semibold text-gray-900 mb-4"
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     transition={{ delay: 0.6 }}
//                   >
//                     How It Works
//                   </motion.h3>
                  
//                   {/* Step 1 */}
//                   <motion.div 
//                     className="group flex items-start space-x-4 p-4 rounded-lg hover:bg-white/50 transition-all duration-300 cursor-pointer"
//                     initial={{ opacity: 0, x: 20 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     transition={{ delay: 0.7 }}
//                     whileHover={{ x: 5 }}
//                   >
//                     <motion.div 
//                       className="w-10 h-10 bg-gradient-to-r from-[#1752FF] to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 group-hover:shadow-lg transition-all duration-300"
//                       whileHover={{ scale: 1.1, rotate: 360 }}
//                       transition={{ duration: 0.5 }}
//                     >
//                       <span className="text-white text-sm font-bold">1</span>
//                     </motion.div>
//                     <div>
//                       <h4 className="font-medium text-gray-900 group-hover:text-[#1752FF] transition-colors">Share Preferences</h4>
//                       <p className="text-sm text-gray-600 mt-1">Tell us your budget, location, and property requirements</p>
//                     </div>
//                   </motion.div>

//                   {/* Step 2 */}
//                   <motion.div 
//                     className="group flex items-start space-x-4 p-4 rounded-lg hover:bg-white/50 transition-all duration-300 cursor-pointer"
//                     initial={{ opacity: 0, x: 20 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     transition={{ delay: 0.8 }}
//                     whileHover={{ x: 5 }}
//                   >
//                     <motion.div 
//                       className="w-10 h-10 bg-gradient-to-r from-[#1752FF] to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 group-hover:shadow-lg transition-all duration-300"
//                       whileHover={{ scale: 1.1, rotate: -360 }}
//                       transition={{ duration: 0.5 }}
//                     >
//                       <span className="text-white text-sm font-bold">2</span>
//                     </motion.div>
//                     <div>
//                       <h4 className="font-medium text-gray-900 group-hover:text-[#1752FF] transition-colors">AI Matching</h4>
//                       <p className="text-sm text-gray-600 mt-1">Our algorithm finds properties that match your criteria</p>
//                     </div>
//                   </motion.div>

//                   {/* Step 3 */}
//                   <motion.div 
//                     className="group flex items-start space-x-4 p-4 rounded-lg hover:bg-white/50 transition-all duration-300 cursor-pointer"
//                     initial={{ opacity: 0, x: 20 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     transition={{ delay: 0.9 }}
//                     whileHover={{ x: 5 }}
//                   >
//                     <motion.div 
//                       className="w-10 h-10 bg-gradient-to-r from-[#1752FF] to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 group-hover:shadow-lg transition-all duration-300"
//                       whileHover={{ scale: 1.1, rotate: 360 }}
//                       transition={{ duration: 0.5 }}
//                     >
//                       <span className="text-white text-sm font-bold">3</span>
//                     </motion.div>
//                     <div>
//                       <h4 className="font-medium text-gray-900 group-hover:text-[#1752FF] transition-colors">Explore Results</h4>
//                       <p className="text-sm text-gray-600 mt-1">Browse through curated property recommendations</p>
//                     </div>
//                   </motion.div>

//                   {/* Step 4 */}
//                   <motion.div 
//                     className="group flex items-start space-x-4 p-4 rounded-lg hover:bg-white/50 transition-all duration-300 cursor-pointer"
//                     initial={{ opacity: 0, x: 20 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     transition={{ delay: 1.0 }}
//                     whileHover={{ x: 5 }}
//                   >
//                     <motion.div 
//                       className="w-10 h-10 bg-gradient-to-r from-[#1752FF] to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 group-hover:shadow-lg transition-all duration-300"
//                       whileHover={{ scale: 1.1, rotate: -360 }}
//                       transition={{ duration: 0.5 }}
//                     >
//                       <span className="text-white text-sm font-bold">4</span>
//                     </motion.div>
//                     <div>
//                       <h4 className="font-medium text-gray-900 group-hover:text-[#1752FF] transition-colors">Expert Guidance</h4>
//                       <p className="text-sm text-gray-600 mt-1">Get expert advice and schedule property visits</p>
//                     </div>
//                   </motion.div>

//                   {/* Statistics */}
//                   <motion.div 
//                     className="bg-gradient-to-r from-[#1752FF] to-purple-600 p-6 rounded-2xl text-white mt-8 hover:shadow-xl transition-all duration-300"
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ delay: 1.1 }}
//                     whileHover={{ scale: 1.02, y: -5 }}
//                   >
//                     <motion.div 
//                       className="text-center"
//                       whileHover={{ scale: 1.05 }}
//                     >
//                       <motion.div 
//                         className="text-3xl font-bold mb-1"
//                         initial={{ scale: 0 }}
//                         animate={{ scale: 1 }}
//                         transition={{ delay: 1.3, type: "spring", stiffness: 200 }}
//                       >
//                         2000+
//                       </motion.div>
//                       <div className="text-sm opacity-90">Properties Available</div>
//                     </motion.div>
//                     <div className="grid grid-cols-2 gap-4 mt-4">
//                       <motion.div 
//                         className="text-center"
//                         whileHover={{ scale: 1.1 }}
//                         transition={{ type: "spring", stiffness: 300 }}
//                       >
//                         <div className="text-lg font-semibold">95%</div>
//                         <div className="text-xs opacity-80">Match Rate</div>
//                       </motion.div>
//                       <motion.div 
//                         className="text-center"
//                         whileHover={{ scale: 1.1 }}
//                         transition={{ type: "spring", stiffness: 300 }}
//                       >
//                         <div className="text-lg font-semibold">24h</div>
//                         <div className="text-xs opacity-80">Response Time</div>
//                       </motion.div>
//                     </div>
//                   </motion.div>

//                   {/* Additional Features */}
//                   <motion.div 
//                     className="space-y-4 mt-8"
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     transition={{ delay: 1.2 }}
//                   >
//                     <motion.div 
//                       className="flex items-center space-x-3 p-3 bg-white/40 rounded-lg hover:bg-white/60 transition-all duration-300"
//                       whileHover={{ x: 5 }}
//                     >
//                       <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
//                         <CheckCircle className="h-5 w-5 text-green-600" />
//                       </div>
//                       <span className="text-sm font-medium text-gray-700">Zero Brokerage</span>
//                     </motion.div>
                    
//                     <motion.div 
//                       className="flex items-center space-x-3 p-3 bg-white/40 rounded-lg hover:bg-white/60 transition-all duration-300"
//                       whileHover={{ x: 5 }}
//                     >
//                       <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
//                         <Home className="h-5 w-5 text-blue-600" />
//                       </div>
//                       <span className="text-sm font-medium text-gray-700">Virtual Tours</span>
//                     </motion.div>
                    
//                     <motion.div 
//                       className="flex items-center space-x-3 p-3 bg-white/40 rounded-lg hover:bg-white/60 transition-all duration-300"
//                       whileHover={{ x: 5 }}
//                     >
//                       <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
//                         <Sparkles className="h-5 w-5 text-purple-600" />
//                       </div>
//                       <span className="text-sm font-medium text-gray-700">Premium Support</span>
//                     </motion.div>
//                   </motion.div>
//                 </div>
//               </motion.div>
//             </motion.div>
//           )}

//           {currentStep === "results" && (
//             <motion.div
//               key="results"
//               variants={pageVariants}
//               initial="initial"
//               animate="animate"
//               exit="exit"
//               transition={{ duration: 0.3 }}
//               className="w-full"
//             >
//               {isLoadingProperties ? (
//                 <div className="text-center py-12">
//                   <Loader2 className="w-8 h-8 mx-auto mb-4 text-blue-600 animate-spin" />
//                   <h3 className="text-lg font-semibold text-gray-900 mb-2">Finding Perfect Properties</h3>
//                   <p className="text-gray-600">We're searching for properties that match your preferences...</p>
//                 </div>
//               ) : (
//                 <PropertyResultsNew 
//                   properties={propertiesData?.properties || []} 
//                   preferences={propertyPreference} 
//                 />
//               )}
              
//               {/* Back button */}
//               <div className="mt-8 text-center">
//                 <button
//                   type="button"
//                   onClick={() => setCurrentStep("preferences")}
//                   className="text-sm text-gray-600 hover:text-[#1752FF] flex items-center mx-auto transition-colors"
//                 >
//                   <ChevronLeft className="h-4 w-4 mr-1" />
//                   Back to modify preferences
//                 </button>
//               </div>
//             </motion.div>
//           )}
//         </AnimatePresence>

//         {/* Next steps prompt */}
//         {currentStep === "preferences" && (
//           <motion.div 
//             className="mt-12 text-center"
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.5 }}
//           >
//             <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
//               <p className="text-gray-700 mb-3">After submitting your preferences, we'll show you all properties that match your criteria!</p>
//               <div className="flex items-center justify-center text-[#1752FF] font-medium">
//                 <span>Next: View Matching Properties</span>
//                 <ArrowRight className="h-4 w-4 ml-2" />
//               </div>
//             </div>
//           </motion.div>
//         )}
//       </div>
//     </div>
//   );
// }