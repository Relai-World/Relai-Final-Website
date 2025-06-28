import { useState } from "react";
import Container from "@/components/ui/container";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PARTNERS } from "@/lib/constants";
import { Building, Building2, Home, MapPin } from "lucide-react";

export default function PropertySearch() {
  const [propertyType, setPropertyType] = useState("residential");
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState("");

  return (
    <section className="py-12 md:py-16 bg-[#F2F2F2]">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-4xl font-bold mb-4">Find Your Dream Property</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Search thousands of listings to find the perfect property for you with our comprehensive search tools.
          </p>
        </div>
        
        <Card className="max-w-3xl mx-auto shadow-lg">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-1">Property Type</Label>
                <Select value={propertyType} onValueChange={setPropertyType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="residential">Residential Property</SelectItem>
                    <SelectItem value="commercial">Commercial Property</SelectItem>
                    <SelectItem value="investment">Investment Property</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-1">Location</Label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newyork">New York</SelectItem>
                    <SelectItem value="losangeles">Los Angeles</SelectItem>
                    <SelectItem value="chicago">Chicago</SelectItem>
                    <SelectItem value="miami">Miami</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-1">Budget</Label>
                <Select value={budget} onValueChange={setBudget}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select budget" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under500k">Under $500k</SelectItem>
                    <SelectItem value="500k-1m">$500k - $1M</SelectItem>
                    <SelectItem value="1m-2m">$1M - $2M</SelectItem>
                    <SelectItem value="over2m">Over $2M</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button className="w-full bg-[#1752FF] hover:bg-[#103cc9]">
              Search Properties
            </Button>
            
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Popular Categories</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <a href="#" className="flex items-center p-3 border border-gray-200 rounded-md hover:border-[#1752FF] transition">
                  <div className="bg-[#F5F5DC] p-2 rounded-md mr-3">
                    <Home className="h-6 w-6 text-[#1752FF]" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-600">{PARTNERS.RESIDENTIAL.name}</div>
                    <div className="font-medium text-sm">{PARTNERS.RESIDENTIAL.services[0]}</div>
                  </div>
                </a>
                
                <a href="#" className="flex items-center p-3 border border-gray-200 rounded-md hover:border-[#1752FF] transition">
                  <div className="bg-[#F5F5DC] p-2 rounded-md mr-3">
                    <Building2 className="h-6 w-6 text-[#1752FF]" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-600">{PARTNERS.COMMERCIAL.name}</div>
                    <div className="font-medium text-sm">{PARTNERS.COMMERCIAL.services[0]}</div>
                  </div>
                </a>
                
                <a href="#" className="flex items-center p-3 border border-gray-200 rounded-md hover:border-[#1752FF] transition">
                  <div className="bg-[#F5F5DC] p-2 rounded-md mr-3">
                    <Building className="h-6 w-6 text-[#1752FF]" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-600">{PARTNERS.INVESTMENT.name}</div>
                    <div className="font-medium text-sm">{PARTNERS.INVESTMENT.services[0]}</div>
                  </div>
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </Container>
    </section>
  );
}
