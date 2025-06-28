import { Droplets, Leaf, BarChart, LucideIcon, Volume2, Trash2 } from 'lucide-react';

interface EnvironmentFactorsProps {
  environmentFactors: {
    greenSpace: string;
    waterConservation: string[];
    wasteManagement: string[];
    airQuality: string;
    noiseLevel: string;
  };
}

export default function EnvironmentFactors({ environmentFactors }: EnvironmentFactorsProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-xl font-bold">Environmental Factors</h3>
        <span className="text-sm text-[#1752FF] font-medium">Eco-Friendly</span>
      </div>

      <div className="space-y-5">
        <EnvironmentItem 
          icon={Leaf} 
          title="Green Space" 
          description={environmentFactors.greenSpace} 
        />
        
        <EnvironmentItem 
          icon={Droplets} 
          title="Water Conservation" 
          description="Water-saving initiatives"
          list={environmentFactors.waterConservation}
        />
        
        <EnvironmentItem 
          icon={Trash2} 
          title="Waste Management" 
          description="Sustainable waste handling"
          list={environmentFactors.wasteManagement}
        />
        
        <EnvironmentItem 
          icon={BarChart} 
          title="Air Quality" 
          description={environmentFactors.airQuality} 
        />
        
        <EnvironmentItem 
          icon={Volume2} 
          title="Noise Level" 
          description={environmentFactors.noiseLevel} 
        />
      </div>
    </div>
  );
}

interface EnvironmentItemProps {
  icon: LucideIcon;
  title: string;
  description: string;
  list?: string[];
}

function EnvironmentItem({ icon: Icon, title, description, list }: EnvironmentItemProps) {
  return (
    <div className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
      <div className="flex items-center mb-2">
        <Icon className="h-5 w-5 text-[#1752FF]" />
        <h4 className="text-gray-900 font-semibold ml-2">{title}</h4>
      </div>
      <div className="ml-7">
        <p className="text-gray-600 text-sm">{description}</p>
        {list && list.length > 0 && (
          <ul className="list-disc pl-5 mt-2 text-gray-600 text-sm space-y-1">
            {list.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}