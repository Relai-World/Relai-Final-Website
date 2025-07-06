import { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  MessageCircle, 
  Send, 
  Search,
  MapPin,
  Home,
  IndianRupee,
  Calendar,
  Building,
  Users,
  Car,
  Zap,
  Shield,
  TreePine,
  Filter
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * Helper to get property image path with correct port
 */
function getPropertyImagePath(property: any): string {
  const API_URL = "http://13.235.48.178:5001";  
  if (property.images && property.images.length > 0) {
    if (property.images[0].startsWith('http')) return property.images[0];
    // Remove '/property_images/' if present
    const imgName = property.images[0].replace(/^\/property_images\//, '');
    return `${API_URL}/property_images/${imgName}`;
  }
  const name = (property.ProjectName || '').toLowerCase().replace(/\s+/g, '_20');
  const loc = (property.Location || '').toLowerCase().replace(/\s+/g, '_20');
  if (!name || !loc) return '/img/placeholder-property.png';
  // Remove '/property_images/' from the start if present
  const imgName = `${name}_${loc}_0.jpg`.replace(/^\/property_images\//, '');
  return `${API_URL}/property_images/${imgName}`;
}

interface Property {
  id: string;
  ProjectName: string;
  DeveloperName: string;
  Location: string;
  PropertyType: string;
  'Min Budget': number;
  'Max Budget': number;
  'Project Price per SFT': number;
  MinSizeSqft: number;
  MaxSizeSqft: number;
  Configurations: string;
  PossessionDate: string;
  'Type of Community': string;
  TotalUnits: number;
  AreaSizeAcres: number;
  images?: string[];
}

export default function PropertyResultsPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      type: 'assistant',
      content: 'Great! I found matching properties for your search criteria. You can ask me about specific properties, compare options, or get insights about the locations and pricing.'
    }
  ]);

  // Get search filters from URL params or localStorage
  useEffect(() => {
    const searchFilters = localStorage.getItem('propertySearchFilters');
    if (searchFilters) {
      fetchProperties(JSON.parse(searchFilters));
    } else {
      // Redirect back to wizard if no search criteria
      setLocation('/agent/wizard');
    }
  }, [setLocation]);

  const fetchProperties = async (filters: any) => {
    try {
      setLoading(true);
      const response = await fetch('/api/properties/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch properties');
      }

      const data = await response.json();
      setProperties(data.properties || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast({
        title: "Error",
        description: "Failed to load properties. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    
    setChatMessages(prev => [...prev, 
      { type: 'user', content: chatMessage },
      { type: 'assistant', content: `I can help you with information about "${chatMessage}". Based on the current property results, I can provide detailed insights about pricing, locations, amenities, and help you compare different options.` }
    ]);
    setChatMessage('');
  };

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(1)}Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)}L`;
    } else {
      return `₹${price.toLocaleString()}`;
    }
  };

  const handleBackToSearch = () => {
    setLocation('/agent/wizard');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 lg:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToSearch}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Back to Search
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Property Search Results</h1>
              <p className="text-sm text-gray-600">{properties.length} properties found</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">agent123</span>
            <Button variant="outline" size="sm">Logout</Button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Property Results - 60% */}
        <div className="flex-1 lg:w-3/5 overflow-y-auto">
          <div className="p-4 lg:p-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading properties...</p>
                </div>
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-12">
                <Search size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Properties Found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your search filters to see more results.</p>
                <Button onClick={handleBackToSearch}>
                  <Filter size={16} className="mr-2" />
                  Modify Search
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {properties.map((property) => (
                  <Card key={property.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                        {/* Property Image */}
                        <div className="lg:col-span-1">
                          <div className="w-full h-48 lg:h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                            {property.images && property.images.length > 0 ? (
                              <img 
                                src={getPropertyImagePath(property)} 
                                alt={property.ProjectName}
                                className="w-full h-full object-cover rounded-lg"
                                onError={e => { (e.target as HTMLImageElement).src = '/img/placeholder-property.png'; }}
                              />
                            ) : (
                              <Building size={32} className="text-gray-400" />
                            )}
                          </div>
                        </div>

                        {/* Property Details */}
                        <div className="lg:col-span-3">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                {property.ProjectName}
                              </h3>
                              <p className="text-sm text-gray-600 mb-2">by {property.DeveloperName}</p>
                              <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                                <MapPin size={14} />
                                {property.Location}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-gray-900">
                                {formatPrice(property['Min Budget'])} - {formatPrice(property['Max Budget'])}
                              </div>
                              <div className="text-sm text-gray-600">
                                ₹{property['Project Price per SFT']?.toLocaleString()}/sqft
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                            <div className="flex items-center gap-2">
                              <Home size={14} className="text-gray-500" />
                              <span className="text-sm text-gray-700">{property.Configurations}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Building size={14} className="text-gray-500" />
                              <span className="text-sm text-gray-700">{property.PropertyType}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar size={14} className="text-gray-500" />
                              <span className="text-sm text-gray-700">{property.PossessionDate}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users size={14} className="text-gray-500" />
                              <span className="text-sm text-gray-700">{property.TotalUnits} units</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {property['Type of Community']}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {property.MinSizeSqft}-{property.MaxSizeSqft} sqft
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {property.AreaSizeAcres} acres
                              </Badge>
                            </div>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* AI Assistant Section - 40% (Static) */}
        <div className="lg:w-2/5 bg-white border-l-2 border-gray-200 flex flex-col h-full">
          <div className="p-4 lg:p-6 flex flex-col h-full">
            
            {/* Chat Header */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <MessageCircle size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">AI Property Assistant</h3>
                <p className="text-xs text-gray-500">Get insights about your search results</p>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-6 px-2">
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
            </div>

            {/* Chat Input */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask about these properties, compare options..."
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
  );
}