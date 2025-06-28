import { useState } from 'react';
import { FloorPlan } from '@/lib/models/property';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowRight, Download, Maximize2, Ruler } from 'lucide-react';

interface PropertyFloorPlansProps {
  floorPlans: FloorPlan[];
}

export default function PropertyFloorPlans({ floorPlans }: PropertyFloorPlansProps) {
  const [selectedFloorPlan, setSelectedFloorPlan] = useState<FloorPlan>(floorPlans[0]);

  // Format price in Indian format
  const formatIndianPrice = (price: number) => {
    if (price >= 10000000) { // 1 crore or more
      return `₹${(price / 10000000).toFixed(2).replace(/\.00$/, '')} Cr`;
    } else if (price >= 100000) { // 1 lakh or more
      return `₹${(price / 100000).toFixed(2).replace(/\.00$/, '')} L`;
    } else {
      return `₹${price.toLocaleString('en-IN')}`;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-xl font-bold mb-6">Floor Plans & Pricing</h3>

      <Tabs 
        defaultValue={floorPlans[0].configuration} 
        onValueChange={(value) => {
          const plan = floorPlans.find(p => p.configuration === value);
          if (plan) setSelectedFloorPlan(plan);
        }}
      >
        <TabsList className="mb-6 bg-gray-100">
          {floorPlans.map((plan) => (
            <TabsTrigger key={plan.configuration} value={plan.configuration}>
              {plan.configuration}
            </TabsTrigger>
          ))}
        </TabsList>

        {floorPlans.map((plan) => (
          <TabsContent key={plan.configuration} value={plan.configuration} className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <Dialog>
                  <DialogTrigger asChild>
                    <div className="relative cursor-pointer bg-gray-100 rounded-lg overflow-hidden h-[300px]">
                      <img
                        src={plan.image}
                        alt={`${plan.configuration} Floor Plan`}
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/30 transition-opacity">
                        <Button variant="secondary" className="flex items-center">
                          <Maximize2 className="mr-2 h-4 w-4" /> View Larger
                        </Button>
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <div className="p-4">
                      <h4 className="text-lg font-bold mb-2">{plan.configuration} Floor Plan</h4>
                      <img
                        src={plan.image}
                        alt={`${plan.configuration} Floor Plan`}
                        className="w-full h-auto object-contain"
                      />
                    </div>
                  </DialogContent>
                </Dialog>

                <Button 
                  variant="outline" 
                  size="sm" 
                  className="absolute bottom-4 right-4 text-sm bg-white"
                >
                  <Download className="mr-2 h-4 w-4" /> Download
                </Button>
              </div>

              <div>
                <div className="bg-gray-50 rounded-lg p-5">
                  <h4 className="text-lg font-semibold">{plan.configuration}</h4>
                  <p className="text-2xl font-bold text-[#1752FF] mt-1">
                    {formatIndianPrice(plan.price)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    ₹{plan.pricePerSqFt.toLocaleString('en-IN')} per sq.ft.
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded-md">
                      <div className="text-xs text-gray-500">Carpet Area</div>
                      <div className="text-lg font-medium flex items-center">
                        {plan.carpetArea} sq.ft.
                        <Ruler className="ml-1 h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-md">
                      <div className="text-xs text-gray-500">Built-up Area</div>
                      <div className="text-lg font-medium flex items-center">
                        {plan.builtUpArea} sq.ft.
                        <Ruler className="ml-1 h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-md col-span-2">
                      <div className="text-xs text-gray-500">Super Built-up Area</div>
                      <div className="text-lg font-medium flex items-center">
                        {plan.superBuiltUpArea} sq.ft.
                        <Ruler className="ml-1 h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-5">
                    <Button className="w-full bg-[#1752FF]">
                      Check Availability <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}