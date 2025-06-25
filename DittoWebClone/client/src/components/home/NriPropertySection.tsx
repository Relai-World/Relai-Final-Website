import { Plane, Building2, Shield, Phone, Globe, Video, Search } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Users, Calendar, Clock } from "lucide-react";
import Container from "@/components/ui/container";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import WhatsAppChatButton from "@/components/shared/WhatsAppChatButton";

export default function NriPropertySection() {
  const [showAdvisoryForm, setShowAdvisoryForm] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: ""
  });
  
  const [formErrors, setFormErrors] = useState({
    name: "",
    phone: "",
    email: ""
  });
  
  // Validation functions
  const validateName = (name: string) => {
    if (!name.trim()) return "Name is required";
    if (name.trim().length < 2) return "Name must be at least 2 characters";
    return "";
  };
  
  const validatePhone = (phone: string) => {
    if (!phone.trim()) return "Phone number is required";
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) return "Please enter a valid 10-digit Indian mobile number";
    return "";
  };
  
  const validateEmail = (email: string) => {
    if (!email.trim()) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  };
  
  const validateForm = () => {
    const nameError = validateName(formData.name);
    const phoneError = validatePhone(formData.phone);
    const emailError = validateEmail(formData.email);
    
    setFormErrors({
      name: nameError,
      phone: phoneError,
      email: emailError
    });
    
    return !nameError && !phoneError && !emailError;
  };
  
  const handleSubmit = () => {
    if (validateForm()) {
      setShowAdvisoryForm(false);
      setShowSuccessMessage(true);
      // Reset form
      setFormData({ name: "", phone: "", email: "" });
      setFormErrors({ name: "", phone: "", email: "" });
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    }
  };
  const services = [
    {
      icon: <Video className="h-10 w-10 text-[#1752FF]" />,
      title: "Virtual Property Tours",
      description: "Live video tours of properties with a dedicated Relai agent to help you explore properties remotely."
    },
    {
      icon: <Phone className="h-10 w-10 text-[#1752FF]" />,
      title: "Dedicated NRI Advisors",
      description: "Specialized consultants who understand the unique needs of NRI investors and homebuyers."
    },
    {
      icon: <Building2 className="h-10 w-10 text-[#1752FF]" />,
      title: "Property Management",
      description: "Complete management services for your property including rental collection, maintenance, and more."
    },
    {
      icon: <Globe className="h-10 w-10 text-[#1752FF]" />,
      title: "Remote Transaction Processing",
      description: "Secure digital platforms for completing transactions, signatures, and payments from anywhere in the world."
    }
  ];

  return (
    <section className="py-12 md:py-20 bg-gradient-to-b from-white to-[#F5F5DC]/30">
      <Container>
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 mb-12">
          <div className="bg-[#1752FF]/10 p-3 rounded-full">
            <Plane className="h-8 w-8 md:h-12 md:w-12 text-[#1752FF]" />
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-2xl md:text-4xl font-bold">NRI Property Services</h2>
            <p className="text-gray-600 mt-2 max-w-2xl">
              Specialized real estate services for Non-Resident Indians looking to invest or purchase property in Hyderabad
            </p>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-bold text-center mb-8">Our NRI Services</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <Card key={index} className="border border-[#F2F2F2] hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="bg-[#F5F5DC] p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                    {service.icon}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{service.title}</h3>
                  <p className="text-gray-600 text-sm">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        {/* NRI Specific Call-to-Action */}
        <div className="mt-12 bg-[#F2F2F2] rounded-lg p-6 md:p-8 shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-xl md:text-2xl font-bold mb-4">Ready to invest in Hyderabad real estate?</h3>
              <p className="text-gray-600 mb-6">
               Our specialized NRI advisors provide the best real estate investment advisory services, available through virtual consultations at your convenience, regardless of your time zone.
              </p>
              <div className="space-y-4">
                <Button 
                  className="w-full md:w-auto bg-[#1752FF] hover:bg-[#103cc9] text-white flex items-center gap-2"
                  onClick={() => setShowAdvisoryForm(true)}
                >
                  <Phone className="h-4 w-4" />
                  Start your advisory process
                </Button>
                <WhatsAppChatButton className="w-full md:w-auto border-[#1752FF] text-[#1752FF]" />
              </div>
            </div>
            <div className="hidden md:block">
              <ul className="space-y-3 border border-[#1752FF]/20 rounded-lg p-5 bg-white">
                <li className="flex items-start">
                  <div className="bg-[#1752FF]/10 p-1 rounded-full mr-3 mt-1">
                    <Shield className="h-4 w-4 text-[#1752FF]" />
                  </div>
                  <span className="text-sm">Help with FEMA compliance and RBI regulations</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-[#1752FF]/10 p-1 rounded-full mr-3 mt-1">
                    <Shield className="h-4 w-4 text-[#1752FF]" />
                  </div>
                  <span className="text-sm">Guidance on repatriation of funds and tax implications</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-[#1752FF]/10 p-1 rounded-full mr-3 mt-1">
                    <Shield className="h-4 w-4 text-[#1752FF]" />
                  </div>
                  <span className="text-sm">Support with Power of Attorney arrangements</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-[#1752FF]/10 p-1 rounded-full mr-3 mt-1">
                    <Shield className="h-4 w-4 text-[#1752FF]" />
                  </div>
                  <span className="text-sm">Assistance with NRI-specific home loans and financing</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Container>

      {/* Advisory Process Form Dialog */}
      <Dialog open={showAdvisoryForm} onOpenChange={setShowAdvisoryForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold text-gray-900">
              Start Your Advisory Process
            </DialogTitle>
            <p className="text-center text-gray-600 mt-2">
              Get expert guidance for your NRI property investment journey
            </p>
          </DialogHeader>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
            <p className="text-center text-blue-800 font-medium">
              Connect with our specialized NRI advisors
            </p>
            <p className="text-center text-blue-600 text-sm mt-1">
              Our experts will help you navigate FEMA compliance, property selection, and investment strategies tailored for NRI investors.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="advisory-name" className="flex items-center text-gray-700 mb-2">
                <Users className="h-4 w-4 mr-2 text-blue-600" />
                Your Name
              </Label>
              <Input
                id="advisory-name"
                placeholder="Enter your full name"
                className={`w-full ${formErrors.name ? 'border-red-500' : ''}`}
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
              {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
            </div>

            <div>
              <Label htmlFor="advisory-phone" className="flex items-center text-gray-700 mb-2">
                <Phone className="h-4 w-4 mr-2 text-blue-600" />
                WhatsApp Number
              </Label>
              <Input
                id="advisory-phone"
                placeholder="Enter your 10-digit mobile number"
                className={`w-full ${formErrors.phone ? 'border-red-500' : ''}`}
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
              {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
              <p className="text-xs text-gray-500 mt-1">
                We'll send advisory session details to this WhatsApp number
              </p>
            </div>

            <div>
              <Label htmlFor="advisory-email" className="flex items-center text-gray-700 mb-2">
                <Users className="h-4 w-4 mr-2 text-blue-600" />
                Email Address
              </Label>
              <Input
                id="advisory-email"
                type="email"
                placeholder="Enter your email address"
                className={`w-full ${formErrors.email ? 'border-red-500' : ''}`}
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
              {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
              <p className="text-xs text-gray-500 mt-1">
                We'll send advisory process details to this email
              </p>
            </div>

            <div>
              <Label htmlFor="advisory-date" className="flex items-center text-gray-700 mb-2">
                <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                Consultation Date
              </Label>
              <Input
                id="advisory-date"
                type="date"
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Select a date within the next 30 days (excluding Sundays)
              </p>
            </div>

            <div>
              <Label htmlFor="advisory-time" className="flex items-center text-gray-700 mb-2">
                <Clock className="h-4 w-4 mr-2 text-blue-600" />
                Consultation Time
              </Label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select a time slot</option>
                <option value="9:00">9:00 AM</option>
                <option value="10:00">10:00 AM</option>
                <option value="11:00">11:00 AM</option>
                <option value="12:00">12:00 PM</option>
                <option value="14:00">2:00 PM</option>
                <option value="15:00">3:00 PM</option>
                <option value="16:00">4:00 PM</option>
                <option value="17:00">5:00 PM</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Our NRI advisors are available from 9 AM to 8 PM (IST)
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => setShowAdvisoryForm(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                Start Advisory Process →
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Message Dialog */}
      <Dialog open={showSuccessMessage} onOpenChange={setShowSuccessMessage}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold text-green-700">
              Advisory Process Started Successfully!
            </DialogTitle>
          </DialogHeader>
          
          <div className="text-center py-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-green-600" />
            </div>
            
            <p className="text-gray-700 mb-2">
              Thank you for starting your NRI advisory process with us!
            </p>
            <p className="text-sm text-gray-600">
              Our specialized NRI property advisor will contact you within 24 hours to guide you through your investment journey.
            </p>
          </div>
          
          <div className="flex justify-center">
            <Button
              onClick={() => setShowSuccessMessage(false)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Continue Exploring
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}