import { Check, Home, Building2, Handshake } from "lucide-react";
import Container from "@/components/ui/container";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CallButton from "@/components/shared/CallButton";
import WhatsAppChatButton from "@/components/shared/WhatsAppChatButton";

export default function DittoExperience() {
  return (
    <section className="py-12 md:py-20">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-4xl font-bold">
            The relai Experience
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="bg-[#1752FF] bg-opacity-10 text-[#1752FF] font-bold rounded-full w-10 h-10 flex items-center justify-center mb-4">
                01
              </div>

              <h3 className="text-xl font-semibold mb-3">
                Expert Property Guidance
              </h3>

              <p className="text-gray-600 mb-6">
                Consult with our certified real estate experts to find the
                perfect property that matches your needs and budget.
              </p>

              <div className="space-y-3 mb-6">
                <CallButton className="w-full bg-[#1752FF] hover:bg-[#103cc9] text-white" />
                <WhatsAppChatButton className="w-full border-[#1752FF] text-[#1752FF]" />
              </div>

              <div className="flex flex-wrap gap-4">
                <Badge
                  variant="outline"
                  className="bg-[#F5F5DC] px-3 py-1 rounded"
                >
                  Free Consultation
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-[#F5F5DC] px-3 py-1 rounded"
                >
                  No Pressure
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-[#F5F5DC] px-3 py-1 rounded"
                >
                  Expert Advice
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Step 2 */}
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="bg-[#1752FF] bg-opacity-10 text-[#1752FF] font-bold rounded-full w-10 h-10 flex items-center justify-center mb-4">
                02
              </div>

              <h3 className="text-xl font-semibold mb-3">End-to-End Support</h3>

              <p className="text-gray-600 mb-6">
                Get complete assistance from relai – from property selection to
                closing the deal with all legal and financial guidance.
              </p>

              <div className="grid grid-cols-2 gap-2 mb-6">
                <Button
                  variant="default"
                  size="sm"
                  className="text-sm text-center bg-[#1752FF] hover:bg-[#103cc9]"
                >
                  View Properties
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="text-sm text-center bg-[#1752FF] hover:bg-[#103cc9]"
                >
                  Compare Options
                </Button>
              </div>

              <ul className="space-y-2">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-[#1752FF] mr-2" />
                  <span className="text-sm">Property market overview</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-[#1752FF] mr-2" />
                  <span className="text-sm">Area-specific valuations</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-[#1752FF] mr-2" />
                  <span className="text-sm">Property inspection support</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-[#1752FF] mr-2" />
                  <span className="text-sm">Negotiation assistance</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-[#1752FF] mr-2" />
                  <span className="text-sm">Documentation guidance</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Step 3 */}
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="bg-[#1752FF] bg-opacity-10 text-[#1752FF] font-bold rounded-full w-10 h-10 flex items-center justify-center mb-4">
                03
              </div>

              <h3 className="text-xl font-semibold mb-3">
                Post-Purchase Support
              </h3>

              <p className="text-gray-600 mb-6">
                Our relationship doesn't end after the purchase. We offer
                ongoing support for property management, renovations, and future
                real estate needs.
              </p>

              <Button className="w-full bg-[#1752FF] hover:bg-[#103cc9]">
                Schedule a consultation
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Testimonial */}
        <div className="mt-16 bg-[#F2F2F2] rounded-lg p-6 md:p-8 shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="md:col-span-2">
              <p className="text-lg md:text-xl mb-6 italic">
                "Working with relai transformed our property search experience.
                Their team provided expert guidance, handled all the complex
                paperwork, and secured us our dream home at the right price. The
                entire process was seamless and stress-free."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-[#F5F5DC] flex items-center justify-center mr-4">
                  <span className="text-[#1752FF] font-bold">JD</span>
                </div>
                <div>
                  <h4 className="font-semibold">James Donovan</h4>
                  <p className="text-sm text-gray-600">Satisfied Homeowner</p>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <img
                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80"
                alt="Modern home interior"
                className="rounded-lg shadow-md"
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
