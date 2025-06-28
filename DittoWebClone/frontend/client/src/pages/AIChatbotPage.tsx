import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Bot, Menu, Search, MessageSquare } from 'lucide-react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface ChatMessage {
  type: 'user' | 'assistant';
  content: string;
}

export default function AIChatbotPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      type: 'assistant',
      content: 'Hello! Welcome to Relai AI Assistant. I can help you find properties, provide market insights, and answer questions about real estate in Hyderabad. What would you like to know?'
    }
  ]);

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
          const url = new URL('https://navaneeth03.app.n8n.cloud/webhook/my-webhook');
          url.searchParams.append('message', userMessage);
          url.searchParams.append('sessionId', sessionId);
          url.searchParams.append('context', 'property_search');
          url.searchParams.append('agent', 'Public User');
          return url.toString();
        },
        // Format 2: Single query parameter
        () => {
          const url = new URL('https://navaneeth03.app.n8n.cloud/webhook/my-webhook');
          url.searchParams.append('query', userMessage);
          url.searchParams.append('sessionId', sessionId);
          return url.toString();
        },
        // Format 3: Text parameter
        () => {
          const url = new URL('https://navaneeth03.app.n8n.cloud/webhook/my-webhook');
          url.searchParams.append('text', userMessage);
          url.searchParams.append('sessionId', sessionId);
          return url.toString();
        },
        // Format 4: Input parameter
        () => {
          const url = new URL('https://navaneeth03.app.n8n.cloud/webhook/my-webhook');
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
      
      let aiResponse = '';
      
      // Handle webhook response
      if (!webhookWorked || !responseText || responseText.trim() === '' || responseText === '{}') {
        console.log('Empty response from webhook, providing contextual response');
        
        // Provide contextual fallback responses based on message content
        const lowerMessage = userMessage.toLowerCase();
        if (lowerMessage.includes('price') || lowerMessage.includes('budget') || lowerMessage.includes('cost')) {
          aiResponse = "I'd be happy to help with pricing information! Property prices in Hyderabad vary by location and amenities. Could you specify which area you're interested in and your budget range?";
        } else if (lowerMessage.includes('location') || lowerMessage.includes('area') || lowerMessage.includes('where')) {
          aiResponse = "Hyderabad has many excellent areas for property investment. Popular locations include Gachibowli, HITEC City, Financial District, and Kondapur. What type of connectivity and amenities are important to you?";
        } else if (lowerMessage.includes('bhk') || lowerMessage.includes('bedroom') || lowerMessage.includes('size')) {
          aiResponse = "We have properties ranging from 1BHK to 4BHK configurations. The choice depends on your family size and budget. What configuration are you looking for?";
        } else {
          aiResponse = "I'm here to help you with your property search in Hyderabad. I can provide information about locations, pricing, amenities, and property recommendations. What specific information would you like to know?";
        }
      } else {
        try {
          // Try to parse as JSON first
          const data = JSON.parse(responseText);
          
          if (data.output) {
            aiResponse = data.output;
          } else if (data.response) {
            aiResponse = data.response;
          } else if (data.message) {
            aiResponse = data.message;
          } else if (typeof data === 'string') {
            aiResponse = data;
          } else {
            aiResponse = JSON.stringify(data);
          }
          
          console.log('Processed AI response:', aiResponse);
        } catch (parseError) {
          // If not JSON, use as plain text
          aiResponse = responseText;
          console.log('Using plain text response:', aiResponse);
        }
      }
      
      // Remove loading message and add AI response
      setChatMessages(prev => {
        const withoutLoading = prev.slice(0, -1);
        return [...withoutLoading, { type: 'assistant', content: aiResponse }];
      });
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Remove loading message and add error response
      setChatMessages(prev => {
        const withoutLoading = prev.slice(0, -1);
        return [...withoutLoading, { 
          type: 'assistant', 
          content: 'I apologize, but I\'m having trouble connecting right now. Please try again or contact our support team for assistance.' 
        }];
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Fixed header for the AI chat page */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center text-[#1752FF] hover:text-blue-700 transition-colors">
                <ChevronLeft className="h-5 w-5 mr-1" />
                <span className="font-medium">Back to Home</span>
              </Link>
            </div>
            
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <Bot className="h-6 w-6 text-[#1752FF]" />
                <h1 className="text-xl font-bold">Relai AI Assistant</h1>
              </div>
            </div>
            
            <div className="flex items-center">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-full">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-white p-6">
                  <div className="flex flex-col h-full">
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold mb-4">Options</h2>
                      
                      <div className="space-y-4">
                        <Link href="/property-wizard">
                          <Button 
                            variant="outline" 
                            className="w-full justify-start border-[#1752FF] text-[#1752FF] hover:bg-[#1752FF]/10"
                          >
                            <Search className="h-5 w-5 mr-2" />
                            Use Property Wizard
                          </Button>
                        </Link>
                        
                        <a href="https://wa.me/918881088890" target="_blank" rel="noopener noreferrer">
                          <Button 
                            variant="outline" 
                            className="w-full justify-start border-[#1752FF] text-[#1752FF] hover:bg-[#1752FF]/10"
                          >
                            <MessageSquare className="h-5 w-5 mr-2" />
                            Chat with a Human Expert
                          </Button>
                        </a>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-6 pb-4">
                      <h3 className="font-medium mb-3">Example Questions</h3>
                      <ul className="space-y-2 text-sm">
                        <li 
                          className="p-2 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer"
                          onClick={() => setChatMessage("What are the best 3BHK options in Financial District?")}
                        >
                          What are the best 3BHK options in Financial District?
                        </li>
                        <li 
                          className="p-2 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer"
                          onClick={() => setChatMessage("Show me properties under 1 crore in Gachibowli")}
                        >
                          Show me properties under 1 crore in Gachibowli
                        </li>
                        <li 
                          className="p-2 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer"
                          onClick={() => setChatMessage("Which areas have the best investment potential?")}
                        >
                          Which areas have the best investment potential?
                        </li>
                        <li 
                          className="p-2 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer"
                          onClick={() => setChatMessage("Tell me about ready-to-move properties in Kondapur")}
                        >
                          Tell me about ready-to-move properties in Kondapur
                        </li>
                      </ul>
                    </div>
                    
                    <div className="mt-auto border-t border-gray-200 pt-6">
                      <p className="text-xs text-gray-500">
                        Relai AI Assistant is powered by advanced models trained on real estate data in Hyderabad. 
                        It provides personalized property recommendations and answers to your queries.
                      </p>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content area - Direct Chatbot Interface */}
      <main className="flex-1 p-4 md:p-6 flex flex-col">
        <div className="max-w-4xl w-full mx-auto flex-1 flex flex-col">
          {/* Web Bot Interface */}
          <motion.div
            className="w-full h-[calc(100vh-200px)] min-h-[600px]"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-white rounded-lg shadow-lg h-full flex flex-col">
              {/* Header */}
              <div className="flex justify-between items-center p-4 border-b">
                <div className="flex items-center space-x-2">
                  <Bot className="w-5 h-5 text-[#1752FF]" />
                  <h3 className="text-lg font-semibold">AI Assistant</h3>
                </div>
                <Link href="/">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ← Back to Home
                  </Button>
                </Link>
              </div>
              
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-[#1752FF] text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Chat Input */}
              <div className="border-t p-4">
                <div className="flex space-x-2">
                  <textarea
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about properties, areas, or prices in Hyderabad..."
                    className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#1752FF] focus:border-transparent"
                    rows={1}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!chatMessage.trim()}
                    className="bg-[#1752FF] hover:bg-blue-700 text-white px-4 py-3"
                  >
                    Send
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}