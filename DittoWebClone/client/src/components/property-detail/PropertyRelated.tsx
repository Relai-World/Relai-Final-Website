import { mockProperty } from '@/lib/data/mock-properties';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

export default function PropertyRelated() {
  // In a real implementation, we would fetch related properties.
  // For now, we'll use our mock property repeated
  const relatedProperties = [
    { ...mockProperty, id: 'prop-124', title: 'Modern 2BHK Apartment in Gachibowli' },
    { ...mockProperty, id: 'prop-125', title: 'Premium 4BHK Villa in Jubilee Hills' },
    { ...mockProperty, id: 'prop-126', title: 'Spacious 3BHK in Financial District' }
  ];

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Similar Properties</h2>
        <Button variant="outline" className="text-[#1752FF] border-[#1752FF]">
          View All <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {relatedProperties.map((property) => (
          <div key={property.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="h-48 overflow-hidden">
              <img 
                src={property.gallery.images[0]} 
                alt={property.title} 
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{property.title}</h3>
              <p className="text-gray-600 mt-1 text-sm">{property.address.line1}, {property.address.city}</p>
              
              <div className="mt-3 flex items-center justify-between">
                <div className="text-[#1752FF] font-bold">
                  ₹{(property.price.amount / 100000).toFixed(2)} Lakhs
                </div>
                <div className="text-gray-600 text-sm">
                  {property.area.total} {property.area.unit}
                </div>
              </div>
              
              <div className="mt-3 flex items-center text-sm text-gray-600 space-x-4">
                <span>{property.configuration.bedrooms} Beds</span>
                <span>{property.configuration.bathrooms} Baths</span>
                <span>{property.possession.status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}