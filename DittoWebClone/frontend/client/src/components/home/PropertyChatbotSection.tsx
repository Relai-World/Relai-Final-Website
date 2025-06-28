import React from 'react';
import { Button } from '@/components/ui/button';
import { Bot } from 'lucide-react';
import Container from '@/components/ui/container';
import { motion } from 'framer-motion';
import { Link } from 'wouter';

export default function PropertyChatbotSection() {
  return (
    <section id="property-chatbot-section" className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <Container className="max-w-7xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl md:text-4xl font-bold mb-2">
            AI-Powered Property Assistant
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Choose your preferred way to interact with our AI assistant for property recommendations.
          </p>
          <motion.div 
            className="h-1 w-20 bg-[#1752FF] rounded mx-auto mt-4"
            initial={{ width: 0 }}
            animate={{ width: 80 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
        </motion.div>
        
        {/* AI Assistant Selection Interface - exactly like your screenshot */}
        <div className="max-w-2xl mx-auto">
          <motion.div 
            className="text-center space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* AI Assistant Title */}
            <div>
              <Bot className="w-12 h-12 text-[#1752FF] mx-auto mb-3" />
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
                AI Assistant
              </h3>
            </div>

            {/* Caution Message */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-amber-800 font-medium">
                💡 Use WhatsApp for better experience
              </p>
            </div>

            {/* Two Option Buttons */}
            <div className="space-y-4">
              <Button 
                className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-lg"
                onClick={() => window.open('https://wa.me/918881088890?text=Hi! I need help with property recommendations.', '_blank')}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="w-5 h-5 mr-3"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp Bot
              </Button>
              
              <Link href="/ai-assistant" className="w-full block">
                <Button 
                  variant="outline"
                  className="w-full border-[#1752FF] text-[#1752FF] hover:bg-[#1752FF] hover:text-white py-4 text-lg"
                >
                  <Bot className="w-5 h-5 mr-3" />
                  Web Bot
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}