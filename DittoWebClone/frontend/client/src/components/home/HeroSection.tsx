import { Link } from "wouter";
import Container from "@/components/ui/container";
import CallButton from "@/components/shared/CallButton";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Calendar, Home } from "lucide-react";
import realEstateAnimation from "@/assets/images/real-estate-animation.gif";
import realEstateAnimationSquare from "@/assets/images/new-real-estate-animation-square.gif";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="pt-24 md:pt-32 pb-12 md:pb-16">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-4 items-start">
          {/* Left Column - Text Content */}
          <div className="col-span-1 md:col-span-5 text-center md:text-left px-4 md:px-0 md:pr-8">
            {/* Certifications Bar */}
            <div className="flex flex-wrap items-center justify-center md:justify-start mb-6 md:mb-10 gap-4">
              <div className="flex items-center">
                <img 
                  src="/rera-logo.png" 
                  alt="RERA Certification" 
                  className="h-20 md:h-24 w-auto"
                />
              </div>
              <div className="flex items-center">
                <img 
                  src="/iso-logo.png" 
                  alt="ISO Certification" 
                  className="h-20 md:h-24 w-auto"
                />
              </div>
            </div>
            
            {/* Hero Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 md:mb-8 leading-tight tracking-tight">
              From Hello to Home,<br className="hidden md:block" /> relai on us
            </h1>
            
            <p className="text-lg text-gray-700 mb-8 max-w-md mx-auto md:mx-0">
              Property transactions now simplified through expert guidance and personalized service from the  best real estate consutlants in Hyderabad.
            </p>
            
            {/* CTA Button - centered on mobile, left-aligned on desktop */}
            <div className="flex justify-center md:justify-start">
              <Link href="/property-wizard">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button className="px-6 py-3 text-base rounded-full group bg-[#1752FF] hover:bg-[#103cc9]">
                    <Search className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                    Find Your Suitable Property
                  </Button>
                </motion.div>
              </Link>
            </div>
          </div>
          
          {/* Right Column - Real Estate Animation */}
          <div className="col-span-1 md:col-span-7 flex justify-center items-center px-4 md:px-0">
            {/* Mobile version (square) - only shown on mobile */}
            <img 
              src={realEstateAnimationSquare} 
              alt="Real estate services animation" 
              className="md:hidden rounded-lg w-full aspect-square object-cover"
            />
            {/* Desktop version (rectangle) - only shown on desktop and larger */}
            <img 
              src={realEstateAnimation} 
              alt="Real estate services animation" 
              className="hidden md:block rounded-lg w-full h-auto object-cover"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
