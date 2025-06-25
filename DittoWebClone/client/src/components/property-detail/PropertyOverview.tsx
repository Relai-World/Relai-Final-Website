import { PropertyConfiguration, BuilderInfo } from '@/lib/models/property';
import { Building, Calendar, Home, Star, User } from 'lucide-react';

interface PropertyOverviewProps {
  description: string;
  type: string;
  status: string;
  possession: string;
  configurations: PropertyConfiguration[];
  builder: BuilderInfo;
}

export default function PropertyOverview({
  description,
  type,
  status,
  possession,
  configurations,
  builder
}: PropertyOverviewProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
      
      <p className="text-gray-700 mb-6 leading-relaxed">{description}</p>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6 border-t border-gray-200 pt-6">
        <div className="flex flex-col">
          <span className="text-gray-500 text-sm mb-1">Property Type</span>
          <div className="flex items-center">
            <Home className="h-4 w-4 text-[#1752FF] mr-2" />
            <span className="text-gray-800 font-medium">{type}</span>
          </div>
        </div>
        
        <div className="flex flex-col">
          <span className="text-gray-500 text-sm mb-1">Status</span>
          <div className="flex items-center">
            <Building className="h-4 w-4 text-[#1752FF] mr-2" />
            <span className="text-gray-800 font-medium">{status}</span>
          </div>
        </div>
        
        <div className="flex flex-col">
          <span className="text-gray-500 text-sm mb-1">Possession</span>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 text-[#1752FF] mr-2" />
            <span className="text-gray-800 font-medium">{possession}</span>
          </div>
        </div>
        
        <div className="flex flex-col">
          <span className="text-gray-500 text-sm mb-1">Builder</span>
          <div className="flex items-center">
            <User className="h-4 w-4 text-[#1752FF] mr-2" />
            <span className="text-gray-800 font-medium">{builder.name}</span>
            <div className="flex items-center ml-2 bg-green-50 px-2 py-0.5 rounded text-xs">
              <Star className="h-3 w-3 text-yellow-400 mr-1" />
              <span className="text-gray-800">{builder.rating}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold mb-3">Available Configurations</h3>
        <div className="flex flex-wrap gap-3">
          {configurations.map((config, index) => (
            <div 
              key={index} 
              className="px-4 py-2 bg-gray-100 rounded-md text-gray-800 font-medium"
            >
              {config}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}