import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, HelpCircle, Users, Briefcase, Globe, Shield, PiggyBank } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Container from "@/components/ui/container";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

// Define interfaces for type safety
interface Faq {
  question: string;
  answer: string | React.ReactNode;
}

interface FaqCategory {
  id: string;
  label: string;
  icon: React.ReactNode;
}

// Define FaqData type with string indexing
type FaqData = {
  [key: string]: Faq[];
};

// FAQ categories with icons for tabs
const faqCategories: FaqCategory[] = [
  { 
    id: "general", 
    label: "General", 
    icon: <div className="bg-blue-100 rounded-full p-1 w-6 h-6 flex items-center justify-center">
            <HelpCircle className="h-4 w-4 text-blue-600" />
          </div> 
  },
  { 
    id: "buyer-journey", 
    label: "Buyer Journey", 
    icon: <div className="bg-blue-100 rounded-full p-1 w-6 h-6 flex items-center justify-center">
            <Users className="h-4 w-4 text-blue-600" />
          </div> 
  },
  { 
    id: "nri", 
    label: "NRI Buyers", 
    icon: <div className="bg-blue-100 rounded-full p-1 w-6 h-6 flex items-center justify-center">
            <Globe className="h-4 w-4 text-blue-600" />
          </div> 
  },
  { 
    id: "transparency", 
    label: "Transparency & Trust", 
    icon: <div className="bg-blue-100 rounded-full p-1 w-6 h-6 flex items-center justify-center">
            <Shield className="h-4 w-4 text-blue-600" />
          </div> 
  },
  { 
    id: "investor", 
    label: "Investors", 
    icon: <div className="bg-blue-100 rounded-full p-1 w-6 h-6 flex items-center justify-center">
            <PiggyBank className="h-4 w-4 text-blue-600" />
          </div> 
  },
];

// FAQ answer types
interface Faq {
  question: string;
  answer: string | React.ReactNode;
}

