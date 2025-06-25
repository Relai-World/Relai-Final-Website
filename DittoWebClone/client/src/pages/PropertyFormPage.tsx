import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

import Container from "@/components/ui/container";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Check, ArrowRight } from "lucide-react";

// Define the form schema with Zod
const formSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().min(10, { message: "Please enter a valid phone number" }),
  propertyType: z.string().min(1, { message: "Please select a property type" }),
  budget: z.string().min(1, { message: "Please select a budget range" }),
  location: z.string().min(1, { message: "Please select a preferred location" }),
  bedrooms: z.string().min(1, { message: "Please select the number of bedrooms" }),
  propertyPurpose: z.string().min(1, { message: "Please select a purpose" }),
  additionalFeatures: z.array(z.string()).optional(),
  message: z.string().optional(),
  contactPreference: z.string().min(1, { message: "Please select how you prefer to be contacted" }),
  terms: z.boolean().refine(value => value === true, {
    message: "You must accept the terms and conditions",
  }),
});

type FormValues = z.infer<typeof formSchema>;

// Pre-defined options for form fields
const propertyTypes = ["Apartment", "Villa", "Plot", "Independent House", "Commercial"];
const budgetRanges = ["Under ₹50 Lakhs", "₹50 Lakhs - ₹1 Crore", "₹1 Crore - ₹2 Crore", "₹2 Crore - ₹5 Crore", "Above ₹5 Crore"];
const locations = ["Gachibowli", "Madhapur", "HITEC City", "Kondapur", "Kukatpally", "Banjara Hills", "Jubilee Hills", "Financial District", "Other"];
const bedroomOptions = ["1 BHK", "2 BHK", "3 BHK", "4 BHK", "5+ BHK"];
const features = [
  { id: "gym", label: "Gym" },
  { id: "swimming-pool", label: "Swimming Pool" },
  { id: "garden", label: "Garden/Park" },
  { id: "security", label: "24/7 Security" },
  { id: "parking", label: "Reserved Parking" },
  { id: "clubhouse", label: "Clubhouse" },
];

