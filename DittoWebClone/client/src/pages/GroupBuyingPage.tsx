import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, ShieldCheck, UserPlus } from "lucide-react";
import Container from "@/components/ui/container";
import { Link } from "wouter";
import { useEffect } from "react";

export default function GroupBuyingPage() {
  // Set page title and meta description when component mounts
  useEffect(() => {
    document.title = "Real Estate Group Buying in Hyderabad | Save More with Relai";
    
    // Set meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Unlock exclusive property deals through group buying. Relai enables better prices, bulk discounts, and coordinated purchases for buyers in Hyderabad.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Unlock exclusive property deals through group buying. Relai enables better prices, bulk discounts, and coordinated purchases for buyers in Hyderabad.';
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
    <div className="pt-32 pb-16 md:pb-24">
      <Container>
        {/* Hero Section */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <h1 className="text-3xl md:text-5xl font-bold mb-4 text-[#1752FF]">
              Property Group Buying
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
              Join forces with other buyers to get better deals on premium properties
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded-md inline-block">
              <p className="text-yellow-700 font-medium">
                Coming Soon! We're building something exciting. Register your interest below to be the first to know when we launch.
              </p>
            </div>
          </motion.div>
          
          <Link href="/contact-us">
            <Button size="lg" className="bg-[#1752FF] hover:bg-blue-700">
              Register Your Interest
            </Button>
          </Link>
        </div>

        {/* What is Group Buying Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-16"
        >
          <div className="bg-white p-6 md:p-10 rounded-xl shadow-md">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-[#2C2C2E]">What is Property Group Buying?</h2>
            
            <p className="text-gray-700 mb-6 text-lg">
              Property Group Buying brings together multiple buyers who want to purchase similar properties in the same project. By combining purchasing power, the group can negotiate with developers.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Users className="h-6 w-6 text-[#1752FF]" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Collective Bargaining</h3>
                  <p className="text-gray-600">Higher volume of units purchased means stronger negotiating position with developers.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Users className="h-6 w-6 text-[#1752FF]" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Better Investment Returns</h3>
                  <p className="text-gray-600">Group buying potentially offers better capital appreciation and investment outcomes.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* How It Works Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-16"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center text-[#2C2C2E]">How Group Buying Works</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-none shadow-lg">
              <CardContent className="p-6">
                <div className="bg-blue-100 w-12 h-12 flex items-center justify-center rounded-full mb-4">
                  <UserPlus className="h-6 w-6 text-[#1752FF]" />
                </div>
                <h3 className="font-bold text-lg mb-2">1. Register Your Interest</h3>
                <p className="text-gray-600">Sign up to join a group based on your property preferences and budget.</p>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-lg">
              <CardContent className="p-6">
                <div className="bg-blue-100 w-12 h-12 flex items-center justify-center rounded-full mb-4">
                  <Users className="h-6 w-6 text-[#1752FF]" />
                </div>
                <h3 className="font-bold text-lg mb-2">2. Group Formation</h3>
                <p className="text-gray-600">We form groups of like-minded buyers with similar property requirements.</p>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-lg">
              <CardContent className="p-6">
                <div className="bg-blue-100 w-12 h-12 flex items-center justify-center rounded-full mb-4">
                  <ShieldCheck className="h-6 w-6 text-[#1752FF]" />
                </div>
                <h3 className="font-bold text-lg mb-2">3. Secure Deal</h3>
                <p className="text-gray-600">relai negotiates with developers to secure the best possible deal for the group.</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Register Interest Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="text-center bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-xl"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-[#2C2C2E]">Be the First to Know</h2>
          <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
            Our Group Buying feature is coming soon. Register your interest to get early access and exclusive updates on upcoming group buying opportunities.
          </p>
          
          <Link href="/contact-us">
            <Button size="lg" className="bg-[#1752FF] hover:bg-blue-700">
              Register Your Interest
            </Button>
          </Link>
          
          <p className="mt-4 text-sm text-gray-500">
            We'll notify you when group buying launches, with no obligation to participate.
          </p>
        </motion.div>
      </Container>
    </div>
  );
}