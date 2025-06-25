import { useState } from 'react';
import { Calculator, CreditCard, DollarSign, Gift, Percent } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';

interface PropertyFinancingProps {
  financingOptions: {
    banks: string[];
    interestRates: {
      min: number;
      max: number;
    };
    processingFee: string;
    specialOffers: string[];
  };
}

export default function PropertyFinancing({ financingOptions }: PropertyFinancingProps) {
  // State for EMI calculator
  const [loanAmount, setLoanAmount] = useState(5000000); // 50 Lakhs default
  const [interestRate, setInterestRate] = useState(
    (financingOptions.interestRates.min + financingOptions.interestRates.max) / 2
  );
  const [loanTenure, setLoanTenure] = useState(20); // 20 years default

  // Calculate EMI
  const calculateEmi = () => {
    const monthlyInterestRate = interestRate / 12 / 100;
    const totalMonths = loanTenure * 12;
    const emi =
      (loanAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, totalMonths)) /
      (Math.pow(1 + monthlyInterestRate, totalMonths) - 1);
    return Math.round(emi);
  };

  // Format amount in Indian currency format
  const formatIndianCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const emi = calculateEmi();
  const totalPayment = emi * loanTenure * 12;
  const totalInterest = totalPayment - loanAmount;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
      <h3 className="text-xl font-bold mb-6">Financing Options</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Loan Details */}
        <div>
          <div className="flex items-center mb-4">
            <CreditCard className="h-5 w-5 text-[#1752FF] mr-2" />
            <h4 className="font-semibold text-gray-900">Loan Details</h4>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Supported Banks</span>
              <span className="font-medium text-gray-900">{financingOptions.banks.length}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {financingOptions.banks.map((bank, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-white border border-gray-200 rounded-md text-xs"
                >
                  {bank}
                </span>
              ))}
            </div>

            <div className="flex justify-between pt-3 border-t border-gray-200">
              <span className="text-gray-600">Interest Rate</span>
              <span className="font-medium text-gray-900">
                {financingOptions.interestRates.min}% - {financingOptions.interestRates.max}%
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Processing Fee</span>
              <span className="font-medium text-gray-900">{financingOptions.processingFee}</span>
            </div>
          </div>

          {/* Special Offers */}
          <div className="mt-6">
            <div className="flex items-center mb-4">
              <Gift className="h-5 w-5 text-[#1752FF] mr-2" />
              <h4 className="font-semibold text-gray-900">Special Offers</h4>
            </div>

            <ul className="space-y-2 text-gray-600 text-sm">
              {financingOptions.specialOffers.map((offer, index) => (
                <li key={index} className="flex items-start">
                  <span className="h-5 w-5 bg-[#F0F4FF] rounded-full flex items-center justify-center text-[#1752FF] font-bold text-xs mr-2 flex-shrink-0">
                    {index + 1}
                  </span>
                  {offer}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* EMI Calculator */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="flex items-center mb-4">
            <Calculator className="h-5 w-5 text-[#1752FF] mr-2" />
            <h4 className="font-semibold text-gray-900">EMI Calculator</h4>
          </div>

          <div className="space-y-5">
            {/* Loan Amount Slider */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm text-gray-600">Loan Amount</label>
                <span className="text-sm font-medium">
                  {formatIndianCurrency(loanAmount)}
                </span>
              </div>
              <Slider
                value={[loanAmount]}
                min={1000000}
                max={20000000}
                step={100000}
                onValueChange={(value) => setLoanAmount(value[0])}
              />
            </div>

            {/* Interest Rate Slider */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm text-gray-600">Interest Rate</label>
                <span className="text-sm font-medium">{interestRate}%</span>
              </div>
              <Slider
                value={[interestRate]}
                min={financingOptions.interestRates.min}
                max={financingOptions.interestRates.max}
                step={0.1}
                onValueChange={(value) => setInterestRate(value[0])}
              />
            </div>

            {/* Loan Tenure Slider */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm text-gray-600">Loan Tenure</label>
                <span className="text-sm font-medium">{loanTenure} Years</span>
              </div>
              <Slider
                value={[loanTenure]}
                min={5}
                max={30}
                step={1}
                onValueChange={(value) => setLoanTenure(value[0])}
              />
            </div>
          </div>

          {/* EMI Results */}
          <div className="mt-6 bg-white p-4 rounded-lg">
            <div className="mb-4">
              <p className="text-sm text-gray-500">Your Monthly EMI</p>
              <p className="text-2xl font-bold text-[#1752FF]">
                {formatIndianCurrency(emi)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Principal</p>
                <p className="font-medium">{formatIndianCurrency(loanAmount)}</p>
              </div>
              <div>
                <p className="text-gray-500">Interest</p>
                <p className="font-medium">{formatIndianCurrency(totalInterest)}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-500">Total Payment</p>
                <p className="font-medium">{formatIndianCurrency(totalPayment)}</p>
              </div>
            </div>
          </div>

          <Button className="w-full mt-4 bg-[#1752FF]">
            <DollarSign className="h-4 w-4 mr-2" />
            Get Pre-Approved
          </Button>
        </div>
      </div>
    </div>
  );
}