import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, X, ChevronDown, ChevronUp } from 'lucide-react';
import { ChatMessage, ChatMessageType } from './ChatMessage';
import { apiRequest } from '@/lib/queryClient';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function PropertyChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<ChatMessageType[]>([
    {
      id: 'welcome-message',
      role: 'assistant',
      content: 'Hello! I\'m your Relai property assistant. How can I help you find your dream property in Hyderabad today?'
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Function to generate a unique ID
  const generateId = () => `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  // Auto-scroll to the bottom of the chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isMinimized]);

  const handleOpenChat = () => {
    setIsOpen(true);
    setIsMinimized(false);
  };

  const handleCloseChat = () => {
    setIsOpen(false);
  };

  const handleToggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    const userMessage = {
      id: generateId(),
      role: 'user' as const,
      content: inputValue.trim()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      // Construct conversation history for context
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      type ChatbotResponse = {
        response: string;
        conversationHistory: { role: 'user' | 'assistant', content: string }[];
      };
      
      const response = await apiRequest<ChatbotResponse>(
        '/api/property-chatbot', 
        'POST', 
        {
          message: userMessage.content,
          conversationHistory
        }
      );
      
      if (response && response.response) {
        const assistantMessage = {
          id: generateId(),
          role: 'assistant' as const,
          content: response.response
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to get a response. Please try again.',
        variant: 'destructive'
      });
      
      // Add error message to chat
      setMessages(prev => [
        ...prev,
        {
          id: generateId(),
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again later.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={handleOpenChat}
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 p-0 flex items-center justify-center shadow-lg bg-[#1752FF] hover:bg-[#1242CC] z-50"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="26" 
          height="26" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
      </Button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 shadow-xl">
      <Card className={cn(
        "flex flex-col transition-all duration-300",
        isMinimized ? "h-16 w-72" : "w-80 sm:w-96 h-[500px]"
      )}>
        <CardHeader className="p-3 border-b flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">Relai Property Assistant</CardTitle>
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6"
              onClick={handleToggleMinimize}
            >
              {isMinimized ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6"
              onClick={handleCloseChat}
            >
              <X size={16} />
            </Button>
          </div>
        </CardHeader>
        
        {!isMinimized && (
          <>
            <CardContent className="flex-1 overflow-y-auto p-3 space-y-4">
              <div className="flex flex-col">
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                <div ref={messagesEndRef} />
                
                {isLoading && (
                  <div className="flex justify-center my-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            
            <CardFooter className="p-3 pt-0">
              <form onSubmit={handleSubmit} className="flex w-full gap-2">
                <Input
                  placeholder="Type your message..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  disabled={isLoading || !inputValue.trim()}
                  className="bg-[#1752FF] hover:bg-[#1242CC]"
                >
                  <Send size={16} />
                </Button>
              </form>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
}