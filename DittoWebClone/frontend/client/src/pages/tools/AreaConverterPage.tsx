import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Container from '@/components/ui/container';
import { MoveHorizontal, Copy, Check, Calculator, Table, RefreshCw, HelpCircle, Download } from 'lucide-react';
import { useLocation } from 'wouter';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Define conversion units
const areaUnits = [
  { id: 'sqft', name: 'Square Feet (sq ft)', conversionToSqft: 1 },
  { id: 'sqm', name: 'Square Meters (sq m)', conversionToSqft: 10.7639 },
  { id: 'sqyd', name: 'Square Yards (sq yd)', conversionToSqft: 9 },
  { id: 'acre', name: 'Acres', conversionToSqft: 43560 },
  { id: 'hectare', name: 'Hectares', conversionToSqft: 107639 },
  { id: 'bigha', name: 'Bigha (Varies by region)', conversionToSqft: 27000 }, // Approximate, varies by region
  { id: 'ground', name: 'Ground (South India)', conversionToSqft: 2400 }, // For South India
  { id: 'cent', name: 'Cent', conversionToSqft: 435.6 },
  { id: 'marla', name: 'Marla (North India)', conversionToSqft: 272.25 }, // For North India
  { id: 'kanal', name: 'Kanal', conversionToSqft: 5445 },
  { id: 'biswa', name: 'Biswa', conversionToSqft: 1350 }, // Approximate, varies by region
  { id: 'gunta', name: 'Gunta (Karnataka)', conversionToSqft: 1089 }, // For Karnataka
];

const commonConversions = [
  { source: 'sqft', target: 'sqm', value: 100 },
  { source: 'sqm', target: 'sqft', value: 100 },
  { source: 'sqft', target: 'acre', value: 10000 },
  { source: 'acre', target: 'sqft', value: 1 },
  { source: 'ground', target: 'sqft', value: 1 },
  { source: 'bigha', target: 'acre', value: 1 },
];

