import { useState } from "react";
import { Bot, X, Minimize2, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import N8nAIBot from "@/components/chatbot/N8nAIBot";

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsMinimized(false);
    }
  };

  const minimizeChatbot = () => {
    setIsMinimized(!isMinimized);
  };

  const closeChatbot = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  return (
    <>
      {/* Floating Chatbot Button */}
      <div className="fixed bottom-24 right-6 z-50">
        <Button
          onClick={toggleChatbot}
          className={cn(
            "w-14 h-14 rounded-full shadow-lg p-0 bg-[#1752FF] hover:bg-[#1442CC] transition-all duration-200",
            isOpen && "scale-95"
          )}
        >
          <Bot className="h-6 w-6 text-white" />
          <span className="sr-only">Open AI Chatbot</span>
        </Button>
      </div>

      {/* Chatbot Window */}
      {isOpen && (
        <div className={cn(
          "fixed bottom-40 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] transition-all duration-300",
          isMinimized ? "h-16" : "h-[600px] max-h-[calc(100vh-10rem)]"
        )}>
          <Card className="h-full shadow-2xl border-0 bg-white">
            <CardHeader className="flex flex-row items-center justify-between p-4 bg-[#1752FF] text-white rounded-t-lg">
              <CardTitle className="text-lg font-semibold flex items-center">
                <Bot className="h-5 w-5 mr-2" />
                AI Assistant
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={minimizeChatbot}
                  className="text-white hover:bg-white/20 p-1 h-8 w-8"
                >
                  {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeChatbot}
                  className="text-white hover:bg-white/20 p-1 h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            {!isMinimized && (
              <CardContent className="p-0 h-[calc(100%-4rem)] overflow-hidden">
                <N8nAIBot 
                  initialMessage=""
                  fullHeight={true}
                />
              </CardContent>
            )}
          </Card>
        </div>
      )}
    </>
  );
}