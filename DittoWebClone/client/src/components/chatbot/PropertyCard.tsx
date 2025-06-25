import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Building2, MapPin, Home, Calendar, Banknote, FileText } from 'lucide-react';
import { Link } from 'wouter';

export interface Property {
  name: string;
  location: string;
  type: string;
  configuration: string;
  possession: string;
  priceRange: string;
  rera: string;
  propertyId?: string;
}

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-3"
    >
      <Card className="border-l-4 border-l-[#1752FF] hover:shadow-md transition-shadow">
        <CardContent className="p-3">
          <h4 className="font-bold text-sm flex items-center mb-1">
            <Building2 className="h-4 w-4 mr-1 text-[#1752FF]" />
            {property.name}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs">
            <div className="flex items-center">
              <MapPin className="h-3 w-3 mr-1 text-red-500" />
              <span>{property.location}</span>
            </div>
            <div className="flex items-center">
              <Home className="h-3 w-3 mr-1 text-orange-500" />
              <span>{property.type}</span>
            </div>
            <div className="flex items-center">
              <span className="font-bold mr-1">🔑</span>
              <span>{property.configuration}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1 text-blue-500" />
              <span>{property.possession}</span>
            </div>
            <div className="flex items-center">
              <Banknote className="h-3 w-3 mr-1 text-green-500" />
              <span>{property.priceRange}</span>
            </div>
            <div className="flex items-center">
              <FileText className="h-3 w-3 mr-1 text-gray-500" />
              <span>RERA: {property.rera}</span>
            </div>
          </div>
          
          {property.propertyId && (
            <div className="mt-2 text-right">
              <Link to={`/property/${property.propertyId}`}>
                <span className="text-xs text-[#1752FF] hover:underline cursor-pointer">View Details</span>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}