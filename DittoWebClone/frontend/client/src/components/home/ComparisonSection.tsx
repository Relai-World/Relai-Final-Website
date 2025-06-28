import React, { useRef, useEffect, useState } from 'react';
import { CheckCircle, XCircle, User } from 'lucide-react';
import Container from '@/components/ui/container';
import { cn } from '@/lib/utils';
import { RelaiLogo } from '@/assets/svg/logo';

export default function ComparisonSection() {
  const [isSticky, setIsSticky] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (sectionRef.current && headerRef.current) {
        const sectionTop = sectionRef.current.getBoundingClientRect().top;
        const sectionBottom = sectionRef.current.getBoundingClientRect().bottom;
        
        // Make the header sticky when the section is in view and the header would be out of view
        if (sectionTop <= 0 && sectionBottom > headerRef.current.offsetHeight) {
          setIsSticky(true);
        } else {
          setIsSticky(false);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const comparisonData = [
    {
      category: 'Property Search',
      description: 'Finding properties that match your requirements',
      relai: {
        title: 'AI-powered personalized recommendations',
        description: 'Get 3-5 carefully selected properties, backed by data analysis tailored to your needs'
      },
      others: {
        title: 'Limited options based on sales targets',
        description: 'Properties recommended based on agent commissions rather than your requirements'
      }
    },
    {
      category: 'Price Negotiation',
      description: 'Getting the best possible deal',
      relai: {
        title: 'Data-driven price analysis and negotiation',
        description: 'Expert negotiators armed with market data to secure the best price'
      },
      others: {
        title: 'Basic negotiation with potential conflicts of interest',
        description: 'Agents may prioritize closing deals quickly over getting you the best price'
      }
    },
    {
      category: 'Paperwork & Documentation',
      description: 'Managing the legal and administrative process',
      relai: {
        title: 'Complete documentation support',
        description: 'Streamlined paperwork with expert verification'
      },
      others: {
        title: 'Basic documentation with minimal guidance',
        description: 'Limited support with complex paperwork, often leading to delays'
      }
    },
    {
      category: 'After-sale Support',
      description: 'Continued assistance after purchase',
      relai: {
        title: 'Property tracking till possession and ongoing support',
        description: 'Ongoing support in every way after possession for first 3 months'
      },
      others: {
        title: 'No support after sale completion',
        description: 'Relationship typically ends once the transaction is complete'
      }
    },
    {
      category: 'Transparent Pricing',
      description: 'Understanding the full cost upfront',
      relai: {
        title: 'Clear, transparent fee structure',
        description: 'No hidden fees or surprises, with all costs explained upfront'
      },
      others: {
        title: 'Variable fees with hidden costs',
        description: 'Unexpected charges often appear during the process'
      }
    },
    {
      category: 'Loan Assistance',
      description: 'Support with home loan process',
      relai: {
        title: 'Comprehensive loan support',
        description: 'Expert assistance with loan application, processing, and follow-up with banks'
      },
      others: {
        title: 'Basic referrals with limited follow-up',
        description: 'Minimal support with loan application process and bank follow-ups'
      }
    }
  ];

  return (
    <section className="py-16 bg-white" ref={sectionRef}>
      <Container>
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-4xl font-bold mb-3">The Relai Advantage</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            See how the Relai experience compares to traditional real estate agents in Hyderabad
          </p>
        </div>

        {/* Desktop version (hidden on mobile) */}
        <div className="relative overflow-hidden hidden md:block">
          <div 
            ref={headerRef}
            className={cn(
              "grid grid-cols-3 gap-4 bg-white py-5 transition-all duration-300",
              isSticky ? "sticky top-0 shadow-md z-10" : ""
            )}
          >
            <div className="pl-4">
              <h3 className="text-gray-500 font-medium">Real Estate Journey Steps</h3>
            </div>
            <div className="text-center px-6">
              <div className="flex items-center justify-center">
                <RelaiLogo />
              </div>
            </div>
            <div className="text-center px-6">
              <div className="flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                  <User size={20} className="text-gray-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-700">Other Agents</h3>
              </div>
            </div>
          </div>

          <div className="max-h-[500px] overflow-y-auto">
            {comparisonData.map((item, index) => (
              <div key={index} className={cn(
                "grid grid-cols-3 gap-4 py-8",
                index !== comparisonData.length - 1 ? "border-b border-gray-200" : ""
              )}>
                <div className="pl-4">
                  <h4 className="font-semibold text-lg">{item.category}</h4>
                  <p className="text-gray-500 text-sm mt-1">{item.description}</p>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex mb-2">
                    <CheckCircle className="text-[#1752FF] mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
                    <h5 className="font-medium">{item.relai.title}</h5>
                  </div>
                  <p className="text-sm text-gray-600 pl-7">{item.relai.description}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex mb-2">
                    <XCircle className="text-gray-400 mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
                    <h5 className="font-medium text-gray-700">{item.others.title}</h5>
                  </div>
                  <p className="text-sm text-gray-600 pl-7">{item.others.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Mobile version (hidden on desktop) */}
        <div className="block md:hidden">
          <div className="flex justify-center items-center gap-10 mb-6">
            <div className="text-center">
              <RelaiLogo />
            </div>
            <div className="text-center">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                  <User size={16} className="text-gray-600" />
                </div>
                <span className="font-medium">Other Agents</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            {comparisonData.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 p-3 border-b border-gray-200">
                  <h4 className="font-semibold">{item.category}</h4>
                  <p className="text-gray-500 text-xs mt-1">{item.description}</p>
                </div>
                
                <div className="p-3 border-b border-gray-200 bg-blue-50">
                  <div className="flex items-start">
                    <CheckCircle className="text-[#1752FF] mr-2 h-4 w-4 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center mb-1">
                        <span className="text-xs font-medium text-[#1752FF] mr-2">Relai</span>
                      </div>
                      <h5 className="font-medium text-sm">{item.relai.title}</h5>
                      <p className="text-xs text-gray-600 mt-1">{item.relai.description}</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-gray-50">
                  <div className="flex items-start">
                    <XCircle className="text-gray-400 mr-2 h-4 w-4 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center mb-1">
                        <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center mr-1">
                          <User size={12} className="text-gray-600" />
                        </div>
                        <span className="text-xs font-medium">Other Agent</span>
                      </div>
                      <h5 className="font-medium text-sm text-gray-700">{item.others.title}</h5>
                      <p className="text-xs text-gray-600 mt-1">{item.others.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}