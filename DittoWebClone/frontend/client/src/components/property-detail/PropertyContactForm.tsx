import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PropertyDetails } from '@/lib/data/mock-properties';
import { Phone, Calendar, Mail, MessageSquare, Send } from 'lucide-react';

interface PropertyContactFormProps {
  property: PropertyDetails;
}

export default function PropertyContactForm({ property }: PropertyContactFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState(`I'm interested in ${property.title} and would like to schedule a viewing.`);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, handle form submission
    console.log({ name, email, phone, message });
    alert('Thank you for your inquiry! We will contact you shortly.');
    // Reset form
    setName('');
    setEmail('');
    setPhone('');
    setMessage(`I'm interested in ${property.title} and would like to schedule a viewing.`);
  };
  
  return (
    <div className="mt-12 bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-6">Contact About This Property</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Form */}
        <div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Your Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1752FF]"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1752FF]"
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1752FF]"
              />
            </div>
            
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                id="message"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1752FF]"
              />
            </div>
            
            <Button type="submit" className="w-full bg-[#1752FF] hover:bg-[#1242D0]">
              <Send className="mr-2 h-4 w-4" /> Send Message
            </Button>
          </form>
        </div>
        
        {/* Contact Options */}
        <div className="bg-[#F8FAFF] rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Alternative Ways to Connect</h3>
          
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <Phone className="h-5 w-5 text-[#1752FF]" />
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-gray-900">Call Us</h4>
                <p className="mt-1 text-sm text-gray-500">
                  Speak directly with our property consultant
                </p>
                <a href="tel:+918881088890" className="mt-2 inline-block text-[#1752FF] font-medium">
                  +91 88810 88890
                </a>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <Calendar className="h-5 w-5 text-[#1752FF]" />
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-gray-900">Schedule a Tour</h4>
                <p className="mt-1 text-sm text-gray-500">
                  Book a convenient time to visit this property
                </p>
                <Button variant="outline" size="sm" className="mt-2 text-[#1752FF] border-[#1752FF]">
                  Book Appointment
                </Button>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <Mail className="h-5 w-5 text-[#1752FF]" />
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-gray-900">Email Directly</h4>
                <p className="mt-1 text-sm text-gray-500">
                  Send an email with your requirements
                </p>
                <a href="mailto:info@relai.in" className="mt-2 inline-block text-[#1752FF] font-medium">
                  info@relai.in
                </a>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <MessageSquare className="h-5 w-5 text-[#1752FF]" />
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-gray-900">WhatsApp</h4>
                <p className="mt-1 text-sm text-gray-500">
                  Connect via WhatsApp for quick responses
                </p>
                <a 
                  href={`https://wa.me/918881088890?text=I'm%20interested%20in%20${encodeURIComponent(property.title)}`} 
                  className="mt-2 inline-block text-[#1752FF] font-medium"
                  target="_blank"
                  rel="noreferrer"
                >
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}