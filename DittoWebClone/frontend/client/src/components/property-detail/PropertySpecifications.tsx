import { Bath, Construction, Cable, CornerRightDown, Grid, Home, Layers, Sofa } from "lucide-react";

interface PropertySpecificationsProps {
  specifications: {
    structure: string;
    walls: string;
    flooring: string;
    kitchen: string;
    bathroom: string;
    doors: string;
    windows: string;
    electrical: string;
  };
}

export default function PropertySpecifications({ specifications }: PropertySpecificationsProps) {
  const specItems = [
    { icon: <Construction className="h-5 w-5 text-[#1752FF]" />, label: "Structure", value: specifications.structure },
    { icon: <Layers className="h-5 w-5 text-[#1752FF]" />, label: "Walls", value: specifications.walls },
    { icon: <Grid className="h-5 w-5 text-[#1752FF]" />, label: "Flooring", value: specifications.flooring },
    { icon: <Sofa className="h-5 w-5 text-[#1752FF]" />, label: "Kitchen", value: specifications.kitchen },
    { icon: <Bath className="h-5 w-5 text-[#1752FF]" />, label: "Bathroom", value: specifications.bathroom },
    { icon: <CornerRightDown className="h-5 w-5 text-[#1752FF]" />, label: "Doors", value: specifications.doors },
    { icon: <Home className="h-5 w-5 text-[#1752FF]" />, label: "Windows", value: specifications.windows },
    { icon: <Cable className="h-5 w-5 text-[#1752FF]" />, label: "Electrical", value: specifications.electrical },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-xl font-bold">Specifications</h3>
        <span className="text-sm text-[#1752FF] font-medium">Relai Verified</span>
      </div>

      <div className="space-y-5">
        {specItems.map((item, index) => (
          <div key={index} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
            <div className="flex items-center mb-2">
              {item.icon}
              <h4 className="text-gray-900 font-semibold ml-2">{item.label}</h4>
            </div>
            <p className="text-gray-600 ml-7 text-sm">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}