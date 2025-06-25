import { ArrowRight, ArrowUpRight, LineChart, Percent, TrendingUp } from "lucide-react";

interface InvestmentPotentialProps {
  investmentPotential: {
    resaleValue: string;
    appreciationTrend: string;
    rentalYield: string;
    upcomingDevelopments: string[];
  };
}

export default function InvestmentPotential({ investmentPotential }: InvestmentPotentialProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-xl font-bold">Investment Potential</h3>
        <span className="text-sm text-[#1752FF] font-medium">Relai Analysis</span>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-6">
        <div className="flex items-start">
          <div className="bg-[#F0F4FF] p-2 rounded-md mr-3">
            <TrendingUp className="h-5 w-5 text-[#1752FF]" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Resale Value</h4>
            <p className="text-gray-600 mt-1 text-sm">{investmentPotential.resaleValue}</p>
          </div>
        </div>

        <div className="flex items-start">
          <div className="bg-[#F0F4FF] p-2 rounded-md mr-3">
            <LineChart className="h-5 w-5 text-[#1752FF]" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Appreciation Trend</h4>
            <p className="text-gray-600 mt-1 text-sm">{investmentPotential.appreciationTrend}</p>
          </div>
        </div>

        <div className="flex items-start">
          <div className="bg-[#F0F4FF] p-2 rounded-md mr-3">
            <Percent className="h-5 w-5 text-[#1752FF]" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Rental Yield</h4>
            <p className="text-gray-600 mt-1 text-sm">{investmentPotential.rentalYield}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4 mt-4">
        <h4 className="font-medium text-gray-900 mb-3">Upcoming Developments</h4>
        <ul className="space-y-2 text-sm">
          {investmentPotential.upcomingDevelopments.map((development, index) => (
            <li key={index} className="flex items-start">
              <ArrowUpRight className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-gray-600">{development}</span>
            </li>
          ))}
        </ul>
      </div>

      <button className="w-full mt-6 flex items-center justify-center text-[#1752FF] font-medium py-2 border border-[#1752FF] rounded-md hover:bg-[#F0F4FF]">
        Detailed Investment Analysis <ArrowRight className="ml-1 h-4 w-4" />
      </button>
    </div>
  );
}