// Complete FAQ data organized by category
const allFaqs: Record<string, Faq[]> = {
  general: [
    {
      question: "What is Relai?",
      answer: "Relai is a data-driven real estate advisory platform based in Hyderabad. We help buyers discover the best RERA-approved residential projects through a mix of AI technology and human expertise."
    },
    {
      question: "How is Relai different from other property platforms?",
      answer: "Unlike listing sites, Relai is unbiased—we don't show hundreds of random properties. We match you with up to 20 projects that fit your preferences using AI and expert advice."
    },
    {
      question: "What types of properties does Relai handle?",
      answer: (
        <div className="space-y-2">
          <p>Relai helps you find the right real estate across three categories:</p>
          <ol className="list-decimal pl-5 space-y-1">
            <li><span className="font-medium">Residential Properties</span> – Apartments, Villas, and Gated Communities</li>
            <li><span className="font-medium">Commercial Properties</span> – Office Spaces and Retail Units</li>
            <li><span className="font-medium">Plotting Projects</span> – RERA-approved residential plots in gated layouts</li>
          </ol>
        </div>
      )
    },
    {
      question: "Does Relai charge buyers any fee?",
      answer: "No. Our service is 100% free for buyers."
    },
    {
      question: "Are all projects on Relai RERA-approved?",
      answer: "Yes. We work only with RERA-registered developers and projects to ensure legal safety and transparency for buyers."
    },
    {
      question: "Which city does Relai operate in?",
      answer: "Currently, we operate exclusively in Hyderabad, India."
    },
    {
      question: "Is Relai a broker?",
      answer: "No. Relai is not a traditional broker. We are an advisory platform that combines AI with expert guidance to ensure a buyer-first experience."
    }
  ],
  "buyer-journey": [
    {
      question: "How does the home buying process work on Relai?",
      answer: (
        <div className="space-y-2">
          <p>Here's our complete end-to-end process:</p>
          <ol className="list-decimal pl-5 space-y-1">
            <li><span className="font-medium">Curated Property Recommendations</span> – We start by understanding your requirements and shortlisting up to 20 suitable properties.</li>
            <li><span className="font-medium">Property Visits & Virtual Tours</span> – We arrange physical site visits or live video tours if you're an NRI.</li>
            <li><span className="font-medium">Property Selection</span> – You finalize the property that best suits your needs.</li>
            <li><span className="font-medium">Legal Due Diligence</span> – We get the property legally verified through trusted legal partners.</li>
            <li><span className="font-medium">Home Loan Assistance</span> – We assist with your entire loan process, from application to approval.</li>
            <li><span className="font-medium">Token Payment</span> – You pay the token amount to reserve the property.</li>
            <li><span className="font-medium">Agreement of Sale (AOS)</span> – We guide you through the AOS signing with complete clarity.</li>
            <li><span className="font-medium">Property Registration Support</span> – Our executive accompanies you for the registration process.</li>
            <li><span className="font-medium">Post-Purchase Assistance</span> – We continue to support you after registration for any additional needs.</li>
          </ol>
        </div>
      )
    },
    {
      question: "How do I book a site visit?",
      answer: "Once your advisory expert shares shortlisted options, you can choose preferred timings, and our site visit team will accompany you."
    },
    {
      question: "Can I negotiate prices through Relai?",
      answer: "Yes. We have builder tie-ups and can often get better pricing or exclusive deals on your behalf."
    },
    {
      question: "Do you assist with home loans?",
      answer: "Yes. We have tie-ups with top banks and NBFCs. Our team will advice you for the approval and choose the best interest rates."
    },
    {
      question: "What are the buyer benefits if I book through Relai instead of going directly to developers?",
      answer: (
        <div className="space-y-4">
          <p>Booking your home through Relai comes with a wide range of exclusive benefits that developers don't offer. Here's everything you get:</p>
          
          <div>
            <h4 className="font-semibold text-blue-700 mb-2">Exclusive Financial Benefits</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li><span className="font-medium">Price Match Guarantee</span> – We match or beat lower price offers from elsewhere.</li>
              <li><span className="font-medium">Guaranteed Loan Approval Assistance</span> – Pre-qualification and faster loan approvals.</li>
              <li><span className="font-medium">EMI Cashback on Home Loans</span> – 1st EMI free for select projects.</li>
              <li><span className="font-medium">Zero Documentation Fee on Select Properties</span> – We negotiate to eliminate developer-paid charges.</li>
              <li><span className="font-medium">Guaranteed Appreciation Deals</span> – Access pre-launch & investor-grade properties.</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-blue-700 mb-2">Hassle-Free Purchase & Post-Sale Support</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li><span className="font-medium">Instant Pre-Approved Home Loan with One Click</span> – Get approval in under 24 hours.</li>
              <li><span className="font-medium">Complete Paperwork Management</span> – From application to registration.</li>
              <li><span className="font-medium">Dedicated Relationship Manager</span> – Available 7 days a week.</li>
              <li><span className="font-medium">Free Move-In Assistance</span> – Exclusive deals on movers & packers.</li>
              <li><span className="font-medium">Resale & Exit Support</span> – Liquidity and resale help.</li>
              <li><span className="font-medium">Virtual Reality Property Tours</span> – Explore before visiting in person.</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-blue-700 mb-2">Premium Buyer Loyalty Program</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li><span className="font-medium">₹1 Lakh Loyalty Credit</span> – For repeat buyers, applied to your property price.</li>
              <li><span className="font-medium">Referral Bonus up to ₹1 Lakh</span> – Earn when you refer 2+ buyers.</li>
              <li><span className="font-medium">VIP Pre-Launch Access</span> – Early booking before properties are open to the public.</li>
              <li><span className="font-medium">₹50,000 Worth Free Interiors Package</span> – Includes design consultation and furnishings.</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-blue-700 mb-2">Lifestyle & Value-Added Benefits</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li><span className="font-medium">₹50,000 Free Interiors Package</span> – With partner interior brands.</li>
              <li><span className="font-medium">Smart Home & Insurance Tie-Ups</span> – 30% discount on security systems and insurance.</li>
              <li><span className="font-medium">Home Concierge Services</span> – 3 months of free plumbing, electrical & cleaning.</li>
              <li><span className="font-medium">Customized Payment Plans</span> – Flexible EMI plans tailored to your cash flow.</li>
            </ul>
          </div>
        </div>
      )
    }
  ],
  nri: [
    {
      question: "I'm an NRI. Can I buy property through Relai?",
      answer: "Yes. Relai specializes in assisting NRI buyers. You can explore properties remotely and get full support for virtual tours, document verification, and closing."
    },
    {
      question: "How do virtual site visits work for NRIs?",
      answer: "We schedule video tours with our team physically present at the project. You can ask questions in real time and get a full walkthrough."
    },
    {
      question: "Can Relai handle documentation and registration for NRIs?",
      answer: "Yes. We work with legal experts to help you with Power Of Attorney, registration, and home loan documentation remotely."
    },
    {
      question: "Will Relai help me rent my property later?",
      answer: "We don't currently offer rental services."
    }
  ],
  transparency: [
    {
      question: "How do I know Relai is unbiased?",
      answer: "We don't push projects. We recommend only those that match your needs and pass our internal quality filters. Our advisors are not incentivized per project—they're incentivized by your satisfaction."
    },
    {
      question: "What if I don't like the suggested projects?",
      answer: "No problem. You can request more options or exit the process at any time. There's no obligation to buy."
    },
    {
      question: "Can I trust your project reviews?",
      answer: "Yes. We independently verify each project's RERA status, construction progress, pricing trends, and builder track record."
    },
    {
      question: "Who can I contact if I have an issue?",
      answer: "Our Customer Experience Team is available by phone, email, or WhatsApp to assist you before and after purchase."
    }
  ],
  investor: [
    {
      question: "What if I want to sell my property after purchasing through Relai?",
      answer: "We offer a 30-day resale guarantee for all properties bought through the Relai process. If you choose to sell, we will take full responsibility for reselling your property within 30 days—at a price that we determine based on current market trends and our expert evaluation. This ensures quick liquidity and peace of mind for investors who may want to exit early."
    }
  ]
};

