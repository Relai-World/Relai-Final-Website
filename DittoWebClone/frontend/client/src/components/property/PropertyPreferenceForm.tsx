import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowRight, IndianRupee, Calendar, Building, MapPin, Home, Search } from "lucide-react";
import { PropertyPreference } from "../../pages/PropertyWizardPage";
import { useQuery } from "@tanstack/react-query";

// We'll fetch locations from the API instead of hardcoding them

// Form validation schema
const formSchema = z.object({
  budget: z.string().optional(),
  possession: z.string().optional(),
  configuration: z.string().optional(),
  locations: z.array(z.string()).optional(),
  otherLocation: z.string().optional(),
});

interface PropertyPreferenceFormProps {
  initialValues: PropertyPreference;
  onSubmit: (data: PropertyPreference) => void;
}

// Interface for price range data
interface PriceRange {
  min: number;
  max: number;
}

// Interface for filter options from API
interface FilterOptions {
  propertyTypes: string[];
  configurations: string[];
  locations: string[];
  possessionOptions: string[];
  priceRange: {
    min: number;
    max: number;
  };
}

// Define the FormValues type explicitly from the schema
type FormValues = z.infer<typeof formSchema>;

// Helper to process and display configuration options as 'X BHK', splitting on comma or dash
function getDisplayConfigurations(configurations: string[] = []) {
  const bhkSet = new Set<string>();
  configurations.forEach(cfg => {
    cfg.split(/,|-/).forEach(part => {
      const trimmed = part.trim();
      if (trimmed && trimmed !== '-') {
        bhkSet.add(trimmed + ' BHK');
      }
    });
  });
  // Sort numerically
  return Array.from(bhkSet).sort((a, b) => parseFloat(a) - parseFloat(b));
}

