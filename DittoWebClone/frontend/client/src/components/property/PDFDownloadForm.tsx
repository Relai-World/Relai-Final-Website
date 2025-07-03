import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, X, FileText, User, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { normalizePropertyForPDF } from './PropertyResultsNew';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

// Property type interface
interface PropertyData {
  id?: number;
  projectName?: string | null;
  name?: string | null;
  location?: string | null;
  propertyType?: string | null;
  configurations?: string | null;
  minimumBudget?: number | null;
  maximumBudget?: number | null;
  pricePerSqft?: number | null;
  price_per_sqft?: number | null;
  area?: number | null;
  minSizeSqft?: number | null;
  maxSizeSqft?: number | null;
  possessionDate?: string | null;
  possession?: string | null;
  developerName?: string | null;
  builder?: string | null;
  reraNumber?: string | null;
  totalUnits?: number | null;
  amenities?: any[] | null; // Changed to any[] for robustness
  features?: any[] | null;  // Changed to any[] for robustness
  description?: string | null;
  remarksComments?: string | null;
  [key: string]: any;
}

const credentialSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  email: z.string().email('Please enter a valid email address'),
});

type CredentialFormData = z.infer<typeof credentialSchema>;

interface PDFDownloadFormProps {
  properties: PropertyData[];
  isOpen: boolean;
  onClose: () => void;
}

