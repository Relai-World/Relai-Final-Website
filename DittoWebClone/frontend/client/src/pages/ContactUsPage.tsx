import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  MessageSquare,
  Facebook, 
  Instagram, 
  Linkedin,
  AlertCircle
} from "lucide-react";
import Container from "@/components/ui/container";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormEvent, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";

// X (Twitter) icon
const XIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    className={className} 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M4 4l11.733 16h4.267l-11.733 -16z"></path>
    <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"></path>
  </svg>
);

// Define contact form schema with Zod
const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string()
    .refine(val => !val || /^[0-9+\s()-]{10,15}$/.test(val), {
      message: "Phone number must contain only digits, +, -, (), or spaces and be 10-15 characters"
    }),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

export default function ContactUsPage() {
  // Set page title and meta description when component mounts
  useEffect(() => {
    document.title = "Contact Relai | Talk to Our Real Estate Experts in Hyderabad";
    
    // Set meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Have questions or need help with real estate in Hyderabad? Contact Relai\'s team for expert guidance, virtual consultations, or property support.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Have questions or need help with real estate in Hyderabad? Contact Relai\'s team for expert guidance, virtual consultations, or property support.';
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

  const { toast } = useToast();
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // For phone field, allow only numbers and specific characters
    if (name === 'phone') {
      // If it's not empty and contains invalid characters, don't update the state
      if (value && !/^[0-9+\s()-]*$/.test(value)) {
        return;
      }
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when it's being edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const validateForm = (): boolean => {
    try {
      contactFormSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path) {
            newErrors[err.path[0]] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Validate the form using Zod schema
    if (!validateForm()) {
      toast({
        title: "Error",
        description: "Please correct the errors in the form",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      console.log("Form submitted:", formData);
      
      // Show success toast
      toast({
        title: "Message Sent!",
        description: "We'll get back to you as soon as possible.",
      });
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
      });
      
      setErrors({});
      setIsSubmitting(false);
    }, 1000);
  };
  
  return (
    <div className="py-16 md:py-24">
      <Container>
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-3xl md:text-5xl font-bold mb-4 text-[#1752FF]">
            Get In Touch
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Have questions about buying a property or our services? We're here to help!
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-5 gap-8 mb-16">
          {/* Contact Info Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="md:col-span-2"
          >
            <Card className="shadow-md border-none mb-6">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <MapPin className="h-6 w-6 text-[#1752FF]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Our Location</h3>
                    <p className="text-gray-600">
                      Unit 5/2, 5th Floor, C9FJ+G2H G Square Building, Police Station, beside Raidurgam,<br />
                      Madhura Nagar Colony, Gachibowli, Rai Durg, Hyderabad, Telangana 500032
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-md border-none mb-6">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Phone className="h-6 w-6 text-[#1752FF]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Phone</h3>
                    <p className="text-gray-600">+91 88810 88890</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-md border-none mb-6">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Mail className="h-6 w-6 text-[#1752FF]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Email</h3>
                    <p className="text-gray-600">connect@relai.world</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-md border-none mb-6">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Clock className="h-6 w-6 text-[#1752FF]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Business Hours</h3>
                    <p className="text-gray-600">All Days: 10:00 AM - 7:00 PM</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="mt-8">
              <h3 className="font-bold text-lg mb-4">Connect With Us</h3>
              <div className="flex gap-4">
                <a href="https://www.facebook.com/profile.php?id=61575099697345" target="_blank" rel="noopener noreferrer" className="bg-blue-100 p-3 rounded-full hover:bg-blue-200 transition-colors">
                  <Facebook className="h-6 w-6 text-[#1752FF]" />
                </a>
                <a href="https://x.com/relaiworld" target="_blank" rel="noopener noreferrer" className="bg-blue-100 p-3 rounded-full hover:bg-blue-200 transition-colors">
                  <XIcon className="h-6 w-6 text-[#1752FF]" />
                </a>
                <a href="https://www.instagram.com/relai.world/" target="_blank" rel="noopener noreferrer" className="bg-blue-100 p-3 rounded-full hover:bg-blue-200 transition-colors">
                  <Instagram className="h-6 w-6 text-[#1752FF]" />
                </a>
                <a href="https://www.linkedin.com/company/relaiworld/" target="_blank" rel="noopener noreferrer" className="bg-blue-100 p-3 rounded-full hover:bg-blue-200 transition-colors">
                  <Linkedin className="h-6 w-6 text-[#1752FF]" />
                </a>
              </div>
            </div>
          </motion.div>
          
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="md:col-span-3"
          >
            <Card className="shadow-lg border-none">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <MessageSquare className="h-6 w-6 text-[#1752FF]" />
                  <h2 className="text-2xl font-bold">Send Us a Message</h2>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="font-medium text-gray-700">Full Name *</label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your Name"
                        required
                        className={`w-full ${errors.name ? 'border-red-500' : ''}`}
                      />
                      {errors.name && (
                        <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="email" className="font-medium text-gray-700">Email *</label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Your Email"
                        required
                        className={`w-full ${errors.email ? 'border-red-500' : ''}`}
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="phone" className="font-medium text-gray-700">Phone Number</label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Your Phone Number (numbers only)"
                        className={`w-full ${errors.phone ? 'border-red-500' : ''}`}
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="subject" className="font-medium text-gray-700">Subject *</label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="Message Subject"
                        required
                        className={`w-full ${errors.subject ? 'border-red-500' : ''}`}
                      />
                      {errors.subject && (
                        <p className="text-red-500 text-sm mt-1">{errors.subject}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="message" className="font-medium text-gray-700">Message *</label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Your Message"
                      required
                      className={`w-full min-h-[150px] ${errors.message ? 'border-red-500' : ''}`}
                    />
                    {errors.message && (
                      <p className="text-red-500 text-sm mt-1">{errors.message}</p>
                    )}
                  </div>
                  
                  {/* Form-wide validation error alert */}
                  {Object.keys(errors).length > 0 && (
                    <Alert variant="destructive" className="mt-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Please correct the errors in the form before submitting.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      className="bg-[#1752FF] hover:bg-blue-700 px-6"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
        

      </Container>
    </div>
  );
}