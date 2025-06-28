import React from 'react';
import {
  Wifi,
  Car,
  Dumbbell,
  Waves,
  Trees,
  ShieldCheck,
  Droplets,
  Utensils,
  PartyPopper,
  Play,
  Briefcase,
  Building2,
  School,
  BadgeCheck,
  ParkingSquare,
  LifeBuoy,
  Plug,
  Sprout,
  Sun,
  Warehouse,
  Activity,
  Landmark
} from 'lucide-react';

// Helper function to get an icon based on amenity type
const getAmenityIcon = (amenityType: string) => {
  // Normalize amenity name for easier matching
  const normalizedType = amenityType.toLowerCase().trim();
  
  // Map amenity types to appropriate icons
  if (normalizedType.includes('wifi') || normalizedType.includes('internet')) {
    return <Wifi className="h-5 w-5 text-blue-500" />;
  } else if (normalizedType.includes('parking') || normalizedType.includes('car')) {
    return <Car className="h-5 w-5 text-slate-600" />;
  } else if (normalizedType.includes('gym') || normalizedType.includes('fitness')) {
    return <Dumbbell className="h-5 w-5 text-red-500" />;
  } else if (normalizedType.includes('swimming') || normalizedType.includes('pool')) {
    return <Waves className="h-5 w-5 text-blue-400" />;
  } else if (normalizedType.includes('garden') || normalizedType.includes('park') || normalizedType.includes('green')) {
    return <Trees className="h-5 w-5 text-green-500" />;
  } else if (normalizedType.includes('security') || normalizedType.includes('safe') || normalizedType.includes('gated')) {
    return <ShieldCheck className="h-5 w-5 text-indigo-500" />;
  } else if (normalizedType.includes('water') || normalizedType.includes('rain')) {
    return <Droplets className="h-5 w-5 text-blue-400" />;
  } else if (normalizedType.includes('restaurant') || normalizedType.includes('food') || normalizedType.includes('dining')) {
    return <Utensils className="h-5 w-5 text-orange-500" />;
  } else if (normalizedType.includes('club') || normalizedType.includes('party') || normalizedType.includes('event')) {
    return <PartyPopper className="h-5 w-5 text-purple-500" />;
  } else if (normalizedType.includes('play') || normalizedType.includes('child') || normalizedType.includes('kid')) {
    return <Play className="h-5 w-5 text-red-400" />;
  } else if (normalizedType.includes('commercial') || normalizedType.includes('office') || normalizedType.includes('business')) {
    return <Briefcase className="h-5 w-5 text-slate-600" />;
  } else if (normalizedType.includes('building') || normalizedType.includes('tower') || normalizedType.includes('apartment')) {
    return <Building2 className="h-5 w-5 text-slate-600" />;
  } else if (normalizedType.includes('school') || normalizedType.includes('education') || normalizedType.includes('learn')) {
    return <School className="h-5 w-5 text-blue-500" />;
  } else if (normalizedType.includes('quality') || normalizedType.includes('premium') || normalizedType.includes('luxury')) {
    return <BadgeCheck className="h-5 w-5 text-indigo-600" />;
  } else if (normalizedType.includes('visitor') || normalizedType.includes('guest')) {
    return <ParkingSquare className="h-5 w-5 text-slate-600" />;
  } else if (normalizedType.includes('emergency') || normalizedType.includes('safety')) {
    return <LifeBuoy className="h-5 w-5 text-red-500" />;
  } else if (normalizedType.includes('power') || normalizedType.includes('electricity') || normalizedType.includes('backup')) {
    return <Plug className="h-5 w-5 text-yellow-500" />;
  } else if (normalizedType.includes('sustainable') || normalizedType.includes('eco') || normalizedType.includes('green')) {
    return <Sprout className="h-5 w-5 text-green-500" />;
  } else if (normalizedType.includes('solar') || normalizedType.includes('sun') || normalizedType.includes('renewable')) {
    return <Sun className="h-5 w-5 text-yellow-500" />;
  } else if (normalizedType.includes('storage') || normalizedType.includes('warehouse')) {
    return <Warehouse className="h-5 w-5 text-slate-600" />;
  } else if (normalizedType.includes('health') || normalizedType.includes('medical') || normalizedType.includes('wellness')) {
    return <Activity className="h-5 w-5 text-red-500" />;
  } else if (normalizedType.includes('temple') || normalizedType.includes('worship') || normalizedType.includes('community')) {
    return <Landmark className="h-5 w-5 text-orange-500" />;
  } else {
    // Default icon for unmatched amenities
    return <BadgeCheck className="h-5 w-5 text-gray-500" />;
  }
};

interface PropertyAmenitiesProps {
  amenities: string[];
}

export default function PropertyAmenities({ amenities }: PropertyAmenitiesProps) {
  // Ensure amenities is always an array and has valid items
  if (!amenities || !Array.isArray(amenities) || amenities.length === 0) {
    return (
      <div className="py-4">
        <p className="text-gray-500 text-center">
          No amenities information available for this property.
        </p>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {amenities.map((amenity, index) => (
          <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="bg-white p-2 rounded-full shadow-sm">
              {getAmenityIcon(amenity)}
            </div>
            <span className="font-medium text-sm text-gray-700">{amenity}</span>
          </div>
        ))}
      </div>
    </div>
  );
}