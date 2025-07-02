// import { Switch, Route, useLocation } from "wouter";
// import { QueryClientProvider } from "@tanstack/react-query";
// import { queryClient } from "./lib/queryClient";
// import { Toaster } from "@/components/ui/toaster";
// import { useEffect } from "react";
// import { initAntiScraping } from "./lib/antiScraping";
// import NotFound from "@/pages/not-found";
// import HomePage from "@/pages/HomePage";
// import AboutUsPage from "@/pages/AboutUsPage";
// import PropertyFormPage from "@/pages/PropertyFormPage";
// // import PropertyWizardPage from "@/pages/PropertyWizardPage";
// import PropertyDetailPageNew from "@/pages/PropertyDetailPageNew";
// import GroupBuyingPage from "@/pages/GroupBuyingPage";
// import ContactUsPage from "@/pages/ContactUsPage";
// import TermsPage from "@/pages/TermsPage";
// import PrivacyPolicyPage from "@/pages/PrivacyPolicyPage";
// import FaqPage from "@/pages/FaqPage";
// import AIChatbotPage from "@/pages/AIChatbotPage";
// import BenefitsPage from "@/pages/BenefitsPage";
// import Header from "@/components/layout/Header";
// import Footer from "@/components/layout/Footer";
// import WhatsAppButton from "@/components/layout/WhatsAppButton";
// import FloatingChatbot from "@/components/layout/FloatingChatbot";
// import ScrollToTop from "@/components/layout/ScrollToTop";

// // Property Pages
// import ResidentialPage from "@/pages/properties/ResidentialPage";
// import CommercialPage from "@/pages/properties/CommercialPage";
// import PlotsPage from "@/pages/properties/PlotsPage";
// import AllPropertiesPage from "@/pages/AllPropertiesPage";

// // NRI Page
// import NriPage from "@/pages/NriPage";

// // Tools Pages
// import LoanCalculatorPage from "@/pages/tools/LoanCalculatorPage";
// import AreaConverterPage from "@/pages/tools/AreaConverterPage";

// // Test Pages
// import FaviconTestPage from "@/pages/FaviconTestPage";
// import PropertyImageTestPage from "@/pages/PropertyImageTestPage";
// import DatabaseInspectionPage from "@/pages/DatabaseInspectionPage";

// // Property Comparison Page
// import PropertyComparisonPage from "@/pages/PropertyComparisonTable";
// import PropertyComparisonSimple from "@/pages/PropertyComparisonSimple";

// // Blog Pages
// import BlogPage from "@/pages/BlogPage";
// import BlogPostPage from "@/pages/BlogPostPage";
// import AdminLoginPage from "@/pages/admin/AdminLoginPage";
// import AdminBlogPage from "@/pages/admin/AdminBlogPage";

// // Agent Pages
// import AgentLoginPage from "@/pages/AgentLoginPage";
// import AgentWizardPage from "@/pages/AgentWizardPage";
// import PropertyResultsPage from "@/pages/PropertyResultsPage";

// const PropertyRateAnalyzerPage = () => (
//   <div className="pt-24 pb-20 text-center">
//     <h1 className="text-3xl font-bold mb-4">Property Rate Analyzer</h1>
//     <p className="text-gray-600">Coming soon! This tool will help you analyze property rates in different areas.</p>
//   </div>
// );

// function Router() {
//   return (
//     <Switch>
//       <Route path="/" component={HomePage} />
//       <Route path="/about-us" component={AboutUsPage} />
//       <Route path="/property-form" component={PropertyFormPage} />
//       {/* <Route path="/property-wizard" component={PropertyWizardPage} /> */}
//       <Route path="/property/:id" component={PropertyDetailPageNew} />
      
//       {/* Property Pages */}
//       <Route path="/properties" component={AllPropertiesPage} />
//       <Route path="/properties/all" component={AllPropertiesPage} />
//       <Route path="/properties/residential-properties" component={ResidentialPage} />
//       <Route path="/properties/commercial-properties" component={CommercialPage} />
//       <Route path="/properties/plots" component={PlotsPage} />
      
//       {/* NRI Page */}
//       <Route path="/nri-services" component={NriPage} />
      
//       {/* Group Buying Page */}
//       <Route path="/group-buying" component={GroupBuyingPage} />
      
//       {/* Contact Us Page */}
//       <Route path="/contact-us" component={ContactUsPage} />
      
//       {/* Tools Pages */}
//       <Route path="/tools/loan-calculator" component={LoanCalculatorPage} />
//       <Route path="/tools/comparison-tool" component={PropertyComparisonPage} />
//       <Route path="/tools/area-converter" component={AreaConverterPage} />
//       <Route path="/tools/rate-analyzer" component={PropertyRateAnalyzerPage} />
      
//       {/* Property Comparison Page */}
//       <Route path="/compare" component={PropertyComparisonPage} />
//       <Route path="/compare-properties" component={PropertyComparisonPage} />
//       <Route path="/compare-simple" component={PropertyComparisonSimple} />
      
//       {/* AI Assistant Page */}
//       <Route path="/ai-assistant" component={AIChatbotPage} />
      
//       {/* Benefits Page */}
//       <Route path="/benefits" component={BenefitsPage} />
      
//       {/* Blog Pages */}
//       <Route path="/blog" component={BlogPage} />
//       <Route path="/blog/:slug" component={BlogPostPage} />
      
//       {/* Admin Pages (hidden from navigation) */}
//       <Route path="/admin/login" component={AdminLoginPage} />
//       <Route path="/admin/blog" component={AdminBlogPage} />
      
//       {/* Agent Pages (hidden from navigation) */}
//       <Route path="/agent/login" component={AgentLoginPage} />
//       <Route path="/agent/wizard" component={AgentWizardPage} />
//       <Route path="/agent/results" component={PropertyResultsPage} />
      
//       {/* Legal Pages */}
//       <Route path="/terms-and-conditions" component={TermsPage} />
//       <Route path="/privacy-policy" component={PrivacyPolicyPage} />
//       <Route path="/faqs" component={FaqPage} />
//       <Route path="/faq" component={FaqPage} />
      
//       {/* Test Pages */}
//       <Route path="/favicon-test" component={FaviconTestPage} />
//       <Route path="/property-image-test" component={PropertyImageTestPage} />
//       <Route path="/database-inspection" component={DatabaseInspectionPage} />
      
//       <Route component={NotFound} />
//     </Switch>
//   );
// }

// function App() {
//   const [location] = useLocation();
//   const isAgentPage = location === "/agent/login" || location === "/agent/wizard" || location === "/agent/results";

//   return (
//     <QueryClientProvider client={queryClient}>
//       <div className="flex flex-col min-h-screen">
//         <ScrollToTop /> {/* Add ScrollToTop component here */}
//         <Header />
//         <main className="flex-grow"> {/* Removed fixed padding for flexible layouts */}
//           <Router />
//         </main>
//         <Footer />
//         {!isAgentPage && <FloatingChatbot />}
//         {!isAgentPage && <WhatsAppButton />}
//       </div>
//       <Toaster />
//     </QueryClientProvider>
//   );
// }

// export default App;
