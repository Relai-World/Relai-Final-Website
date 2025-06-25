import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  SearchIcon,
  UserIcon,
  LogOutIcon,
  Send,
  MessageCircle,
  MapPin,
  Home,
  DollarSign,
  Settings,
  Check,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WizardData {
  locationNames: string[];
  radiusFilter: number;
  searchRadius: number;
  bhkFilters: string[];
  minSqft: number;
  maxSqft: number;
  minBudget: number;
  maxBudget: number;
  propertyTypes: string[];
  constructionStatus: string[];
  communityType: string[];
  minFloors: number;
  maxFloors: number;
  projectDensity: string[];
  amenities: string[];
  minOpenSpacePercentage: number;
  minUnits: number;
  maxUnits: number;
  minLandAreaAcres: number;
  maxLandAreaAcres: number;
  minCommonAreaLoading: number;
  maxCommonAreaLoading: number;
  powerBackup: string;
  liftsAvailability: string;
  vehicularMovement: string[];
  landOwnership: string[];
  bankTieups: string[];
  parking?: string;
  facingDirections?: string[];
  floorPreference?: string;
  propertyAge?: string;
  furnishing?: string;
}

export default function AgentWizardPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [chatMessage, setChatMessage] = useState('');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [chatMessages, setChatMessages] = useState([
    {
      type: 'assistant',
      content: 'Hello! I\'m your AI property assistant. I can help you find properties, provide market insights, and answer questions about locations in Hyderabad. What would you like to know?'
    }
  ]);
  const [wizardData, setWizardData] = useState<WizardData>({
    locationNames: [],
    radiusFilter: 5,
    searchRadius: 10,
    bhkFilters: [],
    minSqft: 500,
    maxSqft: 3000,
    minBudget: 0,
    maxBudget: 0,
    propertyTypes: [],
    constructionStatus: [],
    communityType: [],
    minFloors: 1,
    maxFloors: 20,
    projectDensity: [],
    amenities: [],
    minOpenSpacePercentage: 30,
    minUnits: 50,
    maxUnits: 500,
    minLandAreaAcres: 1,
    maxLandAreaAcres: 50,
    minCommonAreaLoading: 15,
    maxCommonAreaLoading: 30,
    powerBackup: 'any',
    liftsAvailability: 'any',
    vehicularMovement: [],
    landOwnership: [],
    bankTieups: [],
    facingDirections: []
  });

  // Check if agent is logged in
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('agentLoggedIn');
    if (!isLoggedIn) {
      setLocation('/agent/login');
    }
  }, [setLocation]);

  // Auto-scroll only chat container to bottom when new messages are added
  useEffect(() => {
    if (chatContainerRef.current && chatMessagesEndRef.current) {
      const container = chatContainerRef.current;
      const endElement = chatMessagesEndRef.current;
      
      // Scroll the chat container to the bottom without affecting main window
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [chatMessages]);

  const handleLogout = () => {
    localStorage.removeItem('agentLoggedIn');
    localStorage.removeItem('agentUsername');
    localStorage.removeItem('agentName');
    localStorage.removeItem('agentPhone');
    localStorage.removeItem('agentEmail');
    setLocation('/agent/login');
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;
    
    const userMessage = chatMessage;
    setChatMessage('');
    
    // Add user message immediately
    setChatMessages(prev => [...prev, { type: 'user', content: userMessage }]);
    
    // Add loading message
    setChatMessages(prev => [...prev, { type: 'assistant', content: 'Thinking...' }]);
    
    try {
      let responseText = '';
      let webhookWorked = false;
      
      // Try multiple parameter formats for n8n webhook
      const parameterFormats = [
        // Format 1: Standard query parameters
        () => {
          const url = new URL('https://navaneeth03.app.n8n.cloud/webhook/agent-chat');
          url.searchParams.append('message', userMessage);
          url.searchParams.append('sessionId', sessionId);
          url.searchParams.append('context', 'property_search');
          url.searchParams.append('agent', agentName || agentUsername || 'Agent');
          return url.toString();
        },
        // Format 2: Single query parameter
        () => {
          const url = new URL('https://navaneeth03.app.n8n.cloud/webhook/agent-chat');
          url.searchParams.append('query', userMessage);
          url.searchParams.append('sessionId', sessionId);
          return url.toString();
        },
        // Format 3: Text parameter
        () => {
          const url = new URL('https://navaneeth03.app.n8n.cloud/webhook/agent-chat');
          url.searchParams.append('text', userMessage);
          url.searchParams.append('sessionId', sessionId);
          return url.toString();
        },
        // Format 4: Input parameter
        () => {
          const url = new URL('https://navaneeth03.app.n8n.cloud/webhook/agent-chat');
          url.searchParams.append('input', userMessage);
          url.searchParams.append('sessionId', sessionId);
          return url.toString();
        }
      ];
      
      // Try each parameter format
      for (let i = 0; i < parameterFormats.length && !webhookWorked; i++) {
        try {
          const webhookUrl = parameterFormats[i]();
          console.log(`Trying webhook format ${i + 1}:`, webhookUrl);
          
          const response = await fetch(webhookUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': 'PropertyAgent/1.0',
            },
          });
          
          console.log(`Format ${i + 1} response status:`, response.status);
          
          if (response.ok) {
            responseText = await response.text();
            console.log(`Format ${i + 1} response text:`, responseText);
            
            // Check if we got a meaningful response
            if (responseText && responseText.trim() !== '' && responseText !== '{}') {
              webhookWorked = true;
              console.log(`Webhook format ${i + 1} worked!`);
              break;
            }
          }
        } catch (formatError) {
          console.log(`Format ${i + 1} failed:`, formatError);
        }
      }
      
      let data;
      let aiResponse = '';
      
      // Handle webhook response
      if (!webhookWorked || !responseText || responseText.trim() === '' || responseText === '{}') {
        console.log('Empty response from webhook, providing contextual response');
        
        // Provide more contextual responses based on the user's query
        const lowerMessage = userMessage.toLowerCase();
        if (lowerMessage.includes('budget') || lowerMessage.includes('price') || lowerMessage.includes('cost')) {
          aiResponse = `Regarding budget for "${userMessage}" - Property prices in Hyderabad vary significantly by location. Gachibowli and Hitech City typically range from ₹6,000-12,000 per sqft, while areas like Kompally and Miyapur offer more affordable options at ₹4,000-7,000 per sqft. What's your preferred budget range?`;
        } else if (lowerMessage.includes('location') || lowerMessage.includes('area') || lowerMessage.includes('where')) {
          aiResponse = `About locations for "${userMessage}" - Popular investment areas in Hyderabad include Gachibowli (IT hub), Kondapur (excellent connectivity), Manikonda (emerging area), and Kompally (affordable with good growth potential). Which specific location interests you?`;
        } else if (lowerMessage.includes('amenities') || lowerMessage.includes('facilities') || lowerMessage.includes('features')) {
          aiResponse = `Regarding amenities for "${userMessage}" - Modern projects typically offer clubhouses, swimming pools, gyms, children's play areas, and 24/7 security. Premium projects may include spa, tennis courts, and concierge services. What amenities are most important to you?`;
        } else if (lowerMessage.includes('investment') || lowerMessage.includes('roi') || lowerMessage.includes('returns')) {
          aiResponse = `For investment regarding "${userMessage}" - Hyderabad's IT corridor (Gachibowli, Hitech City, Kondapur) shows strong rental yields of 3-4% and capital appreciation of 8-12% annually. Emerging areas like Manikonda and Narsingi offer higher growth potential. What's your investment timeline?`;
        } else {
          aiResponse = `I understand your question about "${userMessage}". Based on current property market data in Hyderabad, I can help you with insights about locations, pricing, and property features. Could you be more specific about what aspect interests you most?`;
        }
      } else {
        try {
          data = JSON.parse(responseText);
          
          // Extract the AI response from various possible response formats
          if (typeof data === 'string') {
            aiResponse = data;
          } else if (data.message) {
            aiResponse = data.message;
          } else if (data.response) {
            aiResponse = data.response;
          } else if (data.text) {
            aiResponse = data.text;
          } else if (data.output) {
            aiResponse = data.output;
          } else if (data.result) {
            aiResponse = data.result;
          } else if (data.content) {
            aiResponse = data.content;
          } else {
            console.log('Unknown response format:', data);
            aiResponse = `I received your message about "${userMessage}". I'm here to help with property insights and market information in Hyderabad. What would you like to know?`;
          }
        } catch (parseError) {
          console.log('Failed to parse JSON response, using as plain text:', parseError);
          aiResponse = responseText;
        }
      }
      
      // Remove loading message and add AI response
      setChatMessages(prev => {
        const newMessages = prev.slice(0, -1); // Remove loading message
        return [...newMessages, { 
          type: 'assistant', 
          content: aiResponse
        }];
      });
      
    } catch (error) {
      console.error('Error calling n8n webhook:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // Remove loading message and add error response
      setChatMessages(prev => {
        const newMessages = prev.slice(0, -1); // Remove loading message
        return [...newMessages, { 
          type: 'assistant', 
          content: `I'm having trouble connecting to the AI service right now. The webhook may need to be configured to return a proper response. Error: ${errorMessage}` 
        }];
      });
    }
  };

  // Helper function to toggle multi-select values
  const toggleMultiSelect = (field: keyof WizardData, value: string) => {
    setWizardData(prev => {
      const currentArray = (prev[field] as string[]) || [];
      const isSelected = currentArray.includes(value);
      
      return {
        ...prev,
        [field]: isSelected 
          ? currentArray.filter(item => item !== value)
          : [...currentArray, value]
      };
    });
  };

  // Toggle dropdown visibility
  const toggleDropdown = (fieldName: string) => {
    setOpenDropdown(openDropdown === fieldName ? null : fieldName);
  };

  const handleSubmit = () => {
    console.log('Wizard Data:', wizardData);
    
    // Validate required fields
    if (wizardData.locationNames.length === 0) {
      toast({
        title: "Location Required",
        description: "Please select at least one location to search for properties.",
        variant: "destructive",
      });
      return;
    }

    if (wizardData.bhkFilters.length === 0) {
      toast({
        title: "BHK Configuration Required",
        description: "Please select at least one BHK configuration.",
        variant: "destructive",
      });
      return;
    }

    // Store search filters in localStorage for the results page
    localStorage.setItem('propertySearchFilters', JSON.stringify(wizardData));

    toast({
      title: "Search Initiated",
      description: `Searching for properties in ${wizardData.locationNames.join(', ')} with ${wizardData.bhkFilters.join(', ')} configuration.`,
    });

    // Navigate to results page
    setLocation('/agent/results');
  };

  const agentUsername = localStorage.getItem('agentUsername');
  const agentName = localStorage.getItem('agentName');
  const agentPhone = localStorage.getItem('agentPhone');
  const agentEmail = localStorage.getItem('agentEmail');

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Fixed Header */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md border-b">
          <div className="px-4 py-3">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-lg lg:text-xl font-bold text-gray-900">Property Search</h1>
                <p className="text-xs text-gray-600 hidden sm:block">Find your perfect property in Hyderabad</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg">
                  <UserIcon size={14} className="text-blue-600" />
                  <div className="text-xs">
                    <div className="font-medium text-gray-700 truncate max-w-20 sm:max-w-none">{agentName || agentUsername}</div>
                    {agentPhone && <div className="text-gray-500 truncate">{agentPhone}</div>}
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                  className="flex items-center gap-1 h-8 px-2"
                >
                  <LogOutIcon size={14} />
                  <span className="hidden sm:inline text-xs">Logout</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile-First Layout with top padding */}
        <div className="flex flex-col lg:flex-row h-screen pt-16 lg:pt-20">
          
          {/* Top Section - Property Search Form (60% on desktop, full width on mobile) */}
          <div className="flex-1 lg:w-3/5 overflow-y-auto">
            <div className="p-4 lg:p-6 space-y-6 pb-20 lg:pb-6">

              {/* Property Search Form - Mobile Optimized */}
              <Card className="shadow-lg border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg lg:text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Settings size={20} className="text-blue-600" />
                    Search Filters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* Location & Basic Criteria */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2 border-b pb-2">
                      <MapPin size={16} className="text-blue-600" />
                      Location & Basic Details
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-xs font-medium text-gray-700 mb-2 block">Locations * (Multiple)</Label>
                        <div className="relative">
                          <div 
                            className="border border-gray-300 rounded-md p-2 min-h-[44px] bg-white cursor-pointer flex items-center justify-between"
                            onClick={() => toggleDropdown('locationNames')}
                          >
                            <div className="flex-1">
                              {wizardData.locationNames.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {wizardData.locationNames.map((location) => (
                                    <span
                                      key={location}
                                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md"
                                    >
                                      {location}
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleMultiSelect('locationNames', location);
                                        }}
                                        className="hover:bg-blue-200 rounded-full p-0.5"
                                      >
                                        <X size={12} />
                                      </button>
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-gray-400 text-sm">Choose one or more locations</span>
                              )}
                            </div>
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                          {openDropdown === 'locationNames' && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                              {['Gachibowli', 'Hitech City', 'Kondapur', 'Madhapur', 'Jubilee Hills', 'Banjara Hills', 'Kukatpally', 'Miyapur', 'Begumpet', 'Ameerpet', 'Secunderabad', 'Kompally', 'Uppal', 'LB Nagar', 'Manikonda'].map((location) => (
                                <button
                                  key={location}
                                  onClick={() => toggleMultiSelect('locationNames', location)}
                                  className={`w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center justify-between ${
                                    wizardData.locationNames.includes(location) ? 'bg-blue-50 text-blue-700' : ''
                                  }`}
                                >
                                  <span className="text-sm">{location}</span>
                                  {wizardData.locationNames.includes(location) && <Check size={16} className="text-blue-600" />}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs font-medium text-gray-700 mb-2 block">Search Radius</Label>
                        <Select onValueChange={(value) => setWizardData(prev => ({ ...prev, searchRadius: parseInt(value) }))}>
                             <SelectTrigger className="h-11 text-gray-900 data-[placeholder]:text-gray-400">
                            <SelectValue  placeholder="Choose distance range" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 km</SelectItem>
                            <SelectItem value="2">2 km</SelectItem>
                            <SelectItem value="3">3 km</SelectItem>
                            <SelectItem value="5">5 km</SelectItem>
                            <SelectItem value="10">10 km</SelectItem>
                            <SelectItem value="15">15 km</SelectItem>
                            <SelectItem value="20">20 km</SelectItem>
                            <SelectItem value="25">25 km</SelectItem>
                            <SelectItem value="30">30 km</SelectItem>
                            <SelectItem value="50">50 km</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-xs font-medium text-gray-700 mb-2 block">BHK Types * (Multiple)</Label>
                        <div className="relative">
                          <div 
                            className="border border-gray-300 rounded-md p-2 min-h-[44px] bg-white cursor-pointer flex items-center justify-between"
                            onClick={() => toggleDropdown('bhkFilters')}
                          >
                            <div className="flex-1">
                              {wizardData.bhkFilters.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {wizardData.bhkFilters.map((bhk) => (
                                    <span
                                      key={bhk}
                                      className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-md"
                                    >
                                      {bhk}
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleMultiSelect('bhkFilters', bhk);
                                        }}
                                        className="hover:bg-green-200 rounded-full p-0.5"
                                      >
                                        <X size={12} />
                                      </button>
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-gray-400 text-sm">Choose apartment configurations</span>
                              )}
                            </div>
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                          {openDropdown === 'bhkFilters' && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                              {['1BHK', '2BHK', '3BHK', '4BHK', '5BHK'].map((bhk) => (
                                <button
                                  key={bhk}
                                  onClick={() => toggleMultiSelect('bhkFilters', bhk)}
                                  className={`w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center justify-between ${
                                    wizardData.bhkFilters.includes(bhk) ? 'bg-green-50 text-green-700' : ''
                                  }`}
                                >
                                  <span className="text-sm">{bhk}</span>
                                  {wizardData.bhkFilters.includes(bhk) && <Check size={16} className="text-green-600" />}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Budget & Property Type */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2 border-b pb-2">
                      <DollarSign size={16} className="text-blue-600" />
                      Budget & Property Type
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div>
                        <Label className="text-xs font-medium text-gray-700 mb-2 block">Budget Range</Label>
                        
                          <Select
                            value={
                              wizardData.minBudget && wizardData.maxBudget
                                ? `${wizardData.minBudget}-${wizardData.maxBudget}`
                                : undefined
                            }
                            onValueChange={(value) => {
                              const [min, max] = value.split('-').map(Number);
                              setWizardData(prev => ({ ...prev, minBudget: min, maxBudget: max }));
                            }}
                          >

                            <SelectTrigger className="h-11 text-gray-900 data-[placeholder]:text-gray-400">
                              <SelectValue placeholder="Choose your budget range" />
                            </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1000000-2500000">₹10L - ₹25L</SelectItem>
                            <SelectItem value="2500000-5000000">₹25L - ₹50L</SelectItem>
                            <SelectItem value="5000000-7500000">₹50L - ₹75L</SelectItem>
                            <SelectItem value="7500000-10000000">₹75L - ₹1Cr</SelectItem>
                            <SelectItem value="10000000-15000000">₹1Cr - ₹1.5Cr</SelectItem>
                            <SelectItem value="15000000-25000000">₹1.5Cr - ₹2.5Cr</SelectItem>
                            <SelectItem value="25000000-50000000">₹2.5Cr+</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-xs font-medium text-gray-700 mb-2 block">Property Types (Multiple)</Label>
                        <div className="relative">
                          <div 
                            className="border border-gray-300 rounded-md p-2 min-h-[44px] bg-white cursor-pointer flex items-center justify-between"
                            onClick={() => toggleDropdown('propertyTypes')}
                          >
                            <div className="flex-1">
                              {wizardData.propertyTypes.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {wizardData.propertyTypes.map((type) => (
                                    <span
                                      key={type}
                                      className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-md"
                                    >
                                      {type}
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleMultiSelect('propertyTypes', type);
                                        }}
                                        className="hover:bg-purple-200 rounded-full p-0.5"
                                      >
                                        <X size={12} />
                                      </button>
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-gray-400 text-sm">Choose property types</span>
                              )}
                            </div>
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                          {openDropdown === 'propertyTypes' && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                              {['Apartment', 'Villa', 'Plot', 'Commercial', 'Penthouse', 'Independent House', 'Duplex'].map((type) => (
                                <button
                                  key={type}
                                  onClick={() => toggleMultiSelect('propertyTypes', type)}
                                  className={`w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center justify-between ${
                                    wizardData.propertyTypes.includes(type) ? 'bg-purple-50 text-purple-700' : ''
                                  }`}
                                >
                                  <span className="text-sm">{type}</span>
                                  {wizardData.propertyTypes.includes(type) && <Check size={16} className="text-purple-600" />}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs font-medium text-gray-700 mb-2 block">Construction Status (Multiple)</Label>
                        <div className="relative">
                          <div 
                            className="border border-gray-300 rounded-md p-2 min-h-[44px] bg-white cursor-pointer flex items-center justify-between"
                            onClick={() => toggleDropdown('constructionStatus')}
                          >
                            <div className="flex-1">
                              {wizardData.constructionStatus.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {wizardData.constructionStatus.map((status) => (
                                    <span
                                      key={status}
                                      className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-md"
                                    >
                                      {status}
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleMultiSelect('constructionStatus', status);
                                        }}
                                        className="hover:bg-orange-200 rounded-full p-0.5"
                                      >
                                        <X size={12} />
                                      </button>
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-gray-400 text-sm">Choose construction status</span>
                              )}
                            </div>
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                          {openDropdown === 'constructionStatus' && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                              {['Ready to Move', 'Under Construction', 'New Launch', 'Resale'].map((status) => (
                                <button
                                  key={status}
                                  onClick={() => toggleMultiSelect('constructionStatus', status)}
                                  className={`w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center justify-between ${
                                    wizardData.constructionStatus.includes(status) ? 'bg-orange-50 text-orange-700' : ''
                                  }`}
                                >
                                  <span className="text-sm">{status}</span>
                                  {wizardData.constructionStatus.includes(status) && <Check size={16} className="text-orange-600" />}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs font-medium text-gray-700 mb-2 block">Size Range (sq.ft)</Label>
                        <div className="flex gap-2 items-center">
                          <input
                            type="number"
                            placeholder="Min sqft"
                            value={wizardData.minSqft}
                            onChange={(e) => setWizardData(prev => ({ ...prev, minSqft: parseInt(e.target.value) || 300 }))}
                            className="flex-1 px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
                          />
                          <span className="text-gray-400 text-sm">-</span>
                          <input
                            type="number"
                            placeholder="Max sqft"
                            value={wizardData.maxSqft}
                            onChange={(e) => setWizardData(prev => ({ ...prev, maxSqft: parseInt(e.target.value) || 5000 }))}
                            className="flex-1 px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Community & Project Features */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2 border-b pb-2">
                      <Home size={16} className="text-blue-600" />
                      Community & Project Features
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div>
                        <Label className="text-xs font-medium text-gray-700 mb-2 block">Community Type (Multiple)</Label>
                        <div className="relative">
                          <div 
                            className="border border-gray-300 rounded-md p-2 min-h-[44px] bg-white cursor-pointer flex items-center justify-between"
                            onClick={() => toggleDropdown('communityType')}
                          >
                            <div className="flex-1">
                              {wizardData.communityType.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {wizardData.communityType.map((type) => (
                                    <span
                                      key={type}
                                      className="inline-flex items-center gap-1 px-2 py-1 bg-cyan-100 text-cyan-800 text-xs rounded-md"
                                    >
                                      {type}
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleMultiSelect('communityType', type);
                                        }}
                                        className="hover:bg-cyan-200 rounded-full p-0.5"
                                      >
                                        <X size={12} />
                                      </button>
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-gray-400 text-sm">Choose community preferences</span>
                              )}
                            </div>
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                          {openDropdown === 'communityType' && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                              {['Gated', 'Non-Gated', 'Integrated Township'].map((type) => (
                                <button
                                  key={type}
                                  onClick={() => toggleMultiSelect('communityType', type)}
                                  className={`w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center justify-between ${
                                    wizardData.communityType.includes(type) ? 'bg-cyan-50 text-cyan-700' : ''
                                  }`}
                                >
                                  <span className="text-sm">{type}</span>
                                  {wizardData.communityType.includes(type) && <Check size={16} className="text-cyan-600" />}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs font-medium text-gray-700 mb-2 block">Project Density (Multiple)</Label>
                        <div className="relative">
                          <div 
                            className="border border-gray-300 rounded-md p-2 min-h-[44px] bg-white cursor-pointer flex items-center justify-between"
                            onClick={() => toggleDropdown('projectDensity')}
                          >
                            <div className="flex-1">
                              {wizardData.projectDensity.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {wizardData.projectDensity.map((density) => (
                                    <span
                                      key={density}
                                      className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-800 text-xs rounded-md"
                                    >
                                      {density}
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleMultiSelect('projectDensity', density);
                                        }}
                                        className="hover:bg-slate-200 rounded-full p-0.5"
                                      >
                                        <X size={12} />
                                      </button>
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-gray-400 text-sm">Choose project density</span>
                              )}
                            </div>
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                          {openDropdown === 'projectDensity' && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                              {['Low Density', 'Medium Density', 'High Density'].map((density) => (
                                <button
                                  key={density}
                                  onClick={() => toggleMultiSelect('projectDensity', density)}
                                  className={`w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center justify-between ${
                                    wizardData.projectDensity.includes(density) ? 'bg-slate-50 text-slate-700' : ''
                                  }`}
                                >
                                  <span className="text-sm">{density}</span>
                                  {wizardData.projectDensity.includes(density) && <Check size={16} className="text-slate-600" />}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs font-medium text-gray-700 mb-2 block">Min Open Space (%)</Label>
                        <Select onValueChange={(value) => setWizardData(prev => ({ ...prev, minOpenSpacePercentage: parseInt(value) }))}>
                          <SelectTrigger className="h-11 text-gray-900 data-[placeholder]:text-gray-400">
                            <SelectValue placeholder="Select min open space" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="20">20%</SelectItem>
                            <SelectItem value="30">30%</SelectItem>
                            <SelectItem value="40">40%</SelectItem>
                            <SelectItem value="50">50%</SelectItem>
                            <SelectItem value="60">60%</SelectItem>
                            <SelectItem value="70">70%</SelectItem>
                            <SelectItem value="80">80%</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="w-full">
                        <Label className="text-xs font-medium text-gray-700 mb-2 block">Total Units Range</Label>
                        <div className="flex gap-2 items-center w-full">
                          <input
                            type="number"
                            placeholder="Min"
                            value={wizardData.minUnits}
                            onChange={(e) => setWizardData(prev => ({ ...prev, minUnits: parseInt(e.target.value) || 10 }))}
                            className="flex-1 px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <span className="text-gray-400 text-sm">-</span>
                          <input
                            type="number"
                            placeholder="Max"
                            value={wizardData.maxUnits}
                            onChange={(e) => setWizardData(prev => ({ ...prev, maxUnits: parseInt(e.target.value) || 1000 }))}
                            className="flex-1 px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Amenities & Features */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2 border-b pb-2">
                      <Home size={16} className="text-blue-600" />
                      Amenities & Features
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-xs font-medium text-gray-700 mb-2 block">Key Amenities (Multiple)</Label>
                        <div className="relative">
                          <div 
                            className="border border-gray-300 rounded-md p-2 min-h-[44px] bg-white cursor-pointer flex items-center justify-between"
                            onClick={() => toggleDropdown('amenities')}
                          >
                            <div className="flex-1">
                              {wizardData.amenities.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {wizardData.amenities.map((amenity) => (
                                    <span
                                      key={amenity}
                                      className="inline-flex items-center gap-1 px-2 py-1 bg-teal-100 text-teal-800 text-xs rounded-md"
                                    >
                                      {amenity}
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleMultiSelect('amenities', amenity);
                                        }}
                                        className="hover:bg-teal-200 rounded-full p-0.5"
                                      >
                                        <X size={12} />
                                      </button>
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-gray-400 text-sm">Choose desired amenities</span>
                              )}
                            </div>
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                          {openDropdown === 'amenities' && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                              {['All', 'Swimming Pool', 'Clubhouse', 'Gym/Fitness Center', 'EV Charging', 'Children\'s Play Area', '24/7 Security', 'Garden/Landscaping', 'Parking', 'Power Backup', 'Lift/Elevator', 'Community Hall', 'Tennis Court', 'Jogging Track', 'CCTV Surveillance'].map((amenity) => (
                                <button
                                  key={amenity}
                                  onClick={() => toggleMultiSelect('amenities', amenity)}
                                  className={`w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center justify-between ${
                                    wizardData.amenities.includes(amenity) ? 'bg-teal-50 text-teal-700' : ''
                                  }`}
                                >
                                  <span className="text-sm">{amenity}</span>
                                  {wizardData.amenities.includes(amenity) && <Check size={16} className="text-teal-600" />}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs font-medium text-gray-700 mb-2 block">Parking</Label>
                        <Select onValueChange={(value) => setWizardData(prev => ({ ...prev, parking: value }))}>
                          <SelectTrigger className="h-11 text-gray-900 data-[placeholder]:text-gray-400">
                            <SelectValue placeholder="Choose parking type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Any</SelectItem>
                            <SelectItem value="covered">Covered</SelectItem>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="both">Both</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-xs font-medium text-gray-700 mb-2 block">Power Backup</Label>
                        <Select value={wizardData.powerBackup} onValueChange={(value) => setWizardData(prev => ({ ...prev, powerBackup: value }))}>
                          <SelectTrigger className="h-11 text-gray-900 data-[placeholder]:text-gray-400">
                            <SelectValue placeholder="Choose your preference" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Any</SelectItem>
                            <SelectItem value="yes">Required</SelectItem>
                            <SelectItem value="no">Not Required</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-xs font-medium text-gray-700 mb-2 block">Facing Directions (Multiple)</Label>
                        <div className="relative">
                          <div 
                            className="border border-gray-300 rounded-md p-2 min-h-[44px] bg-white cursor-pointer flex items-center justify-between"
                            onClick={() => toggleDropdown('facingDirections')}
                          >
                            <div className="flex-1">
                              {wizardData.facingDirections && wizardData.facingDirections.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {wizardData.facingDirections.map((direction) => (
                                    <span
                                      key={direction}
                                      className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-md"
                                    >
                                      {direction}
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleMultiSelect('facingDirections', direction);
                                        }}
                                        className="hover:bg-indigo-200 rounded-full p-0.5"
                                      >
                                        <X size={12} />
                                      </button>
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-gray-400 text-sm">Choose preferred directions</span>
                              )}
                            </div>
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                          {openDropdown === 'facingDirections' && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                              {['Any', 'North', 'South', 'East', 'West', 'North-East', 'North-West', 'South-East', 'South-West'].map((direction) => (
                                <button
                                  key={direction}
                                  onClick={() => toggleMultiSelect('facingDirections', direction)}
                                  className={`w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center justify-between ${
                                    wizardData.facingDirections?.includes(direction) ? 'bg-indigo-50 text-indigo-700' : ''
                                  }`}
                                >
                                  <span className="text-sm">{direction}</span>
                                  {wizardData.facingDirections?.includes(direction) && <Check size={16} className="text-indigo-600" />}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs font-medium text-gray-700 mb-2 block">Floor Preference</Label>
                        <Select onValueChange={(value) => setWizardData(prev => ({ ...prev, floorPreference: value }))}>
                          <SelectTrigger className="h-11 text-gray-900 data-[placeholder]:text-gray-400">
                            <SelectValue placeholder="Choose floor preference" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Any Floor</SelectItem>
                            <SelectItem value="ground">Ground</SelectItem>
                            <SelectItem value="low">Low (1-3)</SelectItem>
                            <SelectItem value="mid">Mid (4-8)</SelectItem>
                            <SelectItem value="high">High (9+)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-xs font-medium text-gray-700 mb-2 block">Furnishing</Label>
                        <Select onValueChange={(value) => setWizardData(prev => ({ ...prev, furnishing: value }))}>
                          <SelectTrigger className="h-11 text-gray-900 data-[placeholder]:text-gray-400">
                            <SelectValue placeholder="Select furnishing" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Any</SelectItem>
                            <SelectItem value="unfurnished">Unfurnished</SelectItem>
                            <SelectItem value="semi-furnished">Semi-Furnished</SelectItem>
                            <SelectItem value="fully-furnished">Fully Furnished</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Additional Property Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 border-b border-gray-200 pb-2">
                      <Settings size={20} className="text-blue-600" />
                      Property & Financial Details
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-xs font-medium text-gray-700 mb-2 block">Bank Tie-ups (Multiple)</Label>
                        <div className="relative">
                          <div 
                            className="border border-gray-300 rounded-md p-2 min-h-[44px] bg-white cursor-pointer flex items-center justify-between"
                            onClick={() => toggleDropdown('bankTieups')}
                          >
                            <div className="flex-1">
                              {wizardData.bankTieups.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {wizardData.bankTieups.map((bank) => (
                                    <span
                                      key={bank}
                                      className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-800 text-xs rounded-md"
                                    >
                                      {bank}
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleMultiSelect('bankTieups', bank);
                                        }}
                                        className="hover:bg-emerald-200 rounded-full p-0.5"
                                      >
                                        <X size={12} />
                                      </button>
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-gray-400 text-sm">Choose preferred banks</span>
                              )}
                            </div>
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                          {openDropdown === 'bankTieups' && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                              {['Any', 'SBI', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra', 'Bank of Baroda', 'Punjab National Bank', 'Canara Bank', 'Union Bank', 'IDBI Bank', 'Yes Bank', 'IndusInd Bank'].map((bank) => (
                                <button
                                  key={bank}
                                  onClick={() => toggleMultiSelect('bankTieups', bank)}
                                  className={`w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center justify-between ${
                                    wizardData.bankTieups.includes(bank) ? 'bg-emerald-50 text-emerald-700' : ''
                                  }`}
                                >
                                  <span className="text-sm">{bank}</span>
                                  {wizardData.bankTieups.includes(bank) && <Check size={16} className="text-emerald-600" />}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs font-medium text-gray-700 mb-2 block">Land Ownership (Multiple)</Label>
                        <div className="relative">
                          <div 
                            className="border border-gray-300 rounded-md p-2 min-h-[44px] bg-white cursor-pointer flex items-center justify-between"
                            onClick={() => toggleDropdown('landOwnership')}
                          >
                            <div className="flex-1">
                              {wizardData.landOwnership.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {wizardData.landOwnership.map((ownership) => (
                                    <span
                                      key={ownership}
                                      className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-md"
                                    >
                                      {ownership}
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleMultiSelect('landOwnership', ownership);
                                        }}
                                        className="hover:bg-amber-200 rounded-full p-0.5"
                                      >
                                        <X size={12} />
                                      </button>
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-gray-400 text-sm">Choose land ownership type</span>
                              )}
                            </div>
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                          {openDropdown === 'landOwnership' && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                              {['Owned', 'Joint Development', 'Leasehold'].map((ownership) => (
                                <button
                                  key={ownership}
                                  onClick={() => toggleMultiSelect('landOwnership', ownership)}
                                  className={`w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center justify-between ${
                                    wizardData.landOwnership.includes(ownership) ? 'bg-amber-50 text-amber-700' : ''
                                  }`}
                                >
                                  <span className="text-sm">{ownership}</span>
                                  {wizardData.landOwnership.includes(ownership) && <Check size={16} className="text-amber-600" />}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs font-medium text-gray-700 mb-2 block">Ground Vehicular Movement (Multiple)</Label>
                        <div className="relative">
                          <div 
                            className="border border-gray-300 rounded-md p-2 min-h-[44px] bg-white cursor-pointer flex items-center justify-between"
                            onClick={() => toggleDropdown('vehicularMovement')}
                          >
                            <div className="flex-1">
                              {wizardData.vehicularMovement.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {wizardData.vehicularMovement.map((movement) => (
                                    <span
                                      key={movement}
                                      className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-md"
                                    >
                                      {movement}
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleMultiSelect('vehicularMovement', movement);
                                        }}
                                        className="hover:bg-red-200 rounded-full p-0.5"
                                      >
                                        <X size={12} />
                                      </button>
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-gray-400 text-sm">Choose preferences</span>
                              )}
                            </div>
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                          {openDropdown === 'vehicularMovement' && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                              {['Allowed', 'Restricted', 'Not Allowed'].map((movement) => (
                                <button
                                  key={movement}
                                  onClick={() => toggleMultiSelect('vehicularMovement', movement)}
                                  className={`w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center justify-between ${
                                    wizardData.vehicularMovement.includes(movement) ? 'bg-red-50 text-red-700' : ''
                                  }`}
                                >
                                  <span className="text-sm">{movement}</span>
                                  {wizardData.vehicularMovement.includes(movement) && <Check size={16} className="text-red-600" />}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs font-medium text-gray-700 mb-2 block">Lifts Available</Label>
                        <Select onValueChange={(value) => setWizardData(prev => ({ ...prev, liftsAvailability: value }))}>
                          <SelectTrigger className="h-11 text-gray-900 data-[placeholder]:text-gray-400">
                            <SelectValue placeholder="Choose lift requirement" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Any</SelectItem>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="w-full">
                        <Label className="text-xs font-medium text-gray-700 mb-2 block">Common Area Loading (%)</Label>
                        <div className="flex gap-2 items-center w-full">
                          <input
                            type="number"
                            placeholder="Min loading %"
                            min="10"
                            max="50"
                            value={wizardData.minCommonAreaLoading}
                            onChange={(e) => setWizardData(prev => ({ ...prev, minCommonAreaLoading: parseInt(e.target.value) || 10 }))}
                            className="flex-1 px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
                          />
                          <span className="text-gray-400 text-sm">-</span>
                          <input
                            type="number"
                            placeholder="Max loading %"
                            min="10"
                            max="50"
                            value={wizardData.maxCommonAreaLoading}
                            onChange={(e) => setWizardData(prev => ({ ...prev, maxCommonAreaLoading: parseInt(e.target.value) || 50 }))}
                            className="flex-1 px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
                          />
                        </div>
                      </div>

                      <div className="w-full">
                        <Label className="text-xs font-medium text-gray-700 mb-2 block">Land Area (acres)</Label>
                        <div className="flex gap-2 items-center w-full">
                          <input
                            type="number"
                            placeholder="Min acres"
                            step="0.5"
                            min="0.5"
                            max="100"
                            value={wizardData.minLandAreaAcres}
                            onChange={(e) => setWizardData(prev => ({ ...prev, minLandAreaAcres: parseFloat(e.target.value) || 0.5 }))}
                            className="flex-1 px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
                          />
                          <span className="text-gray-400 text-sm">-</span>
                          <input
                            type="number"
                            placeholder="Max acres"
                            step="0.5"
                            min="0.5"
                            max="100"
                            value={wizardData.maxLandAreaAcres}
                            onChange={(e) => setWizardData(prev => ({ ...prev, maxLandAreaAcres: parseFloat(e.target.value) || 100 }))}
                            className="flex-1 px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Search Button */}
                  <div className="pt-4">
                    <Button 
                      onClick={handleSubmit}
                      className="w-full lg:w-auto bg-blue-600 hover:bg-blue-700 text-white h-12 flex items-center justify-center gap-2 text-base font-semibold"
                      disabled={wizardData.locationNames.length === 0 || wizardData.bhkFilters.length === 0}
                    >
                      <SearchIcon size={20} />
                      Search Properties
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* AI Assistant Section (40% on desktop, bottom on mobile) */}
          <div className="lg:w-2/5 bg-white border-t-2 lg:border-t-0 lg:border-l-2 border-gray-200 flex flex-col h-96 lg:h-full">
            <div className="p-4 lg:p-6 flex flex-col h-full">
              
              {/* Chat Header */}
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <MessageCircle size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">AI Property Assistant</h3>
                  <p className="text-xs text-gray-500">Get instant property insights</p>
                </div>
              </div>

              {/* Chat Messages */}
              <div ref={chatContainerRef} className="flex-1 overflow-y-auto space-y-4 mb-6 px-2">
                {chatMessages.map((message, index) => (
                  <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-lg shadow-sm ${
                      message.type === 'user' 
                        ? 'bg-blue-600 text-white ml-4 rounded-br-sm' 
                        : 'bg-gray-100 text-gray-800 mr-4 rounded-bl-sm'
                    }`}>
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                ))}
                {/* Auto-scroll target */}
                <div ref={chatMessagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask about property insights, market trends, locations..."
                    className="flex-1 px-4 py-3 border border-blue-200 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-700 placeholder-gray-400 bg-white shadow-sm"
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={!chatMessage.trim()}
                    className="w-11 h-11 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}