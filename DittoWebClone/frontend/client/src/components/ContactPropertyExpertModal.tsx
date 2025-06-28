import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, User, Phone, Mail, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ContactPropertyExpertModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyName?: string;
}

export default function ContactPropertyExpertModal({ 
  isOpen, 
  onClose, 
  propertyName 
}: ContactPropertyExpertModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    meetingDate: "",
    meetingTime: "10:00"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact-property-expert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          propertyName,
          subject: `Property Inquiry: ${propertyName || 'Property'}`,
          message: `Meeting request for ${propertyName || 'property'} on ${formData.meetingDate} at ${formData.meetingTime}`
        }),
      });

      if (response.ok) {
        toast({
          title: "Meeting Scheduled!",
          description: "Our property expert will contact you soon to confirm the meeting.",
        });
        onClose();
        setFormData({
          name: "",
          phone: "",
          email: "",
          meetingDate: "",
          meetingTime: "10:00"
        });
      } else {
        throw new Error('Failed to schedule meeting');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to schedule meeting. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Generate time options from 9:00 AM to 7:00 PM
  const timeOptions = [];
  for (let hour = 9; hour <= 19; hour++) {
    const time24 = `${hour.toString().padStart(2, '0')}:00`;
    const time12 = hour > 12 ? `${hour - 12}:00 PM` : hour === 12 ? `12:00 PM` : `${hour}:00 AM`;
    timeOptions.push({ value: time24, label: time12 });
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Contact Property Expert
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-1">
            Schedule a meeting with our property expert to discuss this property.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Your Name */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <User className="h-4 w-4" />
              Your Name
            </Label>
            <Input
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
              className="w-full"
            />
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Phone className="h-4 w-4" />
              Phone Number
            </Label>
            <Input
              type="tel"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              required
              className="w-full"
            />
          </div>

          {/* Email Address */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Mail className="h-4 w-4" />
              Email Address
            </Label>
            <Input
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
              className="w-full"
            />
          </div>

          {/* Preferred Meeting Date */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Calendar className="h-4 w-4" />
              Preferred Meeting Date
            </Label>
            <Input
              type="date"
              value={formData.meetingDate}
              onChange={(e) => handleInputChange('meetingDate', e.target.value)}
              required
              className="w-full"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Preferred Meeting Time */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Clock className="h-4 w-4" />
              Preferred Meeting Time
            </Label>
            <select
              value={formData.meetingTime}
              onChange={(e) => handleInputChange('meetingTime', e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {timeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? "Scheduling..." : "Schedule Meeting"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}