export default function PropertyPreferenceForm({ initialValues, onSubmit }: PropertyPreferenceFormProps) {
  // State for location search
  const [locationSearch, setLocationSearch] = useState("");
  const [dates, setDates] = useState([]);

  // Fetch price ranges from the API
  const { data: priceRange, isLoading: isLoadingPriceRange } = useQuery<PriceRange>({
    queryKey: ['/api/price-range'],
    refetchOnWindowFocus: false,
  });

  // Fetch filter options from the API
  const { data: filterOptions, isLoading: isLoadingFilterOptions } = useQuery<FilterOptions>({
    queryKey: ['/api/filter-options'],
    refetchOnWindowFocus: false,
  });

  // Filter locations based on search
  const getFilteredLocations = (): string[] => {
    const allLocations: string[] = filterOptions?.locations || [];
    
    // Sort locations alphabetically first
    const sortedLocations = allLocations.sort((a: string, b: string) => a.localeCompare(b));
    
    // If no search query, return all sorted locations
    if (!locationSearch.trim()) return sortedLocations;
    
    // Filter based on search query
    return sortedLocations.filter((location: string) => 
      location.toLowerCase().includes(locationSearch.toLowerCase().trim())
    );
  };

  // Initialize form with values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      budget: initialValues.budget || "",
      possession: initialValues.possession || "",
      configuration: initialValues.configuration || "",
      locations: initialValues.locations || [],
      otherLocation: initialValues.otherLocation || "",
    },
  });
  
  // Generate budget range options based on database price range
  const getBudgetRangeOptions = () => {
    if (!priceRange) {
      return [
        { value: "under-50-lakhs", label: "Under ₹50 Lakhs" },
        { value: "50-75-lakhs", label: "₹50 Lakhs - ₹75 Lakhs" },
        { value: "75-1-crore", label: "₹75 Lakhs - ₹1 Crore" },
        { value: "1-1.5-crore", label: "₹1 Crore - ₹1.5 Crore" },
        { value: "1.5-2-crore", label: "₹1.5 Crore - ₹2 Crore" },
        { value: "above-2-crore", label: "Above ₹2 Crore" }
      ];
    }

    const { min, max } = priceRange as PriceRange;
    
    // Create dynamic ranges based on the actual data
    const ranges = [];
    
    // Generate price ranges in terms of price per sqft
    const step = Math.ceil((max - min) / 6); // 6 different price range segments
    
    for (let i = 0; i < 6; i++) {
      const rangeMin = min + (i * step);
      const rangeMax = i === 5 ? max : min + ((i + 1) * step);
      
      ranges.push({
        value: `${rangeMin}-${rangeMax}`,
        label: i === 5 
          ? `Above ₹${rangeMin} per sqft` 
          : `₹${rangeMin} - ₹${rangeMax} per sqft`
      });
    }
    
    return ranges;
  };

  // Animation variants
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

  useEffect(() => {
    console.log("Fetching possession dates");
    fetch("http://localhost:5001/api/wizard-properties/unique-possession-dates")
      .then(res => res.json())
      .then(data => setDates(data.dates || []));
  }, []);

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center space-y-2 mb-8"
      >
        <h3 className="text-2xl font-bold text-gray-800">Find Your Ideal Property</h3>
        <p className="text-base text-gray-600">
          Tell us about your preferences, and we'll match you with the perfect properties
        </p>
      </motion.div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit((formData) => {
          // Convert form data to PropertyPreference type
          const propertyPreference: PropertyPreference = {
            ...formData,
            budget: formData.budget || "",
            possession: formData.possession || "",
            configuration: formData.configuration || "",
            locations: formData.locations || [],
          };
          onSubmit(propertyPreference);
        })}>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {/* Budget Range */}
            <motion.div variants={itemVariants}>
              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center text-lg font-semibold">
                      <IndianRupee className="h-5 w-5 mr-2 text-[#1752FF]" />
                      Budget Range
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your budget range" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="not-decided" className="border-b border-gray-200 mb-1 pb-1 font-medium text-blue-600">
                          Not decided yet
                        </SelectItem>
                        {isLoadingPriceRange ? (
                          <SelectItem value="loading" disabled>Loading price ranges...</SelectItem>
                        ) : (
                          <ScrollArea className="h-[200px]">
                            {getBudgetRangeOptions().map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </ScrollArea>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            {/* Possession */}
            <motion.div variants={itemVariants}>
              <FormField
                control={form.control}
                name="possession"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center text-lg font-semibold">
                      <Calendar className="h-5 w-5 mr-2 text-[#1752FF]" />
                      Possession Timeline
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="When do you need possession?" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="not-decided" className="border-b border-gray-200 mb-1 pb-1 font-medium text-blue-600">
                          Not decided yet
                        </SelectItem>
                        {dates.length === 0 ? (
                          <SelectItem value="loading" disabled>Loading dates...</SelectItem>
                        ) : (
                          dates.map((date: string) => (
                            <SelectItem key={date} value={date}>
                              {date}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            {/* Property Configuration */}
            <motion.div variants={itemVariants}>
              <FormField
                control={form.control}
                name="configuration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center text-lg font-semibold">
                      <Building className="h-5 w-5 mr-2 text-[#1752FF]" />
                      Property Configuration
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select property configuration" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="not-decided" className="border-b border-gray-200 mb-1 pb-1 font-medium text-blue-600">
                          Not decided yet
                        </SelectItem>
                        {isLoadingFilterOptions ? (
                          <SelectItem value="loading" disabled>Loading configurations...</SelectItem>
                        ) : filterOptions?.configurations && filterOptions.configurations.length > 0 ? (
                          <ScrollArea className="h-[200px]">
                            {getDisplayConfigurations(filterOptions.configurations).map((config: string) => (
                              <SelectItem key={config} value={config}>{config}</SelectItem>
                            ))}
                          </ScrollArea>
                        ) : (
                          <SelectItem value="no-results" disabled>No configurations found</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            {/* Preferred Locations Dropdown */}
            <motion.div variants={itemVariants}>
              <FormField
                control={form.control}
                name="locations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center text-lg font-semibold">
                      <MapPin className="h-5 w-5 mr-2 text-[#1752FF]" />
                      Preferred Locations
                    </FormLabel>
                    <FormDescription>
                      Select one or more areas in Hyderabad
                    </FormDescription>
                    
                    <div className="space-y-3">
                      <Select
                        onValueChange={(value) => {
                          // Special handling for "not-decided"
                          if (value === "not-decided") {
                            // Clear all other locations and set only "not-decided"
                            field.onChange(["not-decided"]);
                            return;
                          }
                          
                          // For other selections, handle normally
                          const selectedLocations = field.value || [];
                          // If "not-decided" was previously selected, remove it
                          const filteredLocations = selectedLocations.filter(loc => loc !== "not-decided");
                          
                          if (!filteredLocations.includes(value) && value !== "select-placeholder") {
                            field.onChange([...filteredLocations, value]);
                          }
                        }}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Click to select locations" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <div className="sticky top-0 bg-white border-b border-gray-200 p-2">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input
                                placeholder="Search locations..."
                                value={locationSearch}
                                onChange={(e) => setLocationSearch(e.target.value)}
                                className="pl-10 h-8 text-sm"
                                onClick={(e) => e.stopPropagation()}
                                onKeyDown={(e) => e.stopPropagation()}
                                onFocus={(e) => e.stopPropagation()}
                                autoComplete="off"
                              />
                            </div>
                          </div>
                          <SelectItem value="select-placeholder" disabled>Select locations</SelectItem>
                          <SelectItem value="not-decided" className="border-b border-gray-200 mb-1 pb-1 font-medium text-blue-600">
                            Not decided yet
                          </SelectItem>
                          <ScrollArea className="h-[200px]">
                            {isLoadingFilterOptions ? (
                              <SelectItem value="loading" disabled>Loading locations...</SelectItem>
                            ) : getFilteredLocations().length > 0 ? (
                              getFilteredLocations().map((location: string) => (
                                <SelectItem key={location} value={location}>
                                  {location}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-results" disabled>No locations found</SelectItem>
                            )}
                          </ScrollArea>
                        </SelectContent>
                      </Select>
                    
                      {/* Display selected locations as tags */}
                      <div className="flex flex-wrap gap-2">
                        {field.value?.map((location: string) => (
                          location !== "other" && (
                            <div 
                              key={location}
                              className="bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm flex items-center"
                            >
                              {location}
                              <button
                                type="button"
                                onClick={() => {
                                  const updatedLocations = field.value?.filter((val: string) => val !== location) || [];
                                  field.onChange(updatedLocations);
                                }}
                                className="ml-2 text-blue-600 hover:text-blue-800"
                              >
                                ×
                              </button>
                            </div>
                          )
                        ))}
                      </div>
                    
                      {/* Other location option */}
                      <div className="flex flex-row items-start space-x-3 space-y-0">
                        <Checkbox
                          checked={field.value?.includes("other")}
                          onCheckedChange={(checked) => {
                            const currentLocations = field.value || [];
                            if (checked) {
                              field.onChange([...currentLocations, "other"]);
                            } else {
                              field.onChange(
                                currentLocations.filter(
                                  (value) => value !== "other"
                                )
                              );
                              // Clear other location field when unchecked
                              form.setValue("otherLocation", "");
                            }
                          }}
                        />
                        <FormLabel className="font-normal cursor-pointer">
                          Other
                        </FormLabel>
                      </div>
                    
                      {/* Other location input field - only shows when "Other" is checked */}
                      {field.value?.includes("other") && (
                        <FormField
                          control={form.control}
                          name="otherLocation"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input 
                                  placeholder="Please specify your preferred location" 
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Enter the name of your preferred location not listed above
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                    
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
                  Find My Perfect Match
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


