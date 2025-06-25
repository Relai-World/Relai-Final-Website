import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import Container from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { typography } from "@/lib/typography";

// Featured FAQs for the homepage
const featuredFaqs = [
  {
    id: "what-is-relai",
    question: "What is Relai?",
    answer: "Relai is a data-driven real estate advisory platform based in Hyderabad. We help buyers discover the best RERA-approved residential projects through a mix of AI technology and human expertise."
  },
  {
    id: "how-different",
    question: "How is Relai different from other property platforms?",
    answer: "Unlike listing sites, Relai is unbiased—we don't show hundreds of random properties. We match you with up to 20 projects that fit your preferences using AI and expert advice."
  },
  {
    id: "buyer-benefits",
    question: "What are the buyer benefits if I book through Relai?",
    answer: "Booking through Relai gives you access to exclusive benefits like price match guarantee, guaranteed loan approval assistance, free move-in assistance, resale support, and loyalty credits for repeat buyers."
  },
  {
    id: "nri-buyers",
    question: "I'm an NRI. Can I buy property through Relai?",
    answer: "Yes. Relai specializes in assisting NRI buyers. You can explore properties remotely and get full support for virtual tours, document verification, and closing."
  }
];

export default function FaqSection() {
  const [, setLocation] = useLocation();
  const [expandedQuestions, setExpandedQuestions] = useState<string[]>([]);

  // Toggle question expand/collapse
  const toggleQuestion = (questionId: string) => {
    if (expandedQuestions.includes(questionId)) {
      setExpandedQuestions(expandedQuestions.filter(id => id !== questionId));
    } else {
      setExpandedQuestions([...expandedQuestions, questionId]);
    }
  };

  return (
    <section className="py-16 bg-gradient-to-b from-white to-blue-50">
      <Container>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
            <HelpCircle className="h-8 w-8 text-[#1752FF]" />
          </div>
          <h2 className={typography.h2}>Frequently Asked Questions</h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Find answers to common questions about Relai's property advisory services
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <div className="space-y-4">
            {featuredFaqs.map(faq => (
              <Card 
                key={faq.id} 
                className={`overflow-hidden cursor-pointer transition-shadow ${
                  expandedQuestions.includes(faq.id) ? "shadow-md" : "shadow-sm hover:shadow-md"
                }`}
                onClick={() => toggleQuestion(faq.id)}
              >
                <CardContent className="p-0">
                  <div className="p-4 md:p-5 flex justify-between items-center">
                    <h3 className="font-medium text-lg">
                      {faq.question}
                    </h3>
                    <button 
                      className="flex-shrink-0 ml-4 text-[#1752FF]"
                      aria-label={expandedQuestions.includes(faq.id) ? "Collapse answer" : "Expand answer"}
                    >
                      {expandedQuestions.includes(faq.id) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>
                  <AnimatePresence>
                    {expandedQuestions.includes(faq.id) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-gray-100"
                      >
                        <div className="p-4 md:p-5 bg-blue-50 text-gray-700">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button 
              onClick={() => setLocation("/faqs")}
              className="bg-[#1752FF] hover:bg-blue-700"
            >
              View All FAQs
            </Button>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}