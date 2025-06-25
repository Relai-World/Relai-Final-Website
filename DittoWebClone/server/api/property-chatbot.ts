import { Request, Response } from 'express';
import OpenAI from 'openai';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

// Initialize OpenAI API
const openai = new OpenAI({
  apiKey: "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"
});

// Mock properties for demo - in production, this would be replaced with actual Google Sheets data
const mockProperties = [
  {
    id: '1',
    name: 'Luxury Villa in Banjara Hills',
    type: 'Villa',
    bedrooms: 4,
    bathrooms: 4.5,
    price: 45000000, // 4.5 Crore
    location: 'Banjara Hills',
    area: 4200, // sq ft
    amenities: ['Swimming Pool', 'Garden', 'Gym', 'Security', 'Clubhouse'],
    description: 'Luxury villa with modern architecture and premium finishes in the upscale Banjara Hills area.'
  },
  {
    id: '2',
    name: 'Modern Apartment in Gachibowli',
    type: 'Apartment',
    bedrooms: 3,
    bathrooms: 3,
    price: 12500000, // 1.25 Crore
    location: 'Gachibowli',
    area: 1850, // sq ft
    amenities: ['Gym', 'Swimming Pool', 'Security', 'Parking', 'Children\'s Play Area'],
    description: 'Spacious 3BHK apartment in Gachibowli with premium amenities and close to IT parks.'
  },
  {
    id: '3',
    name: 'Premium Villa in Jubilee Hills',
    type: 'Villa',
    bedrooms: 5,
    bathrooms: 5.5,
    price: 80000000, // 8 Crore
    location: 'Jubilee Hills',
    area: 6000, // sq ft
    amenities: ['Swimming Pool', 'Garden', 'Gym', 'Home Theater', 'Security', 'Clubhouse'],
    description: 'Luxurious 5BHK villa in the exclusive Jubilee Hills area with high-end finishes and amenities.'
  },
  {
    id: '4',
    name: 'Budget Apartment in Kukatpally',
    type: 'Apartment',
    bedrooms: 2,
    bathrooms: 2,
    price: 4500000, // 45 Lakh
    location: 'Kukatpally',
    area: 1100, // sq ft
    amenities: ['Security', 'Parking', 'Children\'s Play Area', 'Community Hall'],
    description: 'Affordable 2BHK apartment in Kukatpally with good connectivity to HITEC City.'
  },
  {
    id: '5',
    name: 'Residential Plot in Financial District',
    type: 'Plot',
    price: 18000000, // 1.8 Crore
    location: 'Financial District',
    area: 2400, // sq ft
    amenities: ['Gated Community', 'Security', 'Water Supply', 'Electricity'],
    description: 'Premium residential plot in rapidly developing Financial District with excellent investment potential.'
  },
  {
    id: '6',
    name: 'Premium Apartment in HITEC City',
    type: 'Apartment',
    bedrooms: 3,
    bathrooms: 3,
    price: 15000000, // 1.5 Crore
    location: 'HITEC City',
    area: 2000, // sq ft
    amenities: ['Gym', 'Swimming Pool', 'Security', 'Parking', 'Clubhouse'],
    description: 'Premium 3BHK apartment in the heart of HITEC City with luxury amenities and modern facilities.'
  },
  {
    id: '7',
    name: 'Independent House in Kondapur',
    type: 'Independent House',
    bedrooms: 3,
    bathrooms: 3,
    price: 9000000, // 90 Lakh
    location: 'Kondapur',
    area: 1800, // sq ft
    amenities: ['Garden', 'Parking', 'Security'],
    description: 'Spacious independent house in Kondapur with personal garden and good connectivity.'
  },
  {
    id: '8',
    name: 'Luxury Apartment in Madhapur',
    type: 'Apartment',
    bedrooms: 4,
    bathrooms: 4,
    price: 20000000, // 2 Crore
    location: 'Madhapur',
    area: 2400, // sq ft
    amenities: ['Gym', 'Swimming Pool', 'Security', 'Parking', 'Clubhouse', 'Tennis Court'],
    description: 'Luxurious 4BHK apartment in prime location of Madhapur with high-end amenities and finishes.'
  }
];

// Function to fetch property data from Google Sheets
async function getPropertiesFromSheet() {
  try {
    // Import the fetchAllProperties function
    const { fetchAllProperties } = await import('./google-sheets-fixed');
    
    // Fetch actual property data
    const properties = await fetchAllProperties();
    
    // Filter out any null values
    const validProperties = properties.filter(p => p !== null);
    
    // Return actual properties or fall back to mock data if none found
    return validProperties.length > 0 ? validProperties : mockProperties;
  } catch (error) {
    console.error('Error fetching properties:', error);
    return mockProperties; // Fallback to mock data
  }
}

// Format price for better readability
function formatPrice(price: number): string {
  if (price >= 10000000) {
    return `₹${(price / 10000000).toFixed(2)} Crore`;
  } else if (price >= 100000) {
    return `₹${(price / 100000).toFixed(2)} Lakh`;
  } else {
    return `₹${price.toLocaleString()}`;
  }
}

export async function propertyChatbotHandler(req: Request, res: Response) {
  try {
    const { message, conversationHistory } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get properties data
    const properties = await getPropertiesFromSheet();

    // Format properties for better context
    const formattedProperties = properties.map(p => ({
      ...p,
      formattedPrice: formatPrice(p.price),
      amenitiesString: p.amenities?.join(', ')
    }));

    // Prepare system prompt with properties data
    const systemPrompt = `
      You are an AI assistant for Relai, a real estate company in Hyderabad, India.
      Your task is to help users find properties that match their preferences.
      
      Here's the current property database:
      ${JSON.stringify(formattedProperties, null, 2)}
      
      Use this database to recommend properties based on user preferences.
      Be conversational, friendly, and professional, while providing accurate information.
      
      When recommending properties:
      1. Ask for clarification if user requirements are unclear
      2. Always provide property details including location, type, price, amenities
      3. Recommend 2-3 properties at most in each response
      4. Always provide prices in both exact numbers and in Crore/Lakh format
      5. If no properties match exactly, suggest close alternatives
      
      Don't make up properties that aren't in the database.
      If user asks about something not related to real estate or Hyderabad properties, politely bring the conversation back to property discussions.
    `;

    // Create messages array with conversation history
    const messages = [
      { role: 'system', content: systemPrompt },
      ...((conversationHistory || []) as { role: 'user' | 'assistant', content: string }[]),
      { role: 'user', content: message }
    ];

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 1000,
    });

    const assistantResponse = response.choices[0].message.content;

    return res.status(200).json({
      response: assistantResponse,
      conversationHistory: [
        ...((conversationHistory || []) as { role: 'user' | 'assistant', content: string }[]),
        { role: 'user', content: message },
        { role: 'assistant', content: assistantResponse }
      ]
    });
  } catch (error: any) {
    console.error('Property chatbot error:', error);
    return res.status(500).json({ 
      error: 'An error occurred with the property chatbot', 
      details: error.message 
    });
  }
}