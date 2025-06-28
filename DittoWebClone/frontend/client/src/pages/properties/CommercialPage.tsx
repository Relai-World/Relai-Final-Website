import React, { useEffect } from 'react';
import { Link } from 'wouter';
import { BuildingIcon } from 'lucide-react';

export default function CommercialPage() {
  // Set page title and meta description when component mounts
  useEffect(() => {
    document.title = "Commercial Properties for Sale in Hyderabad | Shops, Offices & More – Relai";
    
    // Set meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Explore top commercial properties in Hyderabad with Relai. Invest in office spaces, shops, and commercial buildings with full resale support and expert advice.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Explore top commercial properties in Hyderabad with Relai. Invest in office spaces, shops, and commercial buildings with full resale support and expert advice.';
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
    <div className="container mx-auto px-4 pt-32 pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Commercial Properties</h1>
        <p className="text-lg text-gray-600">
          Explore premium commercial properties and office spaces in Hyderabad.
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <Link href="/properties/all">
          <a className="text-blue-600 hover:underline flex items-center gap-2">
            <BuildingIcon size={16} />
            View All Properties
          </a>
        </Link>
      </div>
      
      <div className="py-16 text-center">
        <BuildingIcon size={48} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">Coming Soon</h2>
        <p className="text-gray-500 max-w-md mx-auto mb-6">
          Our commercial property listings are being updated. Please check back soon or view all properties.
        </p>
        <Link href="/properties/all">
          <a className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
            Browse All Properties
          </a>
        </Link>
      </div>
    </div>
  );
}