import React, { useEffect } from 'react';
import Container from "@/components/ui/container";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { 
  Gift, Clock, UserPlus, Search, Home, Truck, 
  FileText, Wrench, Zap, AlertCircle, CheckCircle 
} from "lucide-react";

interface BenefitDetailProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  details: string[];
  color: string;
  reverse?: boolean;
}

const BenefitDetail: React.FC<BenefitDetailProps> = ({ 
  icon, title, description, details, color, reverse = false 
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} gap-8 py-12 border-b border-gray-200`}
    >
      <div className="md:w-1/3 flex justify-center">
        <div className={`${color} rounded-2xl p-8 w-full max-w-[250px] flex items-center justify-center shadow-lg`}>
          <div className="rounded-full bg-white/20 p-5">
            {icon}
          </div>
        </div>
      </div>
      <div className="md:w-2/3">
        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{title}</h3>
        <p className="text-xl text-gray-700 mb-6">{description}</p>
        <div className="space-y-3">
          {details.map((detail, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-gray-600">{detail}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default function BenefitsPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title> Why Choose Relai | Real Estate Buying Benefits You Can Trust</title>
        <meta
          name="description"
          content="See how Relai adds value to your real estate journey—verified listings, expert guidance, resale guarantee, NRI services, and tech-driven buying tools."
        />
      </Helmet>

      <div className="pt-24 bg-blue-50">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Exclusive <span className="text-[#1752FF]">Relai Benefits</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              At Relai, we go beyond just helping you find the perfect property. 
              We've curated an exceptional package of benefits to enhance your 
              property buying experience.
            </p>
            <div className="flex justify-center">
              <motion.div
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                className="bg-[#1752FF] text-white px-6 py-3 rounded-full inline-flex items-center gap-2 shadow-lg"
              >
                <AlertCircle className="h-5 w-5" />
                <span className="font-semibold">Worth over ₹3 Lakhs in total value</span>
              </motion.div>
            </div>
          </motion.div>
        </Container>
      </div>

      <Container className="py-12">
        <BenefitDetail
          icon={<Gift className="h-16 w-16 text-white" />}
          title="Legal & Compliance Support"
          description="₹10,000 worth legal and compliance services completely free"
          details={[
            "Comprehensive legal verification of property documents",
            "Support throughout the entire buying process",
            "Expert legal advisors to handle documentation",
            "Verification of property titles and encumbrances",
            "Assistance with legal paperwork and formalities"
          ]}
          color="bg-gradient-to-br from-blue-500 to-blue-700"
        />
        
        <BenefitDetail
          icon={<Clock className="h-16 w-16 text-white" />}
          title="First EMI On Us"
          description="We'll cover your first EMI payment up to ₹1 Lac"
          details={[
            "Relai pays your first EMI up to ₹1 Lac",
            "Applicable for properties purchased through Relai",
            "No hidden conditions or fine print",
            "Direct payment to your lender",
            "Helps ease the initial financial burden after purchase"
          ]}
          color="bg-gradient-to-br from-purple-500 to-purple-700"
          reverse
        />
        
        <BenefitDetail
          icon={<UserPlus className="h-16 w-16 text-white" />}
          title="Loyalty Discount"
          description="Get ₹1 Lac discount on your next property purchase"
          details={[
            "Automatic ₹1 Lac discount on your second purchase through Relai",
            "No expiration date on the loyalty benefit",
            "Transferable to immediate family members",
            "Stackable with ongoing promotional offers",
            "Simple redemption process with no paperwork"
          ]}
          color="bg-gradient-to-br from-green-500 to-green-700"
        />
        
        <BenefitDetail
          icon={<Home className="h-16 w-16 text-white" />}
          title="Interior Design Discounts"
          description="30% off on interior design services from our partner companies"
          details={[
            "Exclusive 30% discount on total interior costs",
            "Access to premium interior design partners",
            "Customized design options for your new property",
            "Professional consultation included",
            "Quality assurance and warranty on all services"
          ]}
          color="bg-gradient-to-br from-pink-500 to-pink-700"
          reverse
        />
        
        <BenefitDetail
          icon={<Zap className="h-16 w-16 text-white" />}
          title="Smart Home Technology"
          description="We cover 30% of your home automation costs"
          details={[
            "30% off on smart home automation systems",
            "Includes smart lighting, security, and climate control",
            "Professional installation by certified technicians",
            "Integration with popular voice assistants",
            "Ongoing technical support for smart devices"
          ]}
          color="bg-gradient-to-br from-amber-500 to-amber-700"
        />
        
        <BenefitDetail
          icon={<Wrench className="h-16 w-16 text-white" />}
          title="Premium Home Services"
          description="Free 24/7 home services for 3 months after purchase"
          details={[
            "Round-the-clock plumbing services",
            "Electrical repairs and maintenance",
            "Emergency response within 2 hours",
            "Scheduled maintenance visits",
            "Unlimited service calls during the 3-month period"
          ]}
          color="bg-gradient-to-br from-cyan-500 to-cyan-700"
          reverse
        />
        
        <BenefitDetail
          icon={<Truck className="h-16 w-16 text-white" />}
          title="Moving Assistance"
          description="Home moving costs covered by Relai"
          details={[
            "Professional packing and moving services",
            "Transportation of all household items",
            "Insurance coverage during the move",
            "Unpacking assistance at your new home",
            "Special handling for fragile and valuable items"
          ]}
          color="bg-gradient-to-br from-indigo-500 to-indigo-700"
        />
        
        <BenefitDetail
          icon={<FileText className="h-16 w-16 text-white" />}
          title="Registration Support"
          description="Documentation costs covered up to ₹20,000"
          details={[
            "Property registration charges covered up to ₹20,000",
            "Assistance with stamp duty and registration procedures",
            "Documentation preparation by legal experts",
            "Representation during the registration process",
            "Digital copies of all registered documents provided"
          ]}
          color="bg-gradient-to-br from-red-500 to-red-700"
          reverse
        />
        
        <BenefitDetail
          icon={<Search className="h-16 w-16 text-white" />}
          title="Referral Rewards"
          description="Refer a friend and get ₹1 Lac off your next purchase"
          details={[
            "₹1 Lac referral credits when your friend buys property",
            "No limit on the number of referrals",
            "Credits can be accumulated for multiple purchases",
            "Simple referral process via email or phone number",
            "Credits valid for 3 years from date of referral"
          ]}
          color="bg-gradient-to-br from-emerald-500 to-emerald-700"
        />
      </Container>

      <div className="bg-gray-50 py-16">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Ready to Unlock These Benefits?
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
              Contact us today to learn more about our exclusive benefits package and start your 
              property journey with Relai.
            </p>
            <a 
              href="https://wa.me/918881088890" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block bg-[#1752FF] hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-full transition-colors duration-300 text-lg shadow-lg"
            >
              Speak to a Property Expert
            </a>
          </motion.div>
        </Container>
      </div>
    </>
  );
}