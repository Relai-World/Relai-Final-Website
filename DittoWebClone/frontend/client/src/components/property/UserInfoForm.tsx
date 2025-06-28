import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, User, Phone, Calendar as CalendarIcon2, Clock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { UserInfo } from "../../pages/PropertyWizardPage";

// Generate time slots from 9 AM to 8 PM in 30-minute intervals
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 9; hour <= 20; hour++) {
    const hourFormatted = hour % 12 === 0 ? 12 : hour % 12;
    const amPm = hour < 12 ? "AM" : "PM";
    
    slots.push({
      value: `${hour}:00`,
      label: `${hourFormatted}:00 ${amPm}`
    });
    
    if (hour < 20) {
      slots.push({
        value: `${hour}:30`,
        label: `${hourFormatted}:30 ${amPm}`
      });
    }
  }
  return slots;
};

const timeSlots = generateTimeSlots();

// Form schema with validations
const formSchema = z.object({
  name: z.string()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(50, { message: "Name must not exceed 50 characters" }),
  
  phone: z.string()
    .regex(/^[6-9]\d{9}$/, { 
      message: "Please enter a valid 10-digit Indian mobile number" 
    }),
  
  appointmentDate: z.date({
    required_error: "Please select a date for your appointment",
  }),
  
  appointmentTime: z.string({
    required_error: "Please select a time for your appointment",
  }),
});

interface UserInfoFormProps {
  initialValues: UserInfo;
  onSubmit: (data: UserInfo) => void;
}

export default function UserInfoForm({ initialValues, onSubmit }: UserInfoFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialValues.name || "",
      phone: initialValues.phone || "",
      appointmentDate: initialValues.appointmentDate,
      appointmentTime: initialValues.appointmentTime || "",
    },
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  // Get today's date for the min date of the calendar
  const today = new Date();
  
  // Set the max date to 30 days from today
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + 30);

  function handleSubmit(values: z.infer<typeof formSchema>) {
    onSubmit(values);
  }

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center space-y-2 mb-6"
      >
        <p className="text-lg text-gray-700">
          We've found properties that match your criteria!
        </p>
        <p className="text-sm text-gray-500">
          Please provide your contact details and schedule a consultation with our property expert.
        </p>
      </motion.div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* Name */}
            <motion.div variants={itemVariants}>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center text-lg font-semibold">
                      <User className="h-5 w-5 mr-2 text-[#1752FF]" />
                      Your Name
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            {/* Phone */}
            <motion.div variants={itemVariants}>
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center text-lg font-semibold">
                      <Phone className="h-5 w-5 mr-2 text-[#1752FF]" />
                      WhatsApp Number
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter your 10-digit mobile number" 
                        {...field} 
                        type="tel"
                        maxLength={10}
                      />
                    </FormControl>
                    <FormDescription>
                      We'll send meeting details to this WhatsApp number
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            {/* Appointment Date */}
            <motion.div variants={itemVariants}>
              <FormField
                control={form.control}
                name="appointmentDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="flex items-center text-lg font-semibold">
                      <CalendarIcon2 className="h-5 w-5 mr-2 text-[#1752FF]" />
                      Appointment Date
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Select a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => 
                            date < today || 
                            date > maxDate || 
                            date.getDay() === 0 // Disable Sundays
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Select a date within the next 30 days (excluding Sundays)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            {/* Appointment Time */}
            <motion.div variants={itemVariants}>
              <FormField
                control={form.control}
                name="appointmentTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center text-lg font-semibold">
                      <Clock className="h-5 w-5 mr-2 text-[#1752FF]" />
                      Appointment Time
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a time slot" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeSlots.map((slot) => (
                          <SelectItem key={slot.value} value={slot.value}>
                            {slot.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Our property experts are available from 9 AM to 8 PM
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            {/* Submit Button */}
            <motion.div variants={itemVariants} className="pt-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  type="submit" 
                  className="w-full py-6 text-lg group"
                >
                  Schedule Appointment
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </form>
      </Form>
    </div>
  );
}