export default function PropertyFormPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [, setLocation] = useLocation();

  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      propertyType: "",
      budget: "",
      location: "",
      bedrooms: "",
      propertyPurpose: "Buy",
      additionalFeatures: [],
      message: "",
      contactPreference: "Phone",
      terms: false,
    },
  });

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // In a real application, this would be an API call
      console.log("Form data submitted:", data);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success message
      toast({
        title: "Inquiry Submitted!",
        description: "Our property experts will contact you soon.",
        variant: "default",
      });
      
      // Update the UI to show success state
      setIsSubmitted(true);
      
      // In a real app we would redirect after form submission
      // setLocation("/thank-you");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Submission Error",
        description: "There was a problem submitting your inquiry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-12 md:py-16 bg-gradient-to-b from-white to-[#F8F8F8]">
      <Container>
        <div className="max-w-4xl mx-auto">
          {!isSubmitted ? (
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-bold mb-4">Find Your Dream Property</h1>
                <p className="text-gray-600">
                  Fill in the details below and our experts will help you find the perfect property in Hyderabad.
                </p>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Property Requirements</CardTitle>
                  <CardDescription>
                    Tell us what you're looking for and earn 100 Relai Points towards your property journey.
                  </CardDescription>
                  <div className="flex items-center mt-2">
                    <Trophy className="h-5 w-5 text-[#FFC107] mr-2" />
                    <span className="text-sm font-medium">Earn 100 points on submission</span>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Personal Information */}
                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="John Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="john@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                  <Input placeholder="+91 9876543210" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="contactPreference"
                            render={({ field }) => (
                              <FormItem className="space-y-3">
                                <FormLabel>Contact Preference</FormLabel>
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-col space-y-1"
                                  >
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Phone" />
                                      </FormControl>
                                      <FormLabel className="font-normal">
                                        Phone
                                      </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Email" />
                                      </FormControl>
                                      <FormLabel className="font-normal">
                                        Email
                                      </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="WhatsApp" />
                                      </FormControl>
                                      <FormLabel className="font-normal">
                                        WhatsApp
                                      </FormLabel>
                                    </FormItem>
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        {/* Property Requirements */}
                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name="propertyPurpose"
                            render={({ field }) => (
                              <FormItem className="space-y-3">
                                <FormLabel>Purpose</FormLabel>
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex space-x-4"
                                  >
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Buy" />
                                      </FormControl>
                                      <FormLabel className="font-normal">
                                        Buy
                                      </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Invest" />
                                      </FormControl>
                                      <FormLabel className="font-normal">
                                        Invest
                                      </FormLabel>
                                    </FormItem>
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="propertyType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Property Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select property type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {propertyTypes.map((type) => (
                                      <SelectItem key={type} value={type}>
                                        {type}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="budget"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Budget Range</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select budget range" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {budgetRanges.map((range) => (
                                      <SelectItem key={range} value={range}>
                                        {range}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="location"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Preferred Location</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select location" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {locations.map((location) => (
                                        <SelectItem key={location} value={location}>
                                          {location}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="bedrooms"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Bedrooms</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select bedrooms" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {bedroomOptions.map((option) => (
                                        <SelectItem key={option} value={option}>
                                          {option}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Additional Features */}
                      <FormField
                        control={form.control}
                        name="additionalFeatures"
                        render={() => (
                          <FormItem>
                            <div className="mb-4">
                              <FormLabel>Additional Features</FormLabel>
                              <FormDescription>
                                Select any additional amenities you're looking for
                              </FormDescription>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              {features.map((feature) => (
                                <FormField
                                  key={feature.id}
                                  control={form.control}
                                  name="additionalFeatures"
                                  render={({ field }) => {
                                    return (
                                      <FormItem
                                        key={feature.id}
                                        className="flex flex-row items-start space-x-3 space-y-0"
                                      >
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(feature.id)}
                                            onCheckedChange={(checked) => {
                                              const currentValue = field.value || [];
                                              return checked
                                                ? field.onChange([...currentValue, feature.id])
                                                : field.onChange(
                                                    currentValue.filter(
                                                      (value) => value !== feature.id
                                                    )
                                                  );
                                            }}
                                          />
                                        </FormControl>
                                        <FormLabel className="text-sm font-normal">
                                          {feature.label}
                                        </FormLabel>
                                      </FormItem>
                                    );
                                  }}
                                />
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Additional Message */}
                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Additional Requirements (Optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Any specific requirements or questions about properties?"
                                className="resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Terms and Conditions */}
                      <FormField
                        control={form.control}
                        name="terms"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                I agree to Relai's Terms of Service and Privacy Policy
                              </FormLabel>
                              <FormDescription>
                                We'll use your information to find matching properties and contact you with options.
                              </FormDescription>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-center pt-2">
                        <Button 
                          type="submit" 
                          className="bg-[#1752FF] hover:bg-[#1240CC] text-white rounded-full px-8 py-6 min-w-[200px]"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? "Submitting..." : "Submit Your Requirements"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </>
          ) : (
            // Success state
            <Card className="border-4 border-green-500">
              <CardContent className="pt-6 pb-8 px-6 text-center">
                <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <Check className="h-10 w-10 text-green-500" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Thank You for Your Submission!</h2>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Your property requirements have been received. Our real estate experts will contact you soon with personalized options.
                </p>
                
                <div className="bg-[#F5F5DC] p-4 rounded-lg inline-block mb-6">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <Trophy className="h-6 w-6 text-[#FFC107]" />
                    <span>You've earned 100 Relai Points!</span>
                  </div>
                  <p className="text-sm mt-1">
                    Continue your property journey to earn more points and rewards.
                  </p>
                </div>
                
                <div className="flex flex-col md:flex-row gap-4 justify-center">
                  <Button 
                    className="bg-[#1752FF] hover:bg-[#1240CC] text-white rounded-full"
                    onClick={() => setLocation("/")}
                  >
                    Return to Homepage
                  </Button>
                  <Button 
                    variant="outline" 
                    className="rounded-full"
                    onClick={() => {
                      setIsSubmitted(false);
                      form.reset();
                    }}
                  >
                    Submit Another Inquiry
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </Container>
    </div>
  );
}