export default function FaqPage() {
  // Set page title and meta description when component mounts
  useEffect(() => {
    document.title = "Real Estate FAQs | Answers to Property Buying Questions – Relai";

    // Set meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Get answers to common questions about real estate, Relai services, resale guarantees, property verification, and more.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Get answers to common questions about real estate, Relai services, resale guarantees, property verification, and more.';
      document.getElementsByTagName('head')[0].appendChild(meta);
    }

    // Restore title when component unmounts
    return () => {
      document.title = "Genuine, Smarter, and End to End Real Estate Services in Hyderabad";
      // Restore original meta description
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', 'Discover smarter real estate with Relai. Buy RERA verified properties with expert real estate guidance—all in one place');
      }
    };
  }, []);
  const [, setLocation] = useLocation();
  const [activeCategory, setActiveCategory] = useState("general");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredFaqs, setFilteredFaqs] = useState(allFaqs);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    
    // Reset search when changing categories
    if (searchQuery) {
      setSearchQuery("");
      setFilteredFaqs(allFaqs);
    }
  };

  // Handle search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredFaqs(allFaqs);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered: Record<string, any[]> = {};

    // Filter each category based on the search query
    Object.keys(allFaqs).forEach(category => {
      filtered[category] = allFaqs[category].filter(
        faq => faq.question.toLowerCase().includes(query) || 
               (typeof faq.answer === 'string' && faq.answer.toLowerCase().includes(query))
      );
    });

    setFilteredFaqs(filtered);
  }, [searchQuery]);

  return (
    <div className="pt-24 pb-20">
      <Container>
        {/* Hero section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 max-w-3xl mx-auto"
        >
          <div className="bg-blue-50 inline-block p-4 rounded-full mb-4">
            <HelpCircle className="h-10 w-10 text-[#1752FF]" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-gray-600 text-lg">
            Find answers to all your questions about Relai and our property advisory services
          </p>
        </motion.div>

        {/* Search Box */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-2xl mx-auto mb-10"
        >
          <div className="relative">
            <input
              type="text"
              placeholder="Search for questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-5 py-3 pr-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1752FF] focus:border-transparent transition-all"
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          {searchQuery && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-2 text-sm text-gray-500"
            >
              <span>
                {Object.values(filteredFaqs).flat().length} results found for "{searchQuery}"
              </span>
              {Object.values(filteredFaqs).flat().length > 0 && (
                <Button
                  variant="link"
                  className="text-[#1752FF] p-0 ml-2 h-auto text-sm"
                  onClick={() => setSearchQuery("")}
                >
                  Clear Search
                </Button>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* FAQ Categories Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <Tabs defaultValue="general" value={activeCategory} onValueChange={handleCategoryChange} className="w-full">
            <TabsList className="flex justify-between overflow-x-auto p-1.5 space-x-1 max-w-4xl mx-auto bg-[#f0f4ff] rounded-lg">
              {faqCategories.map((category) => (
                <TabsTrigger 
                  key={category.id} 
                  value={category.id}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md transition-all duration-200
                  data-[state=active]:bg-white data-[state=active]:text-[#1752FF] data-[state=active]:shadow-sm
                  hover:bg-blue-50"
                >
                  {category.icon}
                  <span className="font-medium">{category.label}</span>
                  {searchQuery && filteredFaqs[category.id]?.length > 0 && (
                    <span className="ml-1 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                      {filteredFaqs[category.id].length}
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* FAQ Content per Category */}
            <div className="mt-8 max-w-3xl mx-auto">
              {faqCategories.map((category) => (
                <TabsContent key={category.id} value={category.id} className="focus:outline-none">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="mb-2"
                  >
                    <h2 className="text-2xl font-bold flex items-center text-gray-900 mb-6">
                      {category.icon}
                      {category.label} FAQs
                    </h2>
                  </motion.div>

                  {filteredFaqs[category.id]?.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-10 bg-gray-50 rounded-lg"
                    >
                      <p className="text-gray-500">No questions found for your search in this category.</p>
                    </motion.div>
                  ) : (
                    <Accordion type="multiple" value={expandedItems} onValueChange={setExpandedItems}>
                      {filteredFaqs[category.id]?.map((faq, index) => (
                        <AccordionItem 
                          key={`${category.id}-${index}`} 
                          value={`${category.id}-${index}`}
                          className="border-b border-gray-200 py-2"
                        >
                          <AccordionTrigger className="hover:no-underline text-left py-3">
                            <span className="font-medium text-lg">{faq.question}</span>
                          </AccordionTrigger>
                          <AccordionContent className="text-gray-600 pt-2 pb-4">
                            {typeof faq.answer === "string" ? <p>{faq.answer}</p> : faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  )}
                </TabsContent>
              ))}
            </div>
          </Tabs>
        </motion.div>

        {/* Still have questions section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-8 text-center max-w-3xl mx-auto"
        >
          <h3 className="text-2xl font-bold mb-4">Still have questions?</h3>
          <p className="text-gray-600 mb-6">
            If you couldn't find the answer to your question, our team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => setLocation("/contact")}
              className="bg-[#1752FF] hover:bg-blue-700"
            >
              Contact Us
            </Button>
            <Button 
              variant="outline"
              className="border-[#1752FF] text-[#1752FF]"
              onClick={() => window.open("https://wa.me/918881088890", "_blank")}
            >
              Chat on WhatsApp
            </Button>
          </div>
        </motion.div>
      </Container>
    </div>
  );
}