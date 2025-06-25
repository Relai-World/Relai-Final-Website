import { PropertyConfiguration } from '@/lib/models/property';
import { Button } from '@/components/ui/button';
import { PhoneCall } from 'lucide-react';

interface PropertyPriceCardProps {
  priceRange: {
    min: number;
    max: number;
  };
  configurations: PropertyConfiguration[];
  type: string;
  status: string;
  possession: string;
}

export default function PropertyPriceCard({
  priceRange,
  configurations,
  type,
  status,
  possession
}: PropertyPriceCardProps) {
  // Format price in Indian format (e.g., ₹75 L - ₹1.5 Cr)
  const formatIndianPrice = (price: number) => {
    if (price >= 10000000) { // 1 crore or more
      return `₹${(price / 10000000).toFixed(2).replace(/\.00$/, '')} Cr`;
    } else if (price >= 100000) { // 1 lakh or more
      return `₹${(price / 100000).toFixed(2).replace(/\.00$/, '')} L`;
    } else {
      return `₹${price.toLocaleString('en-IN')}`;
    }
  };

  const minPrice = formatIndianPrice(priceRange.min);
  const maxPrice = formatIndianPrice(priceRange.max);
  const priceDisplay = priceRange.min === priceRange.max ? minPrice : `${minPrice} - ${maxPrice}`;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="pb-5 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">
          {priceDisplay}
        </h2>
        <div className="text-sm text-gray-500 mt-1">
          {type} • {configurations.join(', ')}
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Status</span>
          <span className="font-medium text-gray-900">{status}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Possession</span>
          <span className="font-medium text-gray-900">{possession}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Type</span>
          <span className="font-medium text-gray-900">{type}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Configurations</span>
          <span className="font-medium text-gray-900">{configurations.join(', ')}</span>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <Button className="w-full bg-[#1752FF] hover:bg-[#0E3CC7]">
          <PhoneCall className="h-4 w-4 mr-2" />
          Contact Agent
        </Button>
        <Button variant="outline" className="w-full border-[#1752FF] text-[#1752FF] hover:bg-[#F0F4FF]">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 mr-2"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Get on WhatsApp
        </Button>
      </div>

      <div className="mt-5 pt-5 border-t border-gray-200">
        <p className="text-sm text-gray-500 text-center">
          Be connected with our property expert for this project within 15 minutes
        </p>
      </div>
    </div>
  );
}