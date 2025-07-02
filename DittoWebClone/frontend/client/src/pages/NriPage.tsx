import { motion } from "framer-motion";
import { Link } from "wouter";
import { useEffect } from "react";
import {
  Check,
  ArrowRight,
  Globe,
  Landmark,
  Banknote,
  Shield,
  CalendarClock,
  FileText,
  Info,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Container from "@/components/ui/container";
import WhatsAppButton from "@/components/layout/WhatsAppButton";

export default function NriPage() {
  // Set page title and meta description when component mounts
  useEffect(() => {
    document.title = "NRI Real Estate Services in Hyderabad | Legal, Tax & Property Support – Relai";
    
    // Set meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Relai helps NRIs invest in Hyderabad real estate with ease. Get assistance with documentation, property management, resale, tax advisory, and legal compliance.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Relai helps NRIs invest in Hyderabad real estate with ease. Get assistance with documentation, property management, resale, tax advisory, and legal compliance.';
      document.getElementsByTagName('head')[0].appendChild(meta);
    }
    
    // Restore title when component unmounts
    return () => {
      document.title = "Genuine, Smarter, and End to End Real Estate Services in Hyderabad";
      // Restore original meta description
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', 'Discover smarter real estate with Relai. Buy RERA verified properties with expert real estate guidance—all in one place');
      }
    };
  }, []);

  return (
    <div className="pt-24 pb-20">
      <Container>
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <div className="mb-8 flex justify-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="rounded-full bg-[#1752FF] bg-opacity-10 p-5"
            >
              <Globe className="h-12 w-12 text-[#1752FF]" />
            </motion.div>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold mb-6">
            NRI Property Services in Hyderabad
          </h1>
          <p className="text-gray-600 max-w-3xl mx-auto mb-8 text-lg">
            Expert end-to-end property solutions tailored for Non-Resident
            Indians. We handle everything from property selection to legal
            documentation, maintenance, and rental management.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact-us" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="bg-[#1752FF] hover:bg-[#103cc9] w-full"
              >
                Schedule a Consultation
              </Button>
            </Link>
            <WhatsAppButton
              fixed={false}
              size="lg"
              className="w-full sm:w-auto"
            >
              Chat on WhatsApp
            </WhatsAppButton>
          </div>
        </motion.div>

        {/* Key Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-20"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
            How relai Helps NRIs
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-[#F2F2F2] p-6 rounded-xl"
            >
              <div className="bg-[#1752FF] rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Landmark className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Property Selection</h3>
              <p className="text-gray-600 mb-4">
                Virtual property tours, detailed market analysis, and
                personalized recommendations based on your investment goals and
                preferences.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-[#1752FF] mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">
                    Virtual property tours via video calls
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-[#1752FF] mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">
                    Detailed neighborhood analysis
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-[#1752FF] mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">
                    Property portfolio optimization services
                  </span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-[#F2F2F2] p-6 rounded-xl"
            >
              <div className="bg-[#1752FF] rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">
                Documentation & Legal
              </h3>
              <p className="text-gray-600 mb-4">
                Complete assistance with all legal documentation, verification,
                and compliance with FEMA regulations for NRI property purchases.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-[#1752FF] mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">FEMA compliance assistance</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-[#1752FF] mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Power of Attorney services</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-[#1752FF] mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">
                    Title verification & legal due diligence
                  </span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-[#F2F2F2] p-6 rounded-xl"
            >
              <div className="bg-[#1752FF] rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Banknote className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">
                Financial & Tax Services
              </h3>
              <p className="text-gray-600 mb-4">
                We offer expert real estate tax advice, including guidance on
                NRI taxation, repatriation of funds, FEMA compliance, and home
                loan facilitation.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-[#1752FF] mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">NRI taxation guidance</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-[#1752FF] mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Repatriation assistance</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-[#1752FF] mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">
                    Home loan facilitation for NRIs
                  </span>
                </li>
              </ul>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-[#F2F2F2] p-6 rounded-xl"
            >
              <div className="bg-[#1752FF] rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">
                Property Management
              </h3>
              <p className="text-gray-600 mb-4">
                Comprehensive property management services including
                maintenance, tenant screening, rent collection, and regular
                property inspections.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-[#1752FF] mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Regular property maintenance</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-[#1752FF] mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">
                    Tenant management & rent collection
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-[#1752FF] mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Quarterly inspection reports</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-[#F2F2F2] p-6 rounded-xl"
            >
              <div className="bg-[#1752FF] rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <CalendarClock className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Resale Assistance</h3>
              <p className="text-gray-600 mb-4">
                Get expert support for residential and commercial property
                valuation, marketing, buyer negotiations, and documentation when
                you're ready to sell your property.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-[#1752FF] mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">
                    Market-based property valuation
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-[#1752FF] mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Marketing & buyer sourcing</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-[#1752FF] mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">
                    Sale proceeds repatriation assistance
                  </span>
                </li>
              </ul>
            </motion.div>
          </div>
        </motion.div>

        {/* Process Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-20"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
            Our NRI Service Process
          </h2>

          <div className="relative">
            {/* Connection Line */}
            <div className="absolute left-[21px] md:left-1/2 top-10 bottom-10 w-0.5 bg-[#1752FF] hidden md:block" />

            {/* Steps */}
            <div className="space-y-12 relative">
              {/* Step 1 */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex flex-col md:flex-row gap-6 md:gap-10 items-start relative"
              >
                <div className="flex-shrink-0 z-10 flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-[#1752FF] text-white flex items-center justify-center font-bold text-lg mb-2">
                    1
                  </div>
                  <div className="hidden md:block h-full w-0.5 bg-gray-300" />
                </div>
                <div className="flex-grow bg-white p-6 rounded-lg shadow-md ml-6 md:ml-0 relative md:w-1/2">
                  <h3 className="text-xl font-semibold mb-3">
                    Initial Consultation
                  </h3>
                  <p className="text-gray-600">
                    Schedule a virtual consultation to discuss your property
                    requirements, investment goals, budget, and timeline. Our
                    NRI specialists will guide you through the entire process.
                  </p>
                </div>
                <div className="hidden md:block w-1/2" />
              </motion.div>

              {/* Step 2 */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-col md:flex-row gap-6 md:gap-10 items-start relative"
              >
                <div className="flex-shrink-0 z-10 flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-[#1752FF] text-white flex items-center justify-center font-bold text-lg mb-2">
                    2
                  </div>
                </div>
                <div className="hidden md:block w-1/2" />
                <div className="flex-grow bg-white p-6 rounded-lg shadow-md ml-6 md:ml-0 md:w-1/2">
                  <h3 className="text-xl font-semibold mb-3">
                    Property Shortlisting
                  </h3>
                  <p className="text-gray-600">
                    Based on your requirements, we shortlist properties that
                    match your criteria. We conduct virtual property tours and
                    provide detailed analysis reports of each property.
                  </p>
                </div>
              </motion.div>

              {/* Step 3 */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col md:flex-row gap-6 md:gap-10 items-start relative"
              >
                <div className="flex-shrink-0 z-10 flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-[#1752FF] text-white flex items-center justify-center font-bold text-lg mb-2">
                    3
                  </div>
                </div>
                <div className="flex-grow bg-white p-6 rounded-lg shadow-md ml-6 md:ml-0 md:w-1/2">
                  <h3 className="text-xl font-semibold mb-3">
                    Legal Due Diligence
                  </h3>
                  <p className="text-gray-600">
                    Our legal team verifies all property documents, ensures FEMA
                    compliance, and handles all legal paperwork. We also assist
                    with Power of Attorney if required.
                  </p>
                </div>
                <div className="hidden md:block w-1/2" />
              </motion.div>

              {/* Step 4 */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex flex-col md:flex-row gap-6 md:gap-10 items-start relative"
              >
                <div className="flex-shrink-0 z-10 flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-[#1752FF] text-white flex items-center justify-center font-bold text-lg mb-2">
                    4
                  </div>
                </div>
                <div className="hidden md:block w-1/2" />
                <div className="flex-grow bg-white p-6 rounded-lg shadow-md ml-6 md:ml-0 md:w-1/2">
                  <h3 className="text-xl font-semibold mb-3">
                    Purchase & Registration
                  </h3>
                  <p className="text-gray-600">
                    We handle negotiations, payment facilitation, and complete
                    the registration process. Our team ensures all documentation
                    is properly executed even in your absence.
                  </p>
                </div>
              </motion.div>

              {/* Step 5 */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="flex flex-col md:flex-row gap-6 md:gap-10 items-start relative"
              >
                <div className="flex-shrink-0 z-10 flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-[#1752FF] text-white flex items-center justify-center font-bold text-lg mb-2">
                    5
                  </div>
                </div>
                <div className="flex-grow bg-white p-6 rounded-lg shadow-md ml-6 md:ml-0 md:w-1/2">
                  <h3 className="text-xl font-semibold mb-3">
                    Ongoing Management
                  </h3>
                  <p className="text-gray-600">
                    After purchase, we provide comprehensive property management
                    services including maintenance, tenant management, and
                    regular updates on your investment.
                  </p>
                </div>
                <div className="hidden md:block w-1/2" />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Investment Options Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-20"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
            NRI Investment Options
          </h2>

          <Tabs defaultValue="residential" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="residential">
                Residential Properties
              </TabsTrigger>
              <TabsTrigger value="commercial">
                Commercial Properties
              </TabsTrigger>
              <TabsTrigger value="plots">Premium Plots</TabsTrigger>
            </TabsList>

            <TabsContent value="residential" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="shadow-md">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-4">
                      Luxury Apartments
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Premium apartments in gated communities with world-class
                      amenities and security.
                    </p>
                    <ul className="space-y-2 mb-6">
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-[#1752FF] mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">
                          High rental yield: 3-4% annually
                        </span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-[#1752FF] mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">
                          Average appreciation: 5-8% annually
                        </span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-[#1752FF] mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">
                          Price range: ₹70 Lakhs - ₹3 Cr
                        </span>
                      </li>
                    </ul>
                    <Button className="w-full" variant="outline">
                      Explore Options <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>

                <Card className="shadow-md">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-4">
                      Premium Villas
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Spacious independent villas in secured layouts with
                      exclusive amenities.
                    </p>
                    <ul className="space-y-2 mb-6">
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-[#1752FF] mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">
                          High rental yield: 2.5-3.5% annually
                        </span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-[#1752FF] mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">
                          Average appreciation: 7-10% annually
                        </span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-[#1752FF] mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">
                          Price range: ₹1.5 Cr - ₹5 Cr
                        </span>
                      </li>
                    </ul>
                    <Button className="w-full" variant="outline">
                      Explore Options <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>

                <Card className="shadow-md">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-4">
                      Serviced Apartments
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Fully furnished apartments with hotel-like services and
                      amenities.
                    </p>
                    <ul className="space-y-2 mb-6">
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-[#1752FF] mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">
                          High rental yield: 4-6% annually
                        </span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-[#1752FF] mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">
                          Average appreciation: 5-7% annually
                        </span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-[#1752FF] mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">
                          Price range: ₹80 Lakhs - ₹1.8 Cr
                        </span>
                      </li>
                    </ul>
                    <Button className="w-full" variant="outline">
                      Explore Options <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="commercial" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="shadow-md">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-4">
                      Office Spaces
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Premium office spaces in IT corridors and business
                      districts.
                    </p>
                    <ul className="space-y-2 mb-6">
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-[#1752FF] mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">
                          High rental yield: 6-8% annually
                        </span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-[#1752FF] mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">
                          Average appreciation: 8-12% annually
                        </span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-[#1752FF] mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">
                          Price range: ₹1 Cr - ₹5 Cr
                        </span>
                      </li>
                    </ul>
                    <Button className="w-full" variant="outline">
                      Explore Options <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>

                <Card className="shadow-md">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-4">
                      Retail Spaces
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Commercial shops and retail spaces in high-footfall areas.
                    </p>
                    <ul className="space-y-2 mb-6">
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-[#1752FF] mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">
                          High rental yield: 7-9% annually
                        </span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-[#1752FF] mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">
                          Average appreciation: 9-14% annually
                        </span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-[#1752FF] mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">
                          Price range: ₹80 Lakhs - ₹3 Cr
                        </span>
                      </li>
                    </ul>
                    <Button className="w-full" variant="outline">
                      Explore Options <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>

                <Card className="shadow-md">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-4">
                      Industrial Warehouses
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Strategically located warehouses near industrial corridors
                      and highways.
                    </p>
                    <ul className="space-y-2 mb-6">
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-[#1752FF] mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">
                          High rental yield: 8-10% annually
                        </span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-[#1752FF] mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">
                          Average appreciation: 10-15% annually
                        </span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-[#1752FF] mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">
                          Price range: ₹1.5 Cr - ₹8 Cr
                        </span>
                      </li>
                    </ul>
                    <Button className="w-full" variant="outline">
                      Explore Options <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="plots" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="shadow-md">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-4">
                      Residential Plots
                    </h3>
                    <p className="text-gray-600 mb-4">
                      HMDA/DTCP approved plots in gated communities with
                      amenities.
                    </p>
                    <ul className="space-y-2 mb-6">
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-[#1752FF] mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">
                          Average appreciation: 12-18% annually
                        </span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-[#1752FF] mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">Low maintenance costs</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-[#1752FF] mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">
                          Price range: ₹25 Lakhs - ₹80 Lakhs
                        </span>
                      </li>
                    </ul>
                    <Button className="w-full" variant="outline">
                      Explore Options <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>

                <Card className="shadow-md">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-4">
                      Commercial Plots
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Plots zoned for commercial development in high-growth
                      areas.
                    </p>
                    <ul className="space-y-2 mb-6">
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-[#1752FF] mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">
                          Average appreciation: 15-20% annually
                        </span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-[#1752FF] mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">
                          Development potential for businesses
                        </span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-[#1752FF] mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">
                          Price range: ₹70 Lakhs - ₹2 Cr
                        </span>
                      </li>
                    </ul>
                    <Button className="w-full" variant="outline">
                      Explore Options <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>

                <Card className="shadow-md">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Villa Plots</h3>
                    <p className="text-gray-600 mb-4">
                      Premium plots in villa communities with infrastructure and
                      amenities.
                    </p>
                    <ul className="space-y-2 mb-6">
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-[#1752FF] mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">
                          Average appreciation: 14-18% annually
                        </span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-[#1752FF] mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">
                          Ready infrastructure & amenities
                        </span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-[#1752FF] mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">
                          Price range: ₹40 Lakhs - ₹1.2 Cr
                        </span>
                      </li>
                    </ul>
                    <Button className="w-full" variant="outline">
                      Explore Options <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mb-16"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
            Frequently Asked Questions
          </h2>

          <div className="max-w-3xl mx-auto bg-[#F2F2F2] rounded-lg p-6">
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem
                value="item-1"
                className="bg-white rounded-lg overflow-hidden border"
              >
                <AccordionTrigger className="px-4 py-4 hover:no-underline">
                  <div className="flex items-center">
                    <Info className="h-5 w-5 text-[#1752FF] mr-3" />
                    <span>Can NRIs buy property in India?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 pt-0">
                  Yes, NRIs can purchase residential or commercial properties in
                  India. However, they cannot purchase agricultural land,
                  plantation properties, or farmhouses. All transactions must
                  comply with FEMA (Foreign Exchange Management Act)
                  regulations.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-2"
                className="bg-white rounded-lg overflow-hidden border"
              >
                <AccordionTrigger className="px-4 py-4 hover:no-underline">
                  <div className="flex items-center">
                    <Info className="h-5 w-5 text-[#1752FF] mr-3" />
                    <span>What documents do NRIs need to buy property?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 pt-0">
                  NRIs need a valid passport, PAN card, visa or resident permit,
                  NRE/NRO account details, and passport-sized photographs.
                  Additional documents like Power of Attorney may be required if
                  the NRI cannot be present during the transaction process.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-3"
                className="bg-white rounded-lg overflow-hidden border"
              >
                <AccordionTrigger className="px-4 py-4 hover:no-underline">
                  <div className="flex items-center">
                    <Info className="h-5 w-5 text-[#1752FF] mr-3" />
                    <span>Can NRIs get home loans in India?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 pt-0">
                  Yes, NRIs can avail home loans from Indian banks and financial
                  institutions. The loan amount is generally up to 80% of the
                  property value. NRIs need to provide income proof, bank
                  statements, and tax returns along with standard property
                  documents.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-4"
                className="bg-white rounded-lg overflow-hidden border"
              >
                <AccordionTrigger className="px-4 py-4 hover:no-underline">
                  <div className="flex items-center">
                    <Info className="h-5 w-5 text-[#1752FF] mr-3" />
                    <span>What taxes are applicable for NRIs on property?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 pt-0">
                  NRIs need to pay property tax, wealth tax (if applicable), and
                  income tax on rental income. For property sales, capital gains
                  tax is applicable (short-term if sold within 2 years or
                  long-term if held longer). TDS of 20% is deducted on the sale
                  of property by an NRI.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-5"
                className="bg-white rounded-lg overflow-hidden border"
              >
                <AccordionTrigger className="px-4 py-4 hover:no-underline">
                  <div className="flex items-center">
                    <Info className="h-5 w-5 text-[#1752FF] mr-3" />
                    <span>
                      How can NRIs repatriate funds from property sale?
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 pt-0">
                  NRIs can repatriate the sale proceeds of up to two residential
                  properties with proper documentation. The amount that can be
                  repatriated depends on whether the property was purchased
                  using repatriable or non-repatriable funds. Our experts
                  provide complete assistance with the repatriation process.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="rounded-2xl bg-gradient-to-r from-[#1752FF] to-[#3672ff] p-8 text-white shadow-xl"
        >
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Invest in Indian Real Estate?
            </h2>
            <p className="mb-8">
              Our NRI property specialists are here to guide you every step of
              the way. Schedule a consultation today to discuss your investment
              goals and explore premium property options.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact-us" className="w-full sm:w-auto">
                <Button className="bg-white text-[#1752FF] hover:bg-gray-100 flex items-center justify-center w-full">
                  <Phone className="mr-2 h-4 w-4" />
                  Schedule a Free Consultation
                </Button>
              </Link>
              <WhatsAppButton
                fixed={false}
                
                className="bg-white text-[#1752FF] hover:bg-gray-100 w-full sm:w-auto"
              >
                Contact on WhatsApp
              </WhatsAppButton>
            </div>
          </div>
        </motion.div>
      </Container>
    </div>
  );
}
