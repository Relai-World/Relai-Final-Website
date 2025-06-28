import { Check, X } from "lucide-react";
import Container from "@/components/ui/container";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { SushantAvatar } from "@/assets/svg/logos";
import CallButton from "@/components/shared/CallButton";
import WhatsAppChatButton from "@/components/shared/WhatsAppChatButton";

export default function InsuranceBuyingExperience() {
  return (
    <section className="py-12 md:py-20 bg-gray-50">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-4xl font-bold mb-4">Insurance Buying Experience</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            What customers experience throughout their insurance journey with Ditto versus other platforms
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Ditto Experience */}
          <div>
            <Card className="mb-8 overflow-hidden">
              <CardHeader className="bg-primary text-white p-4 text-center">
                <h3 className="text-xl font-bold">Ditto</h3>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-start mb-6">
                  <div className="mr-4">
                    <Avatar className="w-16 h-16">
                      <img 
                        src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80" 
                        alt="Happy customer" 
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    </Avatar>
                  </div>
                  <div>
                    <SushantAvatar />
                  </div>
                </div>
                
                <h3 className="font-semibold mb-2">Shortlisting</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Identifying a policy that best suits your financial & medical needs
                </p>
                
                <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
                  <p className="text-sm">
                    Get 2-3 carefully selected policy recommendations, backed by clear explanations tailored to your needs
                  </p>
                </div>
                
                <h3 className="font-semibold mb-2">Application & Payment</h3>
                <p className="text-sm text-gray-600 mb-4">
                  The most critical step – ensuring your application is accurate
                </p>
                
                <div className="flex items-center mb-4">
                  <div className="bg-green-100 p-2 rounded-full mr-3">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                  <p className="text-sm">Expert assistance with your application</p>
                </div>
                
                <div className="flex items-center mb-4">
                  <div className="bg-green-100 p-2 rounded-full mr-3">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                  <p className="text-sm">Clear do's and don'ts for declarations</p>
                </div>
                
                <div className="flex items-center mb-4">
                  <div className="bg-green-100 p-2 rounded-full mr-3">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                  <p className="text-sm">Help you avoid common mistakes</p>
                </div>
                
                <div className="flex items-center mb-4">
                  <div className="bg-green-100 p-2 rounded-full mr-3">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                  <p className="text-sm">Advisor manages insurer coordination</p>
                </div>
                
                <h3 className="font-semibold mb-2">Policy Issuance</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Here, the insurer evaluates your application
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center">
                    <div className="bg-green-100 p-2 rounded-full mr-3">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                    <p className="text-sm">Assistance with medical tests</p>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="bg-green-100 p-2 rounded-full mr-3">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                    <p className="text-sm">Evaluation of counteroffers</p>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="bg-green-100 p-2 rounded-full mr-3">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                    <p className="text-sm">Resolution of any issues</p>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="bg-green-100 p-2 rounded-full mr-3">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                    <p className="text-sm">Extensive support for claims</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Other Platforms Experience */}
          <div>
            <Card className="mb-8 overflow-hidden">
              <CardHeader className="bg-gray-700 text-white p-4 text-center">
                <h3 className="text-xl font-bold">Other Platforms</h3>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-start mb-6">
                  <div className="mr-4">
                    <Avatar className="w-16 h-16">
                      <img 
                        src="https://images.unsplash.com/photo-1512349485872-c24347495826?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80" 
                        alt="Unhappy customer" 
                        className="w-16 h-16 rounded-full object-cover grayscale"
                      />
                    </Avatar>
                  </div>
                  <div>
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <h3 className="font-semibold mb-2">Shortlisting</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Identifying a policy that best suits your financial & medical needs
                </p>
                
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                  <p className="text-sm">
                    Minimal or no human guidance, with policies recommended based on sales targets
                  </p>
                </div>
                
                <h3 className="font-semibold mb-2">Application & Payment</h3>
                <p className="text-sm text-gray-600 mb-4">
                  The most critical step – ensuring your application is accurate
                </p>
                
                <div className="flex items-center mb-4">
                  <div className="bg-red-100 p-2 rounded-full mr-3">
                    <X className="h-5 w-5 text-red-600" />
                  </div>
                  <p className="text-sm">No guidance provided</p>
                </div>
                
                <div className="flex items-center mb-4">
                  <div className="bg-red-100 p-2 rounded-full mr-3">
                    <X className="h-5 w-5 text-red-600" />
                  </div>
                  <p className="text-sm">Higher risk of rejection with your application</p>
                </div>
                
                <div className="flex items-center mb-4">
                  <div className="bg-red-100 p-2 rounded-full mr-3">
                    <X className="h-5 w-5 text-red-600" />
                  </div>
                  <p className="text-sm">Mistakes disrupt the claims process</p>
                </div>
                
                <div className="flex items-center mb-4">
                  <div className="bg-red-100 p-2 rounded-full mr-3">
                    <X className="h-5 w-5 text-red-600" />
                  </div>
                  <p className="text-sm">No insurer coordination</p>
                </div>
                
                <h3 className="font-semibold mb-2">Policy Issuance</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Here, the insurer evaluates your application
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center">
                    <div className="bg-red-100 p-2 rounded-full mr-3">
                      <X className="h-5 w-5 text-red-600" />
                    </div>
                    <p className="text-sm">No assistance provided</p>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="bg-red-100 p-2 rounded-full mr-3">
                      <X className="h-5 w-5 text-red-600" />
                    </div>
                    <p className="text-sm">Rejections require extensive follow-up</p>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="bg-red-100 p-2 rounded-full mr-3">
                      <X className="h-5 w-5 text-red-600" />
                    </div>
                    <p className="text-sm">Re-application is slow and tedious</p>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="bg-red-100 p-2 rounded-full mr-3">
                      <X className="h-5 w-5 text-red-600" />
                    </div>
                    <p className="text-sm">No support for claims</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="text-center mt-12">
          <h3 className="text-2xl font-semibold mb-6">Choose Ditto for a well-guided insurance purchase</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <CallButton className="px-6 py-3" />
            <WhatsAppChatButton className="px-6 py-3" />
          </div>
        </div>
      </Container>
    </section>
  );
}
