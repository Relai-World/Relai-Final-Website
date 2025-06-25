import React from 'react';
import { Property } from '@shared/schema';
import {
  Building,
  Calendar,
  MapPin,
  IndianRupee,
  Users,
  Home,
  Check,
  Info,
  Banknote,
  Clock,
  Trophy
} from 'lucide-react';
import { StarRating } from '@/components/ui/star-rating';
import { calculatePropertyRating } from '@shared/property-rating';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface PropertyDetailsProps {
  property: Property;
}

const PropertyDetails: React.FC<PropertyDetailsProps> = ({ property }) => {
  // Format price to Indian rupees format
  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)} Lac`;
    } else {
      return `₹${price.toLocaleString()}`;
    }
  };

  return (
    <Card className="shadow-md overflow-hidden mb-8">
      {/* Modern property details header with gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-8 border-b-8 border-blue-900">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-3">{property.projectName || property.name}</h2>
            <div className="flex items-start gap-2 mb-2">
              <MapPin className="w-5 h-5 mr-1 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-lg font-medium">{property.location}</p>
                {property.developerName && (
                  <p className="text-blue-100 text-sm mt-1">by {property.developerName}</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Property Rating */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 ml-6">
            <div className="text-center">
              <p className="text-xs opacity-90 mb-2">Relai Rating</p>
              <StarRating 
                rating={calculatePropertyRating(property).overall} 
                size="lg" 
                showNumber={true}
                className="text-white justify-center"
              />
              <div className="mt-3 text-xs opacity-75">
                {calculatePropertyRating(property).factors.slice(0, 2).map((factor, index) => (
                  <div key={index}>• {factor}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main info cards - organized in a grid */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Specs + Pricing Card (Merged) */}
        <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Home className="w-5 h-5 text-blue-500 mr-2" />
            Property Specs & Pricing
          </h3>
          <div className="space-y-4">
            {/* Property Type */}
            {property.propertyType && (
              <div className="flex items-start gap-3">
                <Home className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">Property Type</p>
                  <p className="text-base font-medium">{property.propertyType}</p>
                </div>
              </div>
            )}
            {/* Configuration */}
            {property.configurations && (
              <div className="flex items-start gap-3">
                <Home className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">Configuration</p>
                  <p className="text-base font-medium">{property.configurations}</p>
                </div>
              </div>
            )}
            {/* Size */}
            {(property.minSizeSqft || property.maxSizeSqft) && (
              <div className="flex items-start gap-3">
                <Home className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">Size</p>
                  <p className="text-base font-medium">
                    {property.minSizeSqft}
                    {property.maxSizeSqft && property.minSizeSqft && property.maxSizeSqft > property.minSizeSqft ? ` - ${property.maxSizeSqft}` : ''} sq.ft.
                  </p>
                </div>
              </div>
            )}
            {/* Price */}
            {property.price > 0 && (
              <div className="flex items-start gap-3">
                <IndianRupee className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600">Price</p>
                  <p className="text-lg font-bold text-blue-600">{formatPrice(property.price)}</p>
                </div>
              </div>
            )}
            {/* Price Per SqFt */}
            {(property.pricePerSqft || property.price_per_sqft) && (
              <div className="flex items-start gap-3">
                <IndianRupee className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600">Price Per Sq.Ft.</p>
                  <p className="text-lg font-bold text-blue-600">₹{property.pricePerSqft || property.price_per_sqft}/sq.ft.</p>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Status & Timeline Card */}
        <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 text-blue-500 mr-2" />
            Status & Timeline
          </h3>
          <div className="space-y-4">
            {/* Construction Status */}
            {property.constructionStatus && (
              <div className="flex items-start gap-3">
                <Building className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">Construction Status</p>
                  <p className="text-base font-medium">
                    <Badge className={
                      property.constructionStatus.toLowerCase().includes('ready')
                        ? "bg-green-100 text-green-800 hover:bg-green-100"
                        : "bg-blue-100 text-blue-800 hover:bg-blue-100"
                    }>
                      {property.constructionStatus}
                    </Badge>
                  </p>
                </div>
              </div>
            )}
            {/* Possession Date */}
            {property.possessionDate && (
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">Possession Date</p>
                  <p className="text-base font-medium">{property.possessionDate}</p>
                </div>
              </div>
            )}
            {/* Project Area */}
            {property.areaSizeAcres && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">Project Area</p>
                  <p className="text-base font-medium">{property.areaSizeAcres} acres</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Property Description */}
      {property.description && (
        <div className="px-6 pb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
          <p className="text-gray-700 whitespace-pre-line leading-relaxed">{property.description}</p>
        </div>
      )}
      
      {/* Property Remarks/Comments */}
      {property.remarksComments && (
        <div className="px-6 pb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Information</h3>
          <p className="text-gray-700 whitespace-pre-line leading-relaxed">{property.remarksComments}</p>
        </div>
      )}
      
      {/* Loan Approved Banks */}
      {property.loanApprovedBanks && property.loanApprovedBanks.length > 0 && (
        <div className="px-6 pb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <Trophy className="w-5 h-5 text-blue-500 mr-2" />
            Loan Approved Banks
          </h3>
          <div className="flex flex-wrap gap-2">
            {property.loanApprovedBanks.map((bank, index) => (
              <Badge key={index} variant="outline" className="bg-gray-50 text-blue-700 border-blue-200">
                {bank}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {/* Additional Details in a styled grid */}
      {(property.constructionQuality || property.waterSupply || property.powerBackup || 
        property.parkingFacilities || property.investmentPotential || 
        property.environmentalFeatures || property.connectivityAndTransit) && (
        <div className="px-6 pb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
            {/* Construction Quality */}
            {property.constructionQuality && (
              <div className="p-3 bg-white rounded shadow-sm">
                <h4 className="text-md font-medium text-gray-900 mb-1">Construction Quality</h4>
                <p className="text-gray-700 text-sm">{property.constructionQuality}</p>
              </div>
            )}
            
            {/* Water Supply */}
            {property.waterSupply && (
              <div className="p-3 bg-white rounded shadow-sm">
                <h4 className="text-md font-medium text-gray-900 mb-1">Water Supply</h4>
                <p className="text-gray-700 text-sm">{property.waterSupply}</p>
              </div>
            )}
            
            {/* Power Backup */}
            {property.powerBackup && (
              <div className="p-3 bg-white rounded shadow-sm">
                <h4 className="text-md font-medium text-gray-900 mb-1">Power Backup</h4>
                <p className="text-gray-700 text-sm">{property.powerBackup}</p>
              </div>
            )}
            
            {/* Parking Facilities */}
            {property.parkingFacilities && (
              <div className="p-3 bg-white rounded shadow-sm">
                <h4 className="text-md font-medium text-gray-900 mb-1">Parking Facilities</h4>
                <p className="text-gray-700 text-sm">{property.parkingFacilities}</p>
              </div>
            )}
            
            {/* Investment Potential */}
            {property.investmentPotential && (
              <div className="p-3 bg-white rounded shadow-sm">
                <h4 className="text-md font-medium text-gray-900 mb-1">Investment Potential</h4>
                <p className="text-gray-700 text-sm">{property.investmentPotential}</p>
              </div>
            )}
            
            {/* Environmental Features */}
            {property.environmentalFeatures && (
              <div className="p-3 bg-white rounded shadow-sm">
                <h4 className="text-md font-medium text-gray-900 mb-1">Environmental Features</h4>
                <p className="text-gray-700 text-sm">{property.environmentalFeatures}</p>
              </div>
            )}
            
            {/* Connectivity and Transit */}
            {property.connectivityAndTransit && (
              <div className="p-3 bg-white rounded shadow-sm">
                <h4 className="text-md font-medium text-gray-900 mb-1">Connectivity and Transit</h4>
                <p className="text-gray-700 text-sm">{property.connectivityAndTransit}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

export default PropertyDetails;