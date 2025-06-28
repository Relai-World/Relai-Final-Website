import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { ChevronDown, Menu, Bot, Home, Building2, Building, MapPin, Calculator, BarChart3, MoveHorizontal, Globe, Search, Users, Mail, Scale, BookOpen } from "lucide-react";
import { useMobile } from "@/hooks/use-mobile";
import { RelaiLogo } from "@/assets/svg/logo";
import Container from "../ui/container";
import { Sheet, SheetTrigger, SheetContent, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { NAVIGATION } from "@/lib/constants";

export default function Header() {
  const isMobile = useMobile();
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});
  const [visible] = useState(true);
  const headerRef = useRef<HTMLElement>(null);
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [location] = useLocation();
  
  // Function to scroll to the AI chatbot section
  const scrollToAIChatbot = () => {
    // Only run this on homepage
    if (location === '/') {
      const chatbotSection = document.getElementById('property-chatbot-section');
      if (chatbotSection) {
        chatbotSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // If not on homepage, navigate to homepage and then to chatbot section
      window.location.href = '/#property-chatbot-section';
    }
  };
  
  useEffect(() => {
    // Add click event listener to close dropdowns when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      for (const key in openDropdowns) {
        if (openDropdowns[key] && dropdownRefs.current[key] && !dropdownRefs.current[key]!.contains(event.target as Node)) {
          closeDropdown(key);
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdowns]);

  const toggleDropdown = (key: string) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const closeDropdown = (key: string) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [key]: false
    }));
  };

  return (
    <header 
      ref={headerRef}
      className="fixed w-full top-0 z-50 bg-white shadow-sm"
    >
      <Container className="py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <div style={{ height: '32px', width: '77.5px' }}>
            <RelaiLogo className="h-8" />
          </div>
        </Link>
        
        {/* Desktop Navigation Menu */}
        <nav className="hidden md:flex items-center space-x-6">
          {/* Properties Dropdown */}
          <div 
            className="relative"
            ref={(el) => { dropdownRefs.current['properties'] = el; }}
          >
            <button 
              className="flex items-center space-x-1 text-gray-800 hover:text-[#1752FF] transition"
              onClick={() => toggleDropdown('properties')}
            >
              <span>{NAVIGATION.properties.title}</span>
              <ChevronDown className="h-4 w-4" />
            </button>
            {openDropdowns['properties'] && (
              <div 
                className="absolute left-0 mt-2 w-56 bg-white rounded-md shadow-lg py-2 z-10"
              >
                {NAVIGATION.properties.items.map((item, index) => (
                  <Link 
                    key={index} 
                    href={item.href}
                    className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 flex items-center"
                    onClick={() => closeDropdown('properties')}
                  >
                    {index === 0 && <Building className="h-4 w-4 mr-2 text-[#1752FF]" />}
                    {index === 1 && <Home className="h-4 w-4 mr-2 text-[#1752FF]" />}
                    {index === 2 && <Building2 className="h-4 w-4 mr-2 text-[#1752FF]" />}
                    {index === 3 && <MapPin className="h-4 w-4 mr-2 text-[#1752FF]" />}
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
          
          {/* NRI Services Link */}
          <Link 
            href={NAVIGATION.nri.href} 
            className="flex items-center text-gray-800 hover:text-[#1752FF] transition"
          >
            <Globe className="h-4 w-4 mr-1" />
            <span>{NAVIGATION.nri.title}</span>
          </Link>
          
          {/* Group Buying Link */}
          <Link 
            href={NAVIGATION.groupBuying.href} 
            className="flex items-center text-gray-800 hover:text-[#1752FF] transition"
          >
            <Users className="h-4 w-4 mr-1" />
            <span>{NAVIGATION.groupBuying.title}</span>
          </Link>
          
          {/* Tools Dropdown */}
          <div 
            className="relative"
            ref={(el) => { dropdownRefs.current['tools'] = el; }}
          >
            <button 
              className="flex items-center space-x-1 text-gray-800 hover:text-[#1752FF] transition"
              onClick={() => toggleDropdown('tools')}
            >
              <span>{NAVIGATION.tools.title}</span>
              <ChevronDown className="h-4 w-4" />
            </button>
            {openDropdowns['tools'] && (
              <div 
                className="absolute left-0 mt-2 w-64 bg-white rounded-md shadow-lg py-2 z-10"
              >
                {NAVIGATION.tools.items.map((item, index) => (
                  <Link 
                    key={index} 
                    href={item.href}
                    className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 flex items-center"
                    onClick={() => closeDropdown('tools')}
                  >
                    {index === 0 && <Calculator className="h-4 w-4 mr-2 text-[#1752FF]" />}
                    {index === 1 && <MoveHorizontal className="h-4 w-4 mr-2 text-[#1752FF]" />}
                    {index === 2 && <Scale className="h-4 w-4 mr-2 text-[#1752FF]" />}
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
          
          {/* Blog Link */}
          <Link 
            href="/blog" 
            className="flex items-center text-gray-800 hover:text-[#1752FF] transition"
          >
            <BookOpen className="h-4 w-4 mr-1" />
            <span>Blog</span>
          </Link>
          
          {/* About Us Link */}
          <Link 
            href={NAVIGATION.aboutUs.href} 
            className="text-gray-800 hover:text-[#1752FF] transition"
          >
            <span>{NAVIGATION.aboutUs.title}</span>
          </Link>
          
          {/* Contact Us Link */}
          <Link 
            href={NAVIGATION.contactUs.href} 
            className="flex items-center text-gray-800 hover:text-[#1752FF] transition"
          >
            <Mail className="h-4 w-4 mr-1" />
            <span>{NAVIGATION.contactUs.title}</span>
          </Link>
          
          {/* AI Advisor Button Removed as requested */}
        </nav>
        
        <div className="flex items-center space-x-2">
          {/* Header buttons removed as requested */}
        </div>
        
        {/* Mobile Menu Button */}
        {isMobile && (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-4 mt-8">
                <h3 className="font-bold text-lg mb-2">Menu</h3>
                
                {/* Mobile Properties */}
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center justify-between">
                    <span>{NAVIGATION.properties.title}</span>
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleDropdown('mobileProperties');
                      }}
                      className="focus:outline-none"
                    >
                      <ChevronDown className={`h-4 w-4 transition-transform ${openDropdowns['mobileProperties'] ? 'rotate-180' : ''}`} />
                    </button>
                  </h4>
                  {openDropdowns['mobileProperties'] && (
                    <div 
                      className="ml-4 space-y-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {NAVIGATION.properties.items.map((item, index) => (
                        <SheetClose asChild key={index}>
                          <Link 
                            href={item.href}
                            className="flex items-center py-1 text-sm text-gray-600 hover:text-[#1752FF]"
                          >
                            {index === 0 && <Building className="h-4 w-4 mr-2 text-[#1752FF]" />}
                            {index === 1 && <Home className="h-4 w-4 mr-2 text-[#1752FF]" />}
                            {index === 2 && <Building2 className="h-4 w-4 mr-2 text-[#1752FF]" />}
                            {index === 3 && <MapPin className="h-4 w-4 mr-2 text-[#1752FF]" />}
                            {item.label}
                          </Link>
                        </SheetClose>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Mobile NRI Services */}
                <SheetClose asChild>
                  <Link 
                    href={NAVIGATION.nri.href}
                    className="flex items-center text-gray-800 hover:text-[#1752FF] py-2 transition"
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    {NAVIGATION.nri.title}
                  </Link>
                </SheetClose>
                
                {/* Mobile Group Buying */}
                <SheetClose asChild>
                  <Link 
                    href={NAVIGATION.groupBuying.href}
                    className="flex items-center text-gray-800 hover:text-[#1752FF] py-2 transition"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    {NAVIGATION.groupBuying.title}
                  </Link>
                </SheetClose>
                
                {/* Mobile Tools */}
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center justify-between">
                    <span>{NAVIGATION.tools.title}</span>
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleDropdown('mobileTools');
                      }}
                      className="focus:outline-none"
                    >
                      <ChevronDown className={`h-4 w-4 transition-transform ${openDropdowns['mobileTools'] ? 'rotate-180' : ''}`} />
                    </button>
                  </h4>
                  {openDropdowns['mobileTools'] && (
                    <div 
                      className="ml-4 space-y-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {NAVIGATION.tools.items.map((item, index) => (
                        <SheetClose asChild key={index}>
                          <Link 
                            href={item.href}
                            className="flex items-center py-1 text-sm text-gray-600 hover:text-[#1752FF]"
                          >
                            {index === 0 && <Calculator className="h-4 w-4 mr-2 text-[#1752FF]" />}
                            {index === 1 && <MoveHorizontal className="h-4 w-4 mr-2 text-[#1752FF]" />}
                            {index === 2 && <Scale className="h-4 w-4 mr-2 text-[#1752FF]" />}
                            {item.label}
                          </Link>
                        </SheetClose>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Mobile About Us */}
                <SheetClose asChild>
                  <Link 
                    href={NAVIGATION.aboutUs.href}
                    className="text-gray-800 hover:text-[#1752FF] py-2 transition"
                  >
                    {NAVIGATION.aboutUs.title}
                  </Link>
                </SheetClose>
                
                {/* Mobile Contact Us */}
                <SheetClose asChild>
                  <Link 
                    href={NAVIGATION.contactUs.href}
                    className="flex items-center text-gray-800 hover:text-[#1752FF] py-2 transition"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    {NAVIGATION.contactUs.title}
                  </Link>
                </SheetClose>
                
                {/* Mobile AI Advisor Removed as requested */}
                
                {/* Mobile Find Your Suitable Property */}
                <SheetClose asChild>
                  <Link href="/property-wizard">
                    <Button className="w-full mt-4 bg-[#1752FF] hover:bg-[#103cc9] rounded-full flex items-center justify-center">
                      <Search className="h-4 w-4 mr-2" />
                      Find Your Suitable Property
                    </Button>
                  </Link>
                </SheetClose>
              </nav>
            </SheetContent>
          </Sheet>
        )}
      </Container>
    </header>
  );
}
