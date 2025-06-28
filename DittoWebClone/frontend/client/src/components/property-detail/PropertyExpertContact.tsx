import React, { useState } from 'react';
import { format } from 'date-fns';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Check, User, Phone, Mail, Clock, MessageSquare } from 'lucide-react';

// Use the Property type from PropertyDetailPage
type Property = {
  id: string | number;
  property_id?: string;
  projectName?: string;
  name: string;
  location: string;
  // Add any other properties you need
};

interface PropertyExpertContactProps {
  property: Property;
}

export default function PropertyExpertContact({ property }: PropertyExpertContactProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState('10:00');
  
  // Time options for the dropdown
  const timeOptions = [
    '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', 
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', 
    '16:00', '16:30', '17:00', '17:30', '18:00'
  ];
  
  // Reset form state
  const resetForm = () => {
    setName('');
    setPhone('');
    setEmail('');
    setDate(new Date());
    setTime('10:00');
    setIsSubmitting(false);
    setIsSuccess(false);
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date) {
      alert('Please select a date for your meeting');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create meeting datetime by combining the date and time
      const [hours, minutes] = time.split(':').map(Number);
      const meetingTime = new Date(date);
      meetingTime.setHours(hours, minutes, 0, 0);
      
      // Submit the form data
      const formData = {
        name,
        phone,
        email,
        meetingTime: meetingTime.toISOString(),
        propertyId: property.property_id || String(property.id),
        propertyName: property.projectName || property.name
      };
      
      await fetch('/api/contact-property-expert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      setIsSuccess(true);
      
      // Close dialog after 3 seconds
      setTimeout(() => {
        setOpen(false);
        // Reset form after dialog is closed
        setTimeout(resetForm, 300);
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting contact request:', error);
      alert('Failed to submit your contact request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen);
      if (!newOpen) {
        // Reset form when dialog is closed without submission
        setTimeout(resetForm, 300);
      }
    }}>
      <DialogTrigger asChild>
        <Button 
          size="lg" 
          className="w-full bg-[#1752FF] hover:bg-[#0041e0] text-white font-medium py-3 px-4 rounded-md shadow-sm transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <MessageSquare size={18} />
          Contact Property Expert
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Contact Property Expert</DialogTitle>
          <DialogDescription>
            Schedule a meeting with our property expert to discuss this property.
          </DialogDescription>
        </DialogHeader>
        
        {isSuccess ? (
          <div className="py-6 flex flex-col items-center text-center">
            <div className="bg-green-100 text-green-700 rounded-full p-3 mb-4">
              <Check size={28} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Request Submitted!</h3>
            <p className="text-gray-600">
              Thank you for your interest in {property.projectName || property.name}. 
              Our property expert will contact you shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User size={16} />
                Your Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone size={16} />
                Phone Number
              </Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail size={16} />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CalendarIcon size={16} />
                Preferred Meeting Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    {date ? format(date, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    disabled={(date) => {
                      // Disable past dates
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return date < today;
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="time" className="flex items-center gap-2">
                <Clock size={16} />
                Preferred Meeting Time
              </Label>
              <select
                id="time"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              >
                {timeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#1752FF]" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Schedule Meeting'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}