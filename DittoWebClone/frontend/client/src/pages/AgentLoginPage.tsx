import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { UserIcon, LockIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AGENT_CREDENTIALS = {
  username: 'agent123',
  password: 'relai2024'
};

export default function AgentLoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.title = "Agent Login | Relai";
    return () => {
      document.title = "Relai | The Ultimate Real Estate Buying Experience";
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (formData.username === AGENT_CREDENTIALS.username && 
        formData.password === AGENT_CREDENTIALS.password) {
      
      // Store agent login status and hardcoded details
      localStorage.setItem('agentLoggedIn', 'true');
      localStorage.setItem('agentUsername', formData.username);
      localStorage.setItem('agentName', 'Real Estate Agent');
      localStorage.setItem('agentPhone', '+91 9876543210');
      localStorage.setItem('agentEmail', 'agent@relai.world');
      
      toast({
        title: "Login Successful",
        description: "Welcome to the agent dashboard",
      });
      
      // Navigate directly to wizard
      setLocation('/agent/wizard');
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid username or password",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserIcon size={32} className="text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Agent Login</CardTitle>
          <p className="text-gray-600 text-sm mt-2">Access your property management dashboard</p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                Username
              </Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="relative">
                <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg"
              disabled={isLoading}
            >
              {isLoading ? 'Verifying...' : 'Login'}
            </Button>

            <div className="text-center">
              <div className="bg-blue-50 rounded-lg p-4 mt-6">
                <p className="text-sm text-blue-800 font-medium mb-2">Demo Credentials:</p>
                <p className="text-xs text-blue-700">Username: agent123</p>
                <p className="text-xs text-blue-700">Password: relai2024</p>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}