export default function PDFDownloadForm({ properties, isOpen, onClose }: PDFDownloadFormProps) {
  // Normalize incoming properties
  const normalizedProperties = properties.map(mapPropertyData);
  console.log('Normalized Properties:', normalizedProperties);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const form = useForm<CredentialFormData>({
    resolver: zodResolver(credentialSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
    },
  });

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `Rs ${(price / 10000000).toFixed(1)} Cr`;
    } else if (price >= 100000) {
      return `Rs ${(price / 100000).toFixed(1)} L`;
    } else {
      return `Rs ${price.toLocaleString('en-IN')}`;
    }
  };

  const formatBudgetRange = (property: PropertyData) => {
    const minBudget = property.minimumBudget || 0;
    const maxBudget = property.maximumBudget || 0;
    
    if (minBudget > 0 && maxBudget > 0) {
      return `${formatPrice(minBudget)} - ${formatPrice(maxBudget)}`;
    } else if (minBudget > 0) {
      return `From ${formatPrice(minBudget)}`;
    } else if (maxBudget > 0) {
      return `Up to ${formatPrice(maxBudget)}`;
    }
    return "Price on Request";
  };

  // Helper to extract price range and size range for PDF (same as property cards)
  function getPriceRangeForPDF(property: any): string {
    let basePrices: number[] = [];
    const configs = property.configurations || property.Configurations;
    if (Array.isArray(configs)) {
      configs.forEach((conf: any) => {
        if (typeof conf === 'object' && conf !== null && 'BaseProjectPrice' in conf) {
          let val = conf.BaseProjectPrice;
          if (typeof val === 'string') val = Number(val.replace(/[^\d.]/g, ''));
          if (typeof val === 'number' && !isNaN(val)) basePrices.push(val);
        }
      });
    }
    if (basePrices.length === 0) {
      if (typeof property.minimumBudget === 'string') property.minimumBudget = Number(property.minimumBudget.replace(/[^\d.]/g, ''));
      if (typeof property.maximumBudget === 'string') property.maximumBudget = Number(property.maximumBudget.replace(/[^\d.]/g, ''));
      if (typeof property.price === 'string') property.price = Number(property.price.replace(/[^\d.]/g, ''));
      if (typeof property.minimumBudget === 'number' && !isNaN(property.minimumBudget)) basePrices.push(property.minimumBudget);
      if (typeof property.maximumBudget === 'number' && !isNaN(property.maximumBudget)) basePrices.push(property.maximumBudget);
      if (typeof property.price === 'number' && !isNaN(property.price)) basePrices.push(property.price);
    }
    if (basePrices.length > 0) {
      const min = Math.min(...basePrices);
      const max = Math.max(...basePrices);
      if (min === max) {
        return `₹${min.toLocaleString()}`;
      } else {
        return `₹${min.toLocaleString()} - ₹${max.toLocaleString()}`;
      }
    }
    return 'Price not available';
  }

  function getSizeRangeForPDF(property: any): string {
    let sizes: number[] = [];
    const configs = property.configurations || property.Configurations;
    if (Array.isArray(configs)) {
      configs.forEach((conf: any) => {
        if (typeof conf === 'object' && conf !== null) {
          let size = conf.sizeRange || conf.size || conf.area || conf.Size || conf.superBuiltupArea;
          if (typeof size === 'string') size = Number(size.replace(/[^\d.]/g, ''));
          if (typeof size === 'number' && !isNaN(size)) sizes.push(size);
        }
      });
    }
    if (sizes.length === 0) {
      let fallback = property.minSizeSqft || property.area || property.Size;
      if (typeof fallback === 'string') fallback = Number(fallback.replace(/[^\d.]/g, ''));
      if (typeof fallback === 'number' && !isNaN(fallback)) sizes.push(fallback);
    }
    if (sizes.length > 0) {
      const min = Math.min(...sizes);
      const max = Math.max(...sizes);
      if (min === max) {
        return `${min} sq ft`;
      } else {
        return `${min} - ${max} sq ft`;
      }
    }
    return 'N/A';
  }

  // Professional header and footer function with proper spacing
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

  const safeToString = (val: any): string => {
    if (val === null || val === undefined) return 'N/A';
    if (typeof val === 'string') return val.trim();
    if (typeof val === 'number') return val.toString();
    if (typeof val === 'boolean') return val ? 'Yes' : 'No';

    if (Array.isArray(val)) {
      if (val.length === 0) return 'N/A';
      // If array of objects, try to extract a display property
      if (val.every(item => typeof item === 'object' && item !== null)) {
        // Try to get 'name', 'label', or first string property
        return val.map(item => {
          if (typeof item === 'string') return item;
          if (item.name) return String(item.name);
          if (item.label) return String(item.label);
          // Try to find any string property
          for (const key in item) {
            if (typeof item[key] === 'string') return item[key];
          }
          // Fallback to JSON
          try {
            return JSON.stringify(item);
          } catch {
            return '';
          }
        }).filter(Boolean).join(', ') || 'N/A';
      }
      // If array of primitives
      return val.map(safeToString).filter(Boolean).join(', ') || 'N/A';
    }

    if (typeof val === 'object') {
      if (val.name && typeof val.name === 'string') return val.name.trim();
      if (val.label && typeof val.label === 'string') return val.label.trim();
      // Try to find any string property
      for (const key in val) {
        if (typeof val[key] === 'string') return val[key];
      }
      try {
        const jsonStr = JSON.stringify(val);
        if (jsonStr !== '{}') {
          return jsonStr.length > 75 ? jsonStr.substring(0, 72) + '...}' : jsonStr;
        }
      } catch (e) { /* ignore circular refs */ }
      return 'Details available on request';
    }

    try {
      return String(val).trim();
    } catch {
      return 'N/A';
    }
  };

  const generatePDF = async (userData: CredentialFormData) => {
    setIsGenerating(true);
    
    try {
      console.log('Properties passed to PDFDownloadForm:', properties);
      const doc = new jsPDF('p', 'mm', 'a4');
      
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 20;
      const headerHeight = 30;
      const footerHeight = 30;
      const contentWidth = pageWidth - (2 * margin);
      const maxContentY = pageHeight - footerHeight - 10; // 10mm buffer above footer
      let yPosition = headerHeight + 15; // Start below header with buffer
      let pageNumber = 1;
      
      let totalPages = 0;
      
      addHeaderFooter(doc, pageNumber, 1);

      // --- TITLE PAGE ---
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      const title = 'PROPERTY INVESTMENT REPORT';
      const titleWidth = doc.getTextWidth(title);
      doc.text(title, (pageWidth - titleWidth) / 2, yPosition + 20);
      
      yPosition += 40;
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(23, 82, 255);
      const subtitle = 'Comprehensive Property Analysis & Investment Opportunities';
      const subtitleWidth = doc.getTextWidth(subtitle);
      doc.text(subtitle, (pageWidth - subtitleWidth) / 2, yPosition);
      
      yPosition += 40;
      
      doc.setDrawColor(23, 82, 255);
      doc.setLineWidth(1);
      doc.rect(margin, yPosition, contentWidth, 50);
      doc.setFillColor(248, 249, 250);
      doc.rect(margin + 1, yPosition + 1, contentWidth - 2, 48, 'F');
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('CLIENT INFORMATION', margin + 10, yPosition + 15);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Name: ${userData.name}`, margin + 10, yPosition + 25);
      doc.text(`Phone: ${userData.phone}`, margin + 10, yPosition + 32);
      doc.text(`Email: ${userData.email}`, margin + 10, yPosition + 39);
      
      yPosition += 70;
      
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      const reportDate = `Report Generated: ${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;
      const dateWidth = doc.getTextWidth(reportDate);
      doc.text(reportDate, (pageWidth - dateWidth) / 2, yPosition);
      
      yPosition += 30;
      
      doc.setFillColor(255, 248, 220);
      doc.rect(margin, yPosition, contentWidth, 35, 'F');
      doc.setDrawColor(255, 193, 7);
      doc.setLineWidth(0.5);
      doc.rect(margin, yPosition, contentWidth, 35);
      
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text('IMPORTANT DISCLAIMER:', margin + 5, yPosition + 8);
      doc.setFont('helvetica', 'normal');
      const disclaimerText = 'This report is prepared for informational purposes only. Property prices, availability, and details are subject to change. Please verify all information independently before making investment decisions.';
      const splitDisclaimer = doc.splitTextToSize(disclaimerText, contentWidth - 10);
      doc.text(splitDisclaimer, margin + 5, yPosition + 15);

      // --- EXECUTIVE SUMMARY PAGE ---
      doc.addPage();
      pageNumber++;
      addHeaderFooter(doc, pageNumber, 1); 
      yPosition = 45;

      doc.setFontSize(18);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text('EXECUTIVE SUMMARY', margin, yPosition);
      
      yPosition += 15;
      
      doc.setFillColor(248, 249, 250);
      doc.rect(margin, yPosition, contentWidth, 100, 'F');
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.rect(margin, yPosition, contentWidth, 100);
      
      yPosition += 15;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Portfolio Overview - ${normalizedProperties.length} Properties Analyzed`, margin + 5, yPosition);
      yPosition += 12;
      doc.setFont('helvetica', 'normal');
      
      const propertyTypes: { [key: string]: number } = {};
      normalizedProperties.forEach(p => {
        const type = safeToString(p.propertyType) || 'Other';
        propertyTypes[type] = (propertyTypes[type] || 0) + 1;
      });

      doc.text('Property Distribution:', margin + 5, yPosition);
      yPosition += 8;
      Object.entries(propertyTypes).forEach(([type, count]) => {
        doc.text(`• ${type}: ${count} properties`, margin + 10, yPosition);
        yPosition += 6;
      });
      yPosition += 5;
      
      const validBudgets = normalizedProperties.filter(p => p.minimumBudget && typeof p.minimumBudget === 'number');
      if (validBudgets.length > 0) {
        const budgets = validBudgets.map(p => p.minimumBudget as number);
        const minPrice = Math.min(...budgets);
        const maxPrice = Math.max(...budgets);
        const avgPrice = budgets.reduce((sum, price) => sum + price, 0) / budgets.length;
        doc.text('Investment Range Analysis:', margin + 5, yPosition);
        yPosition += 6;
        doc.text(`• Price Range: ${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`, margin + 10, yPosition);
        yPosition += 6;
        doc.text(`• Average Starting Price: ${formatPrice(avgPrice)}`, margin + 10, yPosition);
        yPosition += 6;
      } else {
        doc.text('Investment Range: Contact for detailed pricing', margin + 5, yPosition);
        yPosition += 6;
      }
      yPosition += 5;
      
      const validLocations = normalizedProperties.map(p => safeToString(p.location)).filter(loc => loc && loc !== 'N/A');
      const uniqueLocations = Array.from(new Set(validLocations));
      doc.text('Geographic Coverage:', margin + 5, yPosition);
      yPosition += 6;
      doc.text(`• ${uniqueLocations.length} prime locations covered`, margin + 10, yPosition);
      yPosition += 6;
      if (uniqueLocations.length <= 3) {
        uniqueLocations.forEach(location => {
          doc.text(`• ${location}`, margin + 10, yPosition);
          yPosition += 5;
        });
      } else {
        doc.text(`• Key areas: ${uniqueLocations.slice(0, 3).join(', ')} and ${uniqueLocations.length - 3} more`, margin + 10, yPosition);
        yPosition += 5;
      }
      yPosition += 20;

      // --- PROPERTY OVERVIEW SUMMARY ---
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('PROPERTY OVERVIEW SUMMARY', margin, yPosition);
      yPosition += 15;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      normalizedProperties.slice(0, 10).forEach((property, index) => {
        if (yPosition > maxContentY - 20) {
          doc.addPage(); pageNumber++;
          addHeaderFooter(doc, pageNumber, 1);
          yPosition = headerHeight + 15;
        }
        doc.setFont('helvetica', 'bold');
        doc.text(`${index + 1}. ${safeToString(property.projectName)}`, margin, yPosition);
        yPosition += 6;
        doc.setFont('helvetica', 'normal');
        doc.text(`Location: ${safeToString(property.location)}`, margin + 5, yPosition);
        yPosition += 4;
        doc.text(`Type: ${safeToString(property.propertyType)} | Config: ${safeToString(property.configurations)}`, margin + 5, yPosition);
        yPosition += 4;
        doc.text(`Price: ${formatBudgetRange(property)}`, margin + 5, yPosition);
        yPosition += 8;
      });
      if (normalizedProperties.length > 10) {
        yPosition += 5;
        doc.setFont('helvetica', 'italic');
        doc.text(`... and ${normalizedProperties.length - 10} more properties detailed below`, margin, yPosition);
        yPosition += 10;
      }

      // --- DETAILED PROPERTY INFORMATION ---
      let currentPropertyIndex = 0;
      const maxPropertiesPerDetailPage = 3;

      while (currentPropertyIndex < normalizedProperties.length) {
        doc.addPage();
        pageNumber++;
        addHeaderFooter(doc, pageNumber, 1); 
        yPosition = headerHeight + 15;

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('DETAILED PROPERTY INFORMATION', margin, yPosition);
        yPosition += 15;

        for (let i = 0; i < maxPropertiesPerDetailPage && currentPropertyIndex < normalizedProperties.length; i++) {
          const property = normalizedProperties[currentPropertyIndex];
          if (yPosition > maxContentY - 60) { break; }
          
          doc.setFillColor(245, 245, 245);
          doc.rect(margin, yPosition, contentWidth, 12, 'F');
          doc.setDrawColor(23, 82, 255);
          doc.setLineWidth(0.5);
          doc.rect(margin, yPosition, contentWidth, 12);
          
          doc.setTextColor(0, 0, 0);
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text(`${currentPropertyIndex + 1}. ${safeToString(property.projectName)}`, margin + 5, yPosition + 8);
          yPosition += 18;
          
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          
          const details: [string, string][] = [
            ['Developer:', safeToString(property.developerName)],
            ['Location:', safeToString(property.location)],
            ['Property Type:', safeToString(property.propertyType)],
            ['Configurations:', safeToString(property.configurations)],
            ['Price Range:', formatBudgetRange(property)],
            ['Size Range:', property.minSizeSqft && property.maxSizeSqft ? `${property.minSizeSqft} - ${property.maxSizeSqft} sq ft` : 'Contact for details'],
            ['RERA Number:', safeToString(property.reraNumber)],
            ['Total Units:', safeToString(property.totalUnits)],
            ['Possession:', safeToString(property.possessionDate)]
          ];

          details.forEach(([label, value]) => {
            doc.setFont('helvetica', 'bold');
            doc.text(label, margin + 5, yPosition);
            doc.setFont('helvetica', 'normal');
            const wrappedValue = doc.splitTextToSize(value, contentWidth - 45); // Wrap long values
            doc.text(wrappedValue, margin + 40, yPosition);
            yPosition += (Array.isArray(wrappedValue) ? wrappedValue.length : 1) * 5 + 1; // Adjust y based on lines
          });

          const renderSection = (title: string, data: any[] | null | undefined) => {
            // Debug log for development
            // console.log('renderSection', title, data, safeToString(data));
            if (data && Array.isArray(data) && data.length > 0) {
              if (yPosition > maxContentY - 25) { return false; }
              yPosition += 5;
              doc.setFont('helvetica', 'bold');
              doc.text(title, margin + 5, yPosition);
              yPosition += 6;
              doc.setFont('helvetica', 'normal');
              let text = safeToString(data);
              if (Array.isArray(text)) {
                text = text.join(', ');
              }
              text = String(text).replace(/\[\d+\]/g, ''); // Ensure string and clean
              if (text && text !== 'N/A') {
                const wrappedText = doc.splitTextToSize(text, contentWidth - 10);
                wrappedText.forEach((line: string) => {
                  if (yPosition > maxContentY - 10) return;
                  doc.text(line, margin + 5, yPosition);
                  yPosition += 5;
                });
                yPosition += 5;
              }
            }
            return true;
          };

          if(!renderSection('Amenities & Features:', property.amenities)) { break; };
          if(!renderSection('Additional Features:', property.features)) { break; };
          
          const description = property.description || property.remarksComments;
          if (description && typeof description === 'string' && description.trim()) {
            if (yPosition > maxContentY - 20) { break; }
            doc.setFont('helvetica', 'bold');
            doc.text('Description:', margin + 5, yPosition);
            yPosition += 6;
            doc.setFont('helvetica', 'normal');
            const wrappedDescription = doc.splitTextToSize(description.trim(), contentWidth - 10);
            wrappedDescription.forEach((line: string) => {
              if (yPosition > maxContentY - 10) return;
              doc.text(line, margin + 5, yPosition);
              yPosition += 5;
            });
            yPosition += 10;
          } else {
            yPosition += 10;
          }
          
          if (i < maxPropertiesPerDetailPage - 1 && currentPropertyIndex + 1 < normalizedProperties.length) {
            doc.setDrawColor(200, 200, 200);
            doc.setLineWidth(0.5);
            doc.line(margin, yPosition, pageWidth - margin, yPosition);
            yPosition += 10;
          }
          
          currentPropertyIndex++;
          if (yPosition > pageHeight - 60) { break; }
        }
      }

      // --- FINALIZATION ---
      totalPages = pageNumber;
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        const footerStartY = pageHeight - footerHeight;
        doc.setFillColor(255, 255, 255);
        doc.rect(0, footerStartY, pageWidth, footerHeight, 'F');
        addHeaderFooter(doc, i, totalPages);
      }

      const fileName = `Relai_Property_Report_${userData.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      toast({
        title: "PDF Generated Successfully",
        description: `Property report has been downloaded as ${fileName}`,
        variant: "default",
      });

      onClose();
      form.reset();

    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "PDF Generation Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred while generating the PDF.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const onSubmit = async (data: CredentialFormData) => {
    await generatePDF(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Download Property Report
          </DialogTitle>
        </DialogHeader>

        <div className="text-center py-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
            <p className="text-blue-800 font-medium">
              Generate Professional PDF Report
            </p>
            <p className="text-blue-600 text-sm mt-1">
              Get a comprehensive analysis of {normalizedProperties.length} matching properties with detailed information and amenities.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><User className="h-4 w-4" />Full Name</FormLabel>
                    <FormControl><Input placeholder="Enter your full name" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
              )}/>
              <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Phone className="h-4 w-4" />Phone Number</FormLabel>
                    <FormControl><Input placeholder="Enter your phone number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
              )}/>
              <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Mail className="h-4 w-4" />Email Address</FormLabel>
                    <FormControl><Input type="email" placeholder="Enter your email address" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
              )}/>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={isGenerating}>Cancel</Button>
                <Button type="submit" className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800" disabled={isGenerating}>
                  {isGenerating ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="mr-2">
                      <Download className="h-4 w-4" />
                    </motion.div>
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  {isGenerating ? 'Generating...' : 'Download PDF'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function mapPropertyData(raw: any) {
  return {
    projectName: raw.ProjectName || raw.projectName || raw.name || "N/A",
    developerName: raw.BuilderName || raw.developerName || raw.builder || "N/A",
    location: raw.Area || raw.location || "N/A",
    propertyType: raw.PropertyType || raw.propertyType || "N/A",
    configurations: Array.isArray(raw.configurations)
      ? raw.configurations.map((cfg: any) => cfg.name || cfg.type || JSON.stringify(cfg)).join(', ')
      : (raw.configurations || "N/A"),
    minimumBudget: raw.Min_Price || raw.minimumBudget || null,
    maximumBudget: raw.Max_Price || raw.maximumBudget || null,
    pricePerSqft: raw.Price_per_sft || raw.pricePerSqft || raw.price_per_sqft || null,
    minSizeSqft: raw.Min_Size || raw.minSizeSqft || null,
    maxSizeSqft: raw.Max_Size || raw.maxSizeSqft || null,
    possessionDate: raw.Possession_date || raw.possessionDate || raw.possession || null,
    reraNumber: raw.RERA_Number || raw.reraNumber || null,
    totalUnits: raw.Total_Units || raw.totalUnits || null,
    amenities: raw.amenities || [],
    features: raw.features || [],
    description: raw.Description || raw.description || null,
    remarksComments: raw.Remarks || raw.remarksComments || null,
    // ...add more fields as needed
  };
}