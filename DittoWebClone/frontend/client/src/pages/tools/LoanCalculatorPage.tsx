import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Container from "@/components/ui/container";
import {
  Calculator,
  BarChart,
  ArrowRight,
  CreditCard,
  Building,
  HelpCircle,
  Download,
  Percent,
  DollarSign,
  Clock,
} from "lucide-react";
import { useLocation } from "wouter";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Types
interface LoanDetails {
  principal: number;
  interest: number;
  tenure: number;
}

interface EMIResult {
  emi: number;
  totalInterest: number;
  totalAmount: number;
  amortizationSchedule: Array<{
    month: number;
    emi: number;
    principal: number;
    interest: number;
    balance: number;
  }>;
}

export default function LoanCalculatorPage() {
  // Set page title and meta description when component mounts
  useEffect(() => {
    document.title = "Home Loan EMI Calculator – Plan Your Property Purchase | Relai";

    // Set meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Estimate your monthly EMI with Relai’s home loan calculator. Plan your budget smartly and explore loan options tailored for property buyers.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Estimate your monthly EMI with Relai’s home loan calculator. Plan your budget smartly and explore loan options tailored for property buyers.';
      document.getElementsByTagName('head')[0].appendChild(meta);
    }

    // Restore title when component unmounts
    return () => {
      document.title = "Genuine, Smarter, and End to End Real Estate Services in Hyderabad";
      // Restore original meta description
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', 'Discover smarter real estate with Relai. Buy RERA verified properties with expert real estate guidance—all in one place');
      }
    };
  }, []);
  const [, navigate] = useLocation();

  // States
  const [loanDetails, setLoanDetails] = useState<LoanDetails>({
    principal: 5000000, // 50 Lakhs
    interest: 8.5, // 8.5%
    tenure: 20, // 20 years
  });

  const [emiResult, setEmiResult] = useState<EMIResult>({
    emi: 0,
    totalInterest: 0,
    totalAmount: 0,
    amortizationSchedule: [],
  });

  // Calculate EMI and other details
  const calculateEMI = () => {
    const { principal, interest, tenure } = loanDetails;
    const monthlyInterest = interest / 12 / 100;
    const totalMonths = tenure * 12;

    // EMI calculation formula: [P x R x (1+R)^N]/[(1+R)^N-1]
    const emi =
      (principal *
        monthlyInterest *
        Math.pow(1 + monthlyInterest, totalMonths)) /
      (Math.pow(1 + monthlyInterest, totalMonths) - 1);

    const totalAmount = emi * totalMonths;
    const totalInterest = totalAmount - principal;

    // Generate amortization schedule
    const schedule = [];
    let balance = principal;

    for (let month = 1; month <= totalMonths; month++) {
      const interestPayment = balance * monthlyInterest;
      const principalPayment = emi - interestPayment;

      balance -= principalPayment;

      if (month <= 12 || month % 12 === 0 || month === totalMonths) {
        schedule.push({
          month,
          emi,
          principal: principalPayment,
          interest: interestPayment,
          balance: Math.max(0, balance),
        });
      }
    }

    setEmiResult({
      emi,
      totalInterest,
      totalAmount,
      amortizationSchedule: schedule,
    });
  };

  // Handle input changes
  const handlePrincipalChange = (value: number[]) => {
    setLoanDetails({ ...loanDetails, principal: value[0] });
  };

  const handlePrincipalInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setLoanDetails({ ...loanDetails, principal: value });
    }
  };

  const handleInterestChange = (value: number[]) => {
    setLoanDetails({ ...loanDetails, interest: value[0] });
  };

  const handleInterestInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setLoanDetails({ ...loanDetails, interest: value });
    }
  };

  const handleTenureChange = (value: number[]) => {
    setLoanDetails({ ...loanDetails, tenure: value[0] });
  };

  const handleTenureInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setLoanDetails({ ...loanDetails, tenure: value });
    }
  };

  // Calculate whenever loan details change
  useEffect(() => {
    calculateEMI();
  }, [loanDetails]);

  // Format number to Indian currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format number with commas
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-IN").format(Math.round(num));
  };

  // Professional header and footer function
  const addHeaderFooter = (doc: jsPDF, pageNumber: number, totalPages: number) => {
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const headerHeight = 30;
    const footerHeight = 30;
    
    // Header with company branding
    doc.setFillColor(23, 82, 255);
    doc.rect(0, 0, pageWidth, headerHeight, 'F');
    
    // Company name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('RELAI', 20, 18);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('The Ultimate Real Estate Buying Experience', 60, 18);
    
    // Header separator line
    doc.setDrawColor(23, 82, 255);
    doc.setLineWidth(1);
    doc.line(0, headerHeight, pageWidth, headerHeight);
    
    // Footer background
    const footerStartY = pageHeight - footerHeight;
    doc.setFillColor(248, 248, 248);
    doc.rect(0, footerStartY, pageWidth, footerHeight, 'F');
    
    // Footer separator line
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(0, footerStartY, pageWidth, footerStartY);
    
    // Footer text
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    
    // Page number (right aligned)
    const pageText = `Page ${pageNumber} of ${totalPages}`;
    const pageTextWidth = doc.getTextWidth(pageText);
    doc.text(pageText, pageWidth - 20 - pageTextWidth, footerStartY + 8);
    
    // Company information (left aligned)
    doc.text('Relai Technologies Pvt. Ltd. | Property Investment Advisory Services', 20, footerStartY + 8);
    doc.text('Email: connect@relai.world | Phone: +91 888 108 8890 | Website: www.relai.in', 20, footerStartY + 15);
    doc.text('Confidential Investment Report - For Client Use Only', 20, footerStartY + 22);
    
    // Reset text color to black for content
    doc.setTextColor(0, 0, 0);
  };

  // Format price with proper encoding
  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `Rs ${(price / 10000000).toFixed(1)} Cr`;
    } else if (price >= 100000) {
      return `Rs ${(price / 100000).toFixed(1)} L`;
    } else {
      return `Rs ${price.toLocaleString('en-IN')}`;
    }
  };

  // Download amortization schedule as PDF
  const downloadSchedulePDF = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    const headerHeight = 30;
    const footerHeight = 30;
    const maxContentY = pageHeight - footerHeight - 10;
    let yPosition = headerHeight + 15;
    let pageNumber = 1;
    
    // Calculate total pages
    const totalPages = Math.ceil(emiResult.amortizationSchedule.length / 20) + 1;
    
    // Add header and footer to first page
    addHeaderFooter(doc, pageNumber, totalPages);
    
    // TITLE PAGE
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    const title = 'LOAN AMORTIZATION SCHEDULE';
    const titleWidth = doc.getTextWidth(title);
    doc.text(title, (pageWidth - titleWidth) / 2, yPosition + 20);
    
    yPosition += 50;
    
    // Check if we have enough space for the loan details box
    if (yPosition > maxContentY - 100) {
      doc.addPage();
      pageNumber++;
      addHeaderFooter(doc, pageNumber, totalPages);
      yPosition = headerHeight + 15;
    }
    
    // Loan Details Box with proper sizing
    const boxHeight = 90;
    doc.setDrawColor(23, 82, 255);
    doc.setLineWidth(1);
    doc.rect(margin, yPosition, pageWidth - (2 * margin), boxHeight);
    
    doc.setFillColor(248, 249, 250);
    doc.rect(margin + 1, yPosition + 1, pageWidth - (2 * margin) - 2, boxHeight - 2, 'F');
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('LOAN DETAILS', margin + 10, yPosition + 18);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const loanDetailsY = yPosition + 32;
    
    // Ensure all text stays within the box boundaries
    const textX = margin + 10;
    const maxTextWidth = pageWidth - (2 * margin) - 20; // Leave margins on both sides
    
    doc.text(`Loan Amount: ${formatPrice(loanDetails.principal)}`, textX, loanDetailsY);
    doc.text(`Interest Rate: ${loanDetails.interest}% per annum`, textX, loanDetailsY + 10);
    doc.text(`Loan Tenure: ${loanDetails.tenure} years (${loanDetails.tenure * 12} months)`, textX, loanDetailsY + 20);
    doc.text(`Monthly EMI: ${formatPrice(emiResult.emi)}`, textX, loanDetailsY + 30);
    doc.text(`Total Interest: ${formatPrice(emiResult.totalInterest)}`, textX, loanDetailsY + 40);
    doc.text(`Total Amount Payable: ${formatPrice(emiResult.totalAmount)}`, textX, loanDetailsY + 50);
    
    yPosition += boxHeight + 20;
    
    // Check if we have space for the report date
    if (yPosition > maxContentY - 15) {
      doc.addPage();
      pageNumber++;
      addHeaderFooter(doc, pageNumber, totalPages);
      yPosition = headerHeight + 15;
    }
    
    // Report Generation Date
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    const reportDate = `Report Generated: ${new Date().toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}`;
    const dateWidth = doc.getTextWidth(reportDate);
    doc.text(reportDate, (pageWidth - dateWidth) / 2, yPosition);
    
    // Add new page for amortization table
    doc.addPage();
    pageNumber++;
    addHeaderFooter(doc, pageNumber, totalPages);
    yPosition = headerHeight + 15;
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('PAYMENT SCHEDULE', margin, yPosition);
    yPosition += 15;
    
    // Create table data with proper formatting
    const tableData = emiResult.amortizationSchedule.map((entry) => [
      entry.month <= 12 
        ? `Month ${entry.month}` 
        : `Year ${Math.ceil(entry.month / 12)}`,
      formatPrice(entry.emi),
      formatPrice(entry.principal),
      formatPrice(entry.interest),
      formatPrice(entry.balance)
    ]);
    
    autoTable(doc, {
      head: [['Period', 'EMI', 'Principal', 'Interest', 'Outstanding Balance']],
      body: tableData,
      startY: yPosition,
      styles: {
        fontSize: 9,
        cellPadding: 4,
        font: 'helvetica'
      },
      headStyles: {
        fillColor: [23, 82, 255],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 10
      },
      bodyStyles: {
        fontSize: 8
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250],
      },
      margin: { 
        left: margin, 
        right: margin, 
        top: headerHeight + 10,
        bottom: footerHeight + 10
      },
      pageBreak: 'auto',
      showFoot: 'everyPage',
      showHead: 'everyPage',
      tableLineColor: [200, 200, 200],
      tableLineWidth: 0.1,
      didDrawPage: (data: any) => {
        // Add header/footer to new pages
        if (data.pageNumber > pageNumber) {
          pageNumber = data.pageNumber;
          addHeaderFooter(doc, pageNumber, totalPages);
        }
      }
    });
    
    // Save the PDF
    doc.save(`loan_amortization_schedule_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="pt-24 pb-20">
      <Container>
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <div className="mb-8 flex justify-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="rounded-full bg-[#1752FF] bg-opacity-10 p-5"
            >
              <Calculator className="h-12 w-12 text-[#1752FF]" />
            </motion.div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Property Loan Calculator
          </h1>
          <p className="text-gray-600 max-w-3xl mx-auto mb-8">
            Plan your property purchase with our easy-to-use home loan
            calculator. Estimate your EMI, understand your repayment schedule,
            and make informed financial decisions.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Calculator Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-[#1752FF]" />
                  Loan Details
                </h2>

                {/* Loan Amount */}
                <div className="mb-8">
                  <div className="flex justify-between mb-2">
                    <label className="font-medium text-gray-700">
                      Loan Amount
                    </label>
                    <div className="flex items-center">
                      <Input
                        type="number"
                        value={loanDetails.principal}
                        onChange={handlePrincipalInputChange}
                        className="w-32 text-right"
                      />
                      <span className="ml-2">₹</span>
                    </div>
                  </div>

                  <Slider
                    value={[loanDetails.principal]}
                    min={100000}
                    max={20000000}
                    step={100000}
                    onValueChange={handlePrincipalChange}
                    className="mb-2 slider-enhanced"
                  />

                  <div className="flex justify-between text-sm text-gray-500">
                    <span>₹{formatNumber(loanDetails.principal)}</span>
                    <span>₹2 Crore</span>
                  </div>
                </div>

                {/* Interest Rate */}
                <div className="mb-8">
                  <div className="flex justify-between mb-2">
                    <label className="font-medium text-gray-700">
                      Interest Rate
                    </label>
                    <div className="flex items-center">
                      <Input
                        type="number"
                        value={loanDetails.interest}
                        onChange={handleInterestInputChange}
                        className="w-24 text-right"
                        step="0.1"
                      />
                      <span className="ml-2">%</span>
                    </div>
                  </div>

                  <Slider
                    value={[loanDetails.interest]}
                    min={4}
                    max={20}
                    step={0.1}
                    onValueChange={handleInterestChange}
                    className="mb-2 slider-enhanced"
                  />

                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{loanDetails.interest.toFixed(1)}%</span>
                    <span>20%</span>
                  </div>
                </div>

                {/* Loan Tenure */}
                <div className="mb-8">
                  <div className="flex justify-between mb-2">
                    <label className="font-medium text-gray-700">
                      Loan Tenure
                    </label>
                    <div className="flex items-center">
                      <Input
                        type="number"
                        value={loanDetails.tenure}
                        onChange={handleTenureInputChange}
                        className="w-24 text-right"
                      />
                      <span className="ml-2">Years</span>
                    </div>
                  </div>

                  <Slider
                    value={[loanDetails.tenure]}
                    min={1}
                    max={30}
                    step={1}
                    onValueChange={handleTenureChange}
                    className="mb-2 slider-enhanced"
                  />

                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{loanDetails.tenure} {loanDetails.tenure === 1 ? 'Year' : 'Years'}</span>
                    <span>30 Years</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="p-4 bg-[#F2F2F2] rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Monthly EMI</p>
                    <p className="text-xl font-semibold text-[#1752FF]">
                      ₹{formatNumber(emiResult.emi)}
                    </p>
                  </div>

                  <div className="p-4 bg-[#F2F2F2] rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Total Interest</p>
                    <p className="text-xl font-semibold text-[#1752FF]">
                      ₹{formatNumber(emiResult.totalInterest)}
                    </p>
                  </div>

                  <div className="p-4 bg-[#F2F2F2] rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                    <p className="text-xl font-semibold text-[#1752FF]">
                      ₹{formatNumber(emiResult.totalAmount)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button 
                    className="flex-1 bg-[#1752FF] hover:bg-[#103cc9]"
                    onClick={downloadSchedulePDF}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Schedule
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate("/properties/all")}
                  >
                    <Building className="mr-2 h-4 w-4" />
                    Explore Properties
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Result and Charts */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center">
                  <BarChart className="h-5 w-5 mr-2 text-[#1752FF]" />
                  Loan Breakup
                </h2>

                {/* Chart representation */}
                <div className="mb-6 relative">
                  <div className="w-full h-52 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                    <div className="h-full w-full absolute">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: emiResult.totalAmount > 0 ? `${(loanDetails.principal / emiResult.totalAmount) * 100}%` : "0%",
                        }}
                        transition={{ duration: 1 }}
                        className="bg-[#1752FF] h-full absolute left-0 top-0"
                      />
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: emiResult.totalAmount > 0 ? `${(emiResult.totalInterest / emiResult.totalAmount) * 100}%` : "0%",
                        }}
                        transition={{ duration: 1 }}
                        className="bg-[#2C2C2E] h-full absolute left-0 top-0"
                        style={{
                          left: emiResult.totalAmount > 0 ? `${(loanDetails.principal / emiResult.totalAmount) * 100}%` : "0%",
                        }}
                      />
                    </div>

                    <div className="z-10 text-center">
                      <div className="text-4xl font-bold mb-1 text-white">
                        {emiResult.totalAmount > 0 ? Math.round(
                          (emiResult.totalInterest / emiResult.totalAmount) *
                            100,
                        ) : 0}
                        %
                      </div>
                      <p className="text-white text-sm">Interest Component</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-[#1752FF] rounded-sm mr-2" />
                      <span className="text-sm">Principal Amount</span>
                    </div>
                    <div className="font-medium">
                      ₹{formatNumber(loanDetails.principal)} (
                      {Math.round(
                        (loanDetails.principal / emiResult.totalAmount) * 100,
                      )}
                      %)
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-[#2C2C2E] rounded-sm mr-2" />
                      <span className="text-sm">Total Interest</span>
                    </div>
                    <div className="font-medium">
                      ₹{formatNumber(emiResult.totalInterest)} (
                      {Math.round(
                        (emiResult.totalInterest / emiResult.totalAmount) * 100,
                      )}
                      %)
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="flex justify-between items-center">
                      <div className="font-medium">Total Amount</div>
                      <div className="font-bold text-[#1752FF]">
                        ₹{formatNumber(emiResult.totalAmount)}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg mt-6">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <HelpCircle className="h-5 w-5 mr-2 text-[#1752FF]" />
                  Need Help?
                </h2>

                <p className="text-gray-600 text-sm mb-4">
                  Speak with our property loan experts for personalized advice
                  on the best loan options for your budget and property choice.
                </p>

                <Button className="w-full bg-[#1752FF] hover:bg-[#103cc9]" onClick={() => navigate("/contact-us")}>
                  Connect with a Loan Expert{" "}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Amortization Schedule */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-semibold mb-6">
            Loan Amortization Schedule
          </h2>

          <Card className="shadow-lg overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-3 px-4 text-left font-semibold">
                        Period
                      </th>
                      <th className="py-3 px-4 text-right font-semibold">
                        EMI
                      </th>
                      <th className="py-3 px-4 text-right font-semibold">
                        Principal
                      </th>
                      <th className="py-3 px-4 text-right font-semibold">
                        Interest
                      </th>
                      <th className="py-3 px-4 text-right font-semibold">
                        Balance
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {emiResult.amortizationSchedule.map((entry, index) => (
                      <tr
                        key={index}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="py-3 px-4 border-t border-gray-200">
                          {entry.month <= 12
                            ? `Month ${entry.month}`
                            : `Year ${Math.ceil(entry.month / 12)}`}
                        </td>
                        <td className="py-3 px-4 text-right border-t border-gray-200">
                          ₹{formatNumber(entry.emi)}
                        </td>
                        <td className="py-3 px-4 text-right border-t border-gray-200">
                          ₹{formatNumber(entry.principal)}
                        </td>
                        <td className="py-3 px-4 text-right border-t border-gray-200">
                          ₹{formatNumber(entry.interest)}
                        </td>
                        <td className="py-3 px-4 text-right border-t border-gray-200">
                          ₹{formatNumber(entry.balance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Loan Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-semibold mb-6">Home Loan Tips</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="shadow-md">
              <CardContent className="p-6">
                <div className="bg-[#1752FF] bg-opacity-10 w-12 h-12 flex items-center justify-center rounded-full mb-4">
                  <Percent className="h-6 w-6 text-[#1752FF]" />
                </div>
                <h3 className="font-semibold text-lg mb-2">
                  Compare Interest Rates
                </h3>
                <p className="text-gray-600 text-sm">
                  Even a small difference in interest rates can save you lakhs
                  over the loan tenure. Compare rates from multiple lenders
                  before deciding.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardContent className="p-6">
                <div className="bg-[#1752FF] bg-opacity-10 w-12 h-12 flex items-center justify-center rounded-full mb-4">
                  <DollarSign className="h-6 w-6 text-[#1752FF]" />
                </div>
                <h3 className="font-semibold text-lg mb-2">
                  Higher Down Payment
                </h3>
                <p className="text-gray-600 text-sm">
                  Aim for a higher down payment (20-30%) to reduce your loan
                  amount, get better interest rates, and reduce the overall
                  interest paid.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardContent className="p-6">
                <div className="bg-[#1752FF] bg-opacity-10 w-12 h-12 flex items-center justify-center rounded-full mb-4">
                  <Clock className="h-6 w-6 text-[#1752FF]" />
                </div>
                <h3 className="font-semibold text-lg mb-2">
                  Prepay When Possible
                </h3>
                <p className="text-gray-600 text-sm">
                  Make partial prepayments whenever possible, especially in the
                  early years of your loan, to reduce the principal and save on
                  interest.
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="rounded-2xl bg-gradient-to-r from-[#1752FF] to-[#3672ff] p-8 text-white shadow-xl"
        >
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Apply for a Home Loan?
            </h2>
            <p className="mb-8">
              Our property loan experts can help you find the best loan options
              and guide you through the application process. Get pre-approved
              today!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-white text-[#1752FF] hover:bg-gray-100"
                onClick={() => navigate("/contact-us")}
                >
                Connect with a Loan Expert
              </Button>
              <Button
                className="bg-white text-[#1752FF] hover:bg-gray-100"
                onClick={() => navigate("/properties/all")}
              >
                Explore Properties
              </Button>
            </div>
          </div>
        </motion.div>
      </Container>
    </div>
  );
}
