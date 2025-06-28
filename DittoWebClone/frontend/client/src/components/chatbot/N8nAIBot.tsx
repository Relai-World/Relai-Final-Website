import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Send } from 'lucide-react';
import axios, { AxiosError } from 'axios';
import { motion } from 'framer-motion';
import PropertyCardList from './PropertyCardList';
import { parsePropertyInfo, messageContainsProperties } from './parsePropertyInfo';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  showPropertyCards?: boolean;
}

interface N8nAIBotProps {
  apiUrl?: string;
  apiKey?: string;
  initialMessage?: string;
  fullHeight?: boolean;
}

const N8nAIBot: React.FC<N8nAIBotProps> = ({
  apiUrl = '/api/n8n-bot',
  apiKey = '',
  initialMessage = "",
  fullHeight = false,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Create a unique session ID for this chat conversation
  const [sessionId] = useState<string>(`session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);

  // Log session ID on component mount
  useEffect(() => {
    console.log(`Chat session started with ID: ${sessionId}`);
    
    // Only add initial message if it's not empty
    if (initialMessage) {
      setMessages([
        {
          id: '0',
          text: initialMessage,
          sender: 'bot',
          timestamp: new Date(),
        },
      ]);
    }

    // Removed all aggressive mobile scrolling behaviors
    // Users should stay exactly where they are when typing
  }, [initialMessage, sessionId]);

  // Auto-scroll only within chatbox for new messages
  useEffect(() => {
    if (messages.length > 0) {
      // Scroll to bottom within the chatbox only
      if (messagesEndRef.current) {
        const chatContainer = messagesEndRef.current.closest('.overflow-y-auto');
        if (chatContainer) {
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }
      }
    }
    
    // Ensure input stays focused after any message change
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 50);
  }, [messages]);

  // Permanent focus effect - keep cursor in input box
  useEffect(() => {
    const maintainFocus = () => {
      if (inputRef.current && document.activeElement !== inputRef.current) {
        inputRef.current.focus();
      }
    };

    // Initial focus
    setTimeout(maintainFocus, 100);
    
    // Maintain focus on any click or interaction
    const handleClick = () => {
      setTimeout(maintainFocus, 50);
    };
    
    document.addEventListener('click', handleClick);
    
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  // Remove aggressive mobile keyboard scrolling for better UX
  // Users should stay where they are when typing

  // Removed scrollToBottom function completely for PC-like stable experience
  // No automatic scrolling whatsoever - user controls all scrolling manually

  const handleSendMessage = async (e?: React.FormEvent) => {
    // Only call preventDefault if event is provided and has the method
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    
    if (!input.trim()) return;
    
    // Log the user's message for debugging
    console.log(`User message: "${input}"`);
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    // Keep input focused for immediate next message typing
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 10);
    
    try {
      console.log(`Sending request to ${apiUrl} with message: "${input}" and sessionId: "${sessionId}"`);
      
      // Call our n8n webhook proxy with session ID to maintain context
      const response = await axios.post(apiUrl, {
        message: input,
        sessionId: sessionId
      });
      
      console.log("Response from n8n bot API:", response.data);
      
      // Add bot response - handle different possible response formats
      let responseText;
      
      if (typeof response.data === 'string') {
        // Handle string response
        responseText = response.data;
      } else if (typeof response.data === 'object') {
        // First, try to parse potential JSON string in response
        if (typeof response.data.response === 'string' && response.data.response.startsWith('{')) {
          try {
            // Try to parse JSON response from n8n
            const parsedResponse = JSON.parse(response.data.response);
            // Check if it has an output field (common for n8n responses)
            if (parsedResponse.output) {
              responseText = parsedResponse.output;
            } else {
              responseText = response.data.response;
            }
          } catch (e) {
            // If parsing fails, use the raw response
            responseText = response.data.response;
          }
        } else {
          // Regular object response
          responseText = response.data.message || 
                         response.data.text || 
                         response.data.response || 
                         JSON.stringify(response.data);
        }
      } else {
        // Fallback for any other type
        responseText = String(response.data);
      }
      
      // Check if this is a fallback response (for analytics or UI differentiation)
      const isFallbackResponse = response.data?.fallback === true;
      
      console.log(`Parsed response text: "${responseText}"`);
      console.log(`Is fallback response: ${isFallbackResponse}`);
        
      // Check if the response contains property information
      const containsProperties = messageContainsProperties(responseText);
      
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText || "I'm sorry, I couldn't process your request at this time.",
        sender: 'bot',
        timestamp: new Date(),
        showPropertyCards: containsProperties,
      };
      
      setMessages(prev => [...prev, botResponse]);
      
      // Keep input focused for continuous typing
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 10);
    } catch (error) {
      console.error('Error sending message to n8n bot:', error);
      
      // Direct error display without fallbacks
      let errorText = "I'm having trouble connecting to the AI assistant. Please try again later or contact our team for assistance.";
      
      // Check if it's an Axios error
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<any>;
        
        if (axiosError.response) {
          console.log("Error response data:", axiosError.response.data);
          
          // Check for n8n specific error messages
          if (axiosError.response.status === 404 && 
              typeof axiosError.response.data === 'object' &&
              axiosError.response.data?.message?.includes("webhook") && 
              axiosError.response.data?.hint?.includes("workflow must be active")) {
            
            errorText = "The AI assistant workflow needs to be activated. Please contact the administrator.";
          }
          // Show raw webhook error messages
          else if (axiosError.response.status === 404 &&
              typeof axiosError.response.data === 'object' &&
              axiosError.response.data?.message) {
            
            // Include both the message and the hint if available
            if (axiosError.response.data?.hint) {
              errorText = `${axiosError.response.data.message}\n\n${axiosError.response.data.hint}`;
            } else {
              errorText = axiosError.response.data.message;
            }
          }
          // Handle other types of API errors
          else if (axiosError.response.data?.error) {
            if (axiosError.response.data.error.message) {
              const apiErrorMessage = axiosError.response.data.error.message;
              if (apiErrorMessage.includes("Workflow could not be started")) {
                errorText = "The AI assistant workflow couldn't be started. Please try again later.";
              } else if (apiErrorMessage.includes("is not registered")) {
                errorText = "Please ask the administrator to click the 'Test workflow' button in n8n, then try again immediately.";
              }
            }
          }
        }
      }
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: errorText,
        sender: 'bot',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getFormattedTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div 
      className={`flex flex-col ${fullHeight ? 'h-full' : 'h-[450px]'} rounded-lg border border-gray-200 bg-white overflow-hidden shadow-md w-full relative`} 
      style={{ 
        minHeight: '300px',
        // Complete mobile stability - no viewport changes or keyboard interference
        position: 'relative',
        height: fullHeight ? '100%' : '450px',
        maxHeight: fullHeight ? '100%' : '450px',
        // Prevent any mobile scrolling or jumping behaviors
        touchAction: 'manipulation',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      {/* Messages container - allow scrolling only within this chatbox */}
      <div 
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4" 
        style={{
          // Enable smooth scrolling within chatbox only
          scrollBehavior: 'smooth',
          overflowY: 'auto',
          maxHeight: '100%'
        }}
      >
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex gap-2 max-w-[85%] md:max-w-[75%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <Avatar className={`${message.sender === 'user' ? 'bg-blue-500' : 'bg-gray-200'} h-8 w-8`}>
                <AvatarFallback>{message.sender === 'user' ? 'U' : 'AI'}</AvatarFallback>
                {message.sender === 'bot' && (
                  <AvatarImage src="/favicon.ico" alt="Relai AI" />
                )}
              </Avatar>
              <div>
                {message.sender === 'bot' && message.showPropertyCards ? (
                  <div className="mt-1">
                    {/* Extract the intro text before property listings */}
                    <div className="rounded-2xl px-4 py-2 bg-gray-100 text-gray-800 mb-2">
                      {message.text.split('\n\n🏢')[0]}
                    </div>
                    <PropertyCardList properties={parsePropertyInfo(message.text)} />
                  </div>
                ) : (
                  <div
                    className={`rounded-2xl px-4 py-2 ${
                      message.sender === 'user'
                        ? 'bg-[#1752FF] text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {message.text}
                  </div>
                )}
                
                <div
                  className={`text-xs mt-1 text-gray-500 ${
                    message.sender === 'user' ? 'text-right' : 'text-left'
                  }`}
                >
                  {getFormattedTime(message.timestamp)}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-2 max-w-[80%]">
              <Avatar className="bg-gray-200 h-8 w-8">
                <AvatarFallback>AI</AvatarFallback>
                <AvatarImage src="/favicon.ico" alt="Relai AI" />
              </Avatar>
              <div className="rounded-2xl px-4 py-2 bg-gray-100">
                <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <form
        onSubmit={handleSendMessage}
        className="border-t border-gray-200 p-3 md:p-4 flex gap-2 bg-gray-50 sticky bottom-0"
      >
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about properties, areas, or prices in Hyderabad..."
          className="flex-1 h-12 text-base md:text-lg rounded-full pl-4 pr-4 focus-visible:ring-[#1752FF]"
          disabled={false}
          // Keep input always enabled for continuous typing while bot thinks
          // Only disable send button when bot is processing
        />
        <Button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-[#1752FF] hover:bg-blue-700 h-12 w-12 p-0 rounded-full flex items-center justify-center"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </form>
    </div>
  );
};

export default N8nAIBot;