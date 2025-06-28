import Container from "@/components/ui/container";
import { Card, CardContent } from "@/components/ui/card";
import CallButton from "@/components/shared/CallButton";
import WhatsAppChatButton from "@/components/shared/WhatsAppChatButton";
import { Home, Building2, TrendingUp, MapPin } from "lucide-react";

export default function PropertyOptions() {
  return (
    <section className="py-12 bg-[#F2F2F2]">
      <Container>
        <div className="text-center mb-8">
          <span className="text-[#1752FF] uppercase font-semibold text-sm tracking-wider">relai offers</span>
          <h2 className="text-2xl md:text-3xl font-bold mt-2">Personalized Real Estate Services</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Residential Properties Card */}
          <Card className="overflow-hidden shadow-lg">
            <CardContent className="p-6">
              <div className="flex justify-center mb-6">
                <div className="bg-[#F5F5DC] p-4 rounded-full">
                  <Home className="h-12 w-12 text-[#1752FF]" />
                </div>
              </div>
              
              <h3 className="text-xl font-semibold mb-3 text-center">Residential Properties</h3>
              
              <p className="text-gray-600 mb-6">
                Find your perfect home with our comprehensive selection of residential properties. From cozy apartments to luxury houses, our experts will guide you through the entire buying process.
              </p>
              
              <div className="space-y-3">
                <CallButton className="w-full bg-[#1752FF] hover:bg-[#103cc9]" />
                <WhatsAppChatButton className="w-full border-[#1752FF] text-[#1752FF]" />
              </div>
            </CardContent>
          </Card>
          
          {/* Commercial Properties Card */}
          <Card className="overflow-hidden shadow-lg">
            <CardContent className="p-6">
              <div className="flex justify-center mb-6">
                <div className="bg-[#F5F5DC] p-4 rounded-full">
                  <Building2 className="h-12 w-12 text-[#1752FF]" />
                </div>
              </div>
              
              <h3 className="text-xl font-semibold mb-3 text-center">Commercial Properties</h3>
              
              <p className="text-gray-600 mb-6">
                Grow your business with the right commercial space. From retail storefronts to office buildings, our commercial property experts will help you find the perfect location for your business needs.
              </p>
              
              <div className="space-y-3">
                <CallButton className="w-full bg-[#1752FF] hover:bg-[#103cc9]" />
                <WhatsAppChatButton className="w-full border-[#1752FF] text-[#1752FF]" />
              </div>
            </CardContent>
          </Card>
        </div>
      </Container>
    </section>
  );
}