export default function AreaConverterPage() {
  // Set page title and meta description when component mounts
  useEffect(() => {
    document.title = "Convert Property Area Units Instantly | Real Estate Area Calculator – Relai";

    // Set meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Easily convert between square feet, square yards, acres, and more. Use Relai’s free area converter tool for accurate property measurement conversions.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Easily convert between square feet, square yards, acres, and more. Use Relai’s free area converter tool for accurate property measurement conversions.';
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
  
  const [fromUnit, setFromUnit] = useState('sqft');
  const [toUnit, setToUnit] = useState('sqm');
  const [inputValue, setInputValue] = useState<string>('100');
  const [result, setResult] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  
  // Handle conversion
  const convertArea = () => {
    const value = parseFloat(inputValue);
    if (isNaN(value)) {
      setResult(0);
      return;
    }
    
    const fromUnitData = areaUnits.find(unit => unit.id === fromUnit);
    const toUnitData = areaUnits.find(unit => unit.id === toUnit);
    
    if (fromUnitData && toUnitData) {
      // Convert input to sq ft, then to target unit
      const sqft = value * fromUnitData.conversionToSqft;
      const convertedValue = sqft / toUnitData.conversionToSqft;
      setResult(convertedValue);
    }
  };
  
  // Handle form input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };
  
  const handleFromUnitChange = (value: string) => {
    setFromUnit(value);
  };
  
  const handleToUnitChange = (value: string) => {
    setToUnit(value);
  };
  
  // Swap from and to units
  const swapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };
  
  // Copy result to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(result.toFixed(4).toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Format number for display
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + ' million';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(2) + ' thousand';
    } else {
      return num.toFixed(4);
    }
  };
  
  // Handle preset values
  const applyPresetConversion = (source: string, target: string, value: number) => {
    setFromUnit(source);
    setToUnit(target);
    setInputValue(value.toString());
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

  // Download Area Unit Conversion Table as PDF
  const downloadConversionTablePDF = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    const headerHeight = 30;
    const footerHeight = 30;
    const maxContentY = pageHeight - footerHeight - 10;
    let yPosition = headerHeight + 15;
    let pageNumber = 1;
    const totalPages = 1;
    
    // Add header and footer
    addHeaderFooter(doc, pageNumber, totalPages);
    
    // TITLE PAGE
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    const title = 'AREA UNIT CONVERSION TABLE';
    const titleWidth = doc.getTextWidth(title);
    doc.text(title, (pageWidth - titleWidth) / 2, yPosition + 20);
    
    yPosition += 50;
    
    // Description
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    const description = 'Comprehensive conversion table for property area units commonly used in Indian real estate';
    const descWidth = doc.getTextWidth(description);
    doc.text(description, (pageWidth - descWidth) / 2, yPosition);
    
    yPosition += 30;
    
    // Create table data
    const tableData = [
      ['1 Square Foot', '1', '0.0929', '0.1111', '0.00002296'],
      ['1 Square Meter', '10.7639', '1', '1.196', '0.000247'],
      ['1 Square Yard', '9', '0.8361', '1', '0.0002066'],
      ['1 Acre', '43,560', '4,046.86', '4,840', '1'],
      ['1 Hectare', '107,639', '10,000', '11,960', '2.471'],
      ['1 Bigha (Approx.)', '27,000', '2,508.4', '3,000', '0.62'],
      ['1 Ground (South India)', '2,400', '223', '267', '0.055'],
      ['1 Cent', '435.6', '40.47', '48.4', '0.01'],
      ['1 Marla (North India)', '272.25', '25.29', '30.25', '0.00625'],
      ['1 Kanal', '5,445', '505.86', '605', '0.125'],
      ['1 Biswa', '1,350', '125.42', '150', '0.031'],
      ['1 Gunta (Karnataka)', '1,089', '101.17', '121', '0.025']
    ];
    
    autoTable(doc, {
      head: [['Unit', 'Square Feet', 'Square Meters', 'Square Yards', 'Acres']],
      body: tableData,
      startY: yPosition,
      styles: {
        fontSize: 8,
        cellPadding: 3,
        font: 'helvetica'
      },
      headStyles: {
        fillColor: [23, 82, 255],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 9
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
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 30 },
        2: { cellWidth: 30 },
        3: { cellWidth: 30 },
        4: { cellWidth: 30 }
      }
    });
    
    // Add notes section
    yPosition = (doc as any).lastAutoTable.finalY + 20;
    
    if (yPosition > maxContentY - 40) {
      doc.addPage();
      addHeaderFooter(doc, 2, 2);
      yPosition = headerHeight + 15;
    }
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Important Notes:', margin, yPosition);
    yPosition += 10;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const notes = [
      '• Bigha and Biswa measurements vary by region across India',
      '• Ground is commonly used in South India, particularly Tamil Nadu and Karnataka',
      '• Marla and Kanal are primarily used in North India, especially Punjab and Haryana',
      '• Gunta measurements may vary slightly between different states',
      '• Always verify local measurement standards for accurate conversions'
    ];
    
    notes.forEach(note => {
      if (yPosition > maxContentY - 10) return;
      doc.text(note, margin, yPosition);
      yPosition += 6;
    });
    
    // Report Generation Date
    yPosition += 15;
    if (yPosition <= maxContentY - 15) {
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      const reportDate = `Generated: ${new Date().toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}`;
      const dateWidth = doc.getTextWidth(reportDate);
      doc.text(reportDate, (pageWidth - dateWidth) / 2, yPosition);
    }
    
    // Save the PDF
    doc.save(`area_unit_conversion_table_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Calculate on input or unit change
  useState(() => {
    convertArea();
  });
  
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
              <MoveHorizontal className="h-12 w-12 text-[#1752FF]" />
            </motion.div>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Property Area Converter
          </h1>
          <p className="text-gray-600 max-w-3xl mx-auto mb-8">
            Convert between different property area units easily. Our tool supports all Indian and international area measurement units used in real estate.
          </p>
        </motion.div>
        
        {/* Converter Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-3xl mx-auto mb-12"
        >
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center mb-6">
                {/* From Unit Section */}
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
                  <div className="grid grid-cols-1 gap-2">
                    <Input 
                      type="number" 
                      value={inputValue}
                      onChange={handleInputChange}
                      onBlur={convertArea}
                      placeholder="Enter value"
                      className="w-full"
                    />
                    <Select value={fromUnit} onValueChange={handleFromUnitChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {areaUnits.map(unit => (
                          <SelectItem key={unit.id} value={unit.id}>{unit.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Swap Button */}
                <div className="md:col-span-1 flex justify-center">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={swapUnits}
                    className="rounded-full"
                  >
                    <RefreshCw className="h-5 w-5" />
                  </Button>
                </div>
                
                {/* To Unit Section */}
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="relative">
                      <Input 
                        type="text" 
                        value={formatNumber(result)}
                        readOnly
                        className="w-full pr-10 bg-gray-50"
                      />
                      <button 
                        onClick={copyToClipboard}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                      </button>
                    </div>
                    <Select value={toUnit} onValueChange={handleToUnitChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {areaUnits.map(unit => (
                          <SelectItem key={unit.id} value={unit.id}>{unit.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <Button 
                className="w-full bg-[#1752FF] hover:bg-[#103cc9]"
                onClick={convertArea}
              >
                <Calculator className="h-5 w-5 mr-2" />
                Convert Area
              </Button>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Common Conversions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-3xl mx-auto mb-12"
        >
          <h2 className="text-xl font-semibold mb-4">Common Conversions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {commonConversions.map((conversion, index) => {
              const fromUnitData = areaUnits.find(unit => unit.id === conversion.source);
              const toUnitData = areaUnits.find(unit => unit.id === conversion.target);
              const sqft = conversion.value * (fromUnitData?.conversionToSqft || 1);
              const convertedValue = sqft / (toUnitData?.conversionToSqft || 1);
              
              return (
                <Button
                  key={index}
                  variant="outline"
                  className="text-left h-auto py-3 px-4"
                  onClick={() => applyPresetConversion(conversion.source, conversion.target, conversion.value)}
                >
                  <div>
                    <div className="font-medium">{conversion.value} {fromUnitData?.id.toUpperCase()}</div>
                    <div className="text-sm text-gray-500">= {convertedValue.toFixed(2)} {toUnitData?.id.toUpperCase()}</div>
                  </div>
                </Button>
              );
            })}
          </div>
        </motion.div>
        
        {/* Conversion Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Area Unit Conversion Table</h2>
            <Button 
              variant="outline" 
              size="sm"
              onClick={downloadConversionTablePDF}
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
          
          <Card className="shadow-lg overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-3 px-4 text-left font-semibold">Unit</th>
                      <th className="py-3 px-4 text-right font-semibold">Square Feet (sq ft)</th>
                      <th className="py-3 px-4 text-right font-semibold">Square Meters (sq m)</th>
                      <th className="py-3 px-4 text-right font-semibold">Square Yards (sq yd)</th>
                      <th className="py-3 px-4 text-right font-semibold">Acres</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white">
                      <td className="py-3 px-4 border-t border-gray-200 font-medium">1 Square Foot</td>
                      <td className="py-3 px-4 text-right border-t border-gray-200">1</td>
                      <td className="py-3 px-4 text-right border-t border-gray-200">0.0929</td>
                      <td className="py-3 px-4 text-right border-t border-gray-200">0.1111</td>
                      <td className="py-3 px-4 text-right border-t border-gray-200">0.00002296</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="py-3 px-4 border-t border-gray-200 font-medium">1 Square Meter</td>
                      <td className="py-3 px-4 text-right border-t border-gray-200">10.7639</td>
                      <td className="py-3 px-4 text-right border-t border-gray-200">1</td>
                      <td className="py-3 px-4 text-right border-t border-gray-200">1.196</td>
                      <td className="py-3 px-4 text-right border-t border-gray-200">0.000247</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="py-3 px-4 border-t border-gray-200 font-medium">1 Square Yard</td>
                      <td className="py-3 px-4 text-right border-t border-gray-200">9</td>
                      <td className="py-3 px-4 text-right border-t border-gray-200">0.8361</td>
                      <td className="py-3 px-4 text-right border-t border-gray-200">1</td>
                      <td className="py-3 px-4 text-right border-t border-gray-200">0.0002066</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="py-3 px-4 border-t border-gray-200 font-medium">1 Acre</td>
                      <td className="py-3 px-4 text-right border-t border-gray-200">43,560</td>
                      <td className="py-3 px-4 text-right border-t border-gray-200">4,046.86</td>
                      <td className="py-3 px-4 text-right border-t border-gray-200">4,840</td>
                      <td className="py-3 px-4 text-right border-t border-gray-200">1</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="py-3 px-4 border-t border-gray-200 font-medium">1 Hectare</td>
                      <td className="py-3 px-4 text-right border-t border-gray-200">107,639</td>
                      <td className="py-3 px-4 text-right border-t border-gray-200">10,000</td>
                      <td className="py-3 px-4 text-right border-t border-gray-200">11,960</td>
                      <td className="py-3 px-4 text-right border-t border-gray-200">2.471</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="py-3 px-4 border-t border-gray-200 font-medium">1 Bigha (Approx.)</td>
                      <td className="py-3 px-4 text-right border-t border-gray-200">27,000</td>
                      <td className="py-3 px-4 text-right border-t border-gray-200">2,508.4</td>
                      <td className="py-3 px-4 text-right border-t border-gray-200">3,000</td>
                      <td className="py-3 px-4 text-right border-t border-gray-200">0.62</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="py-3 px-4 border-t border-gray-200 font-medium">1 Ground (South India)</td>
                      <td className="py-3 px-4 text-right border-t border-gray-200">2,400</td>
                      <td className="py-3 px-4 text-right border-t border-gray-200">223</td>
                      <td className="py-3 px-4 text-right border-t border-gray-200">267</td>
                      <td className="py-3 px-4 text-right border-t border-gray-200">0.055</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Indian Units Explanation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-12"
        >
          <h2 className="text-xl font-semibold mb-4">Understanding Indian Land Measurement Units</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-md">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-3 flex items-center">
                  <Table className="h-5 w-5 mr-2 text-[#1752FF]" />
                  North Indian Units
                </h3>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex flex-col">
                    <span className="font-medium">Bigha</span>
                    <span>Varies across regions. In Uttar Pradesh, 1 Bigha ≈ 27,000 sq ft (varies by region).</span>
                  </li>
                  <li className="flex flex-col">
                    <span className="font-medium">Marla</span>
                    <span>Common in North India. 1 Marla ≈ 272.25 sq ft or 25.29 sq m.</span>
                  </li>
                  <li className="flex flex-col">
                    <span className="font-medium">Kanal</span>
                    <span>Used in Himachal, Punjab & Haryana. 1 Kanal = 20 Marlas ≈ 5,445 sq ft.</span>
                  </li>
                  <li className="flex flex-col">
                    <span className="font-medium">Biswa</span>
                    <span>Used in Uttar Pradesh, Haryana, etc. 1 Biswa ≈ 1,350 sq ft (variable by region).</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="shadow-md">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-3 flex items-center">
                  <Table className="h-5 w-5 mr-2 text-[#1752FF]" />
                  South Indian Units
                </h3>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex flex-col">
                    <span className="font-medium">Ground</span>
                    <span>Common in Tamil Nadu. 1 Ground = 2,400 sq ft or 223 sq m.</span>
                  </li>
                  <li className="flex flex-col">
                    <span className="font-medium">Cent</span>
                    <span>Used in Kerala, Tamil Nadu. 1 Cent = 435.6 sq ft or 40.47 sq m.</span>
                  </li>
                  <li className="flex flex-col">
                    <span className="font-medium">Gunta</span>
                    <span>Used in Karnataka. 1 Gunta = 1,089 sq ft or 101.17 sq m.</span>
                  </li>
                  <li className="flex flex-col">
                    <span className="font-medium">Ankanam</span>
                    <span>Used in Andhra Pradesh & Telangana. 1 Ankanam ≈ 72 sq ft.</span>
                  </li>
                </ul>
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
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Need Help With Property Measurements?</h2>
            <p className="mb-8">
              Our property experts can help you understand exact property dimensions and area calculations during property viewing. Schedule a site visit with our experts today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-white text-[#1752FF] hover:bg-gray-100 flex items-center" onClick={() => navigate("/contact-us")}>
                <HelpCircle className="mr-2 h-4 w-4" />
                Speak to a Property Expert
              </Button>
              <Button 
                className="bg-white text-[#1752FF] hover:bg-gray-100"
                onClick={() => navigate('/properties/all')}
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