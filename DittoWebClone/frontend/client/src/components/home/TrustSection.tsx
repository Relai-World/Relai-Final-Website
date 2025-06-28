import Container from "@/components/ui/container";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Home, TrendingUp, Building, ShieldCheck, Quote } from "lucide-react";

export default function TrustSection() {
  // Personified concept testimonials
  const testimonials = [
    {
      id: 1,
      name: "Building",
      quote: "Wow, I instantly connected with the perfect owner. Thank you to Relai for introducing me to an ideal match who truly values my potential.",
      icon: <Building className="h-12 w-12 text-[#1752FF] relative z-10" />,
      bgColor: "bg-blue-50",
      cardColor: "bg-gradient-to-br from-white to-blue-50",
    },
    {
      id: 2,
      name: "Money",
      quote: "I was sitting in bank for nothing. Because of Relai I am at a better place now.",
      icon: <TrendingUp className="h-12 w-12 text-[#1752FF] relative z-10" />,
      bgColor: "bg-green-50",
      cardColor: "bg-gradient-to-br from-white to-green-50",
    },
    {
      id: 3,
      name: "Asset",
      quote: "Wow I am Green, rising everyday, Thanks to Relai. My value continues to appreciate steadily, providing financial security and growth opportunities for my investors.",
      icon: <Home className="h-12 w-12 text-[#1752FF] relative z-10" />,
      bgColor: "bg-purple-50",
      cardColor: "bg-gradient-to-br from-white to-purple-50",
    },
    {
      id: 4,
      name: "Trust",
      quote: "With Relai, I'm no longer just a concept but a reality. Their transparency and expertise have made me the foundation of every client relationship.",
      icon: <ShieldCheck className="h-12 w-12 text-[#1752FF] relative z-10" />,
      bgColor: "bg-amber-50",
      cardColor: "bg-gradient-to-br from-white to-amber-50",
    }
  ];

  return (
    <section className="py-12 md:py-20 bg-[#F8F8F8]">
      <Container>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl md:text-4xl font-bold mb-6">If Real Estate Could Speak</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            If the core elements of real estate could express themselves, this is what they would say about their experience with Relai.
          </p>
          <motion.div 
            className="h-1 w-20 bg-[#1752FF] rounded mx-auto mt-6"
            initial={{ width: 0 }}
            animate={{ width: 80 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
              whileHover={{ scale: 1.03 }}
              className="h-full"
            >
              <Card className={`border-none shadow-md hover:shadow-xl transition-all duration-300 h-full overflow-hidden ${testimonial.cardColor}`}>
                <CardContent className="p-6 flex flex-col h-full relative">
                  {/* Large quote icon in background */}
                  <Quote className="absolute top-4 right-4 h-32 w-32 text-gray-100 opacity-50 rotate-6" />
                  
                  <div className="flex items-center gap-5 mb-6 z-10">
                    <motion.div 
                      className={`relative flex-shrink-0 rounded-full ${testimonial.bgColor} p-4`}
                      whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <motion.div
                        animate={{ scale: [1, 1.08, 1] }}
                        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 0.3 * index }}
                      >
                        {testimonial.icon}
                      </motion.div>
                    </motion.div>
                    
                    <div>
                      <h3 className="font-bold text-xl text-gray-800">{testimonial.name}</h3>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <Quote className="absolute -left-2 -top-2 h-6 w-6 text-[#1752FF] opacity-30" />
                    <blockquote className="pl-6 py-2 mb-4 flex-grow text-gray-700 relative z-10 text-lg font-medium border-l-2 border-[#1752FF]/30">
                      {testimonial.quote}
                    </blockquote>
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-gray-100">
                    <p className="text-[#1752FF] font-medium flex items-center">
                      <span className="mr-2">•</span> Powered by Relai Experience
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
