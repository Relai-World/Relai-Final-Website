import React from 'react';
import Container from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Gift, Clock, UserPlus, Search, Home, Truck, FileText, Wrench, Zap } from "lucide-react";
import { Link } from "wouter";

const benefitItems = [
  {
    icon: <Gift className="h-10 w-10 text-white" />,
    title: "Legal & Compliance",
    description: "₹10,000 worth of legal verification services completely free",
    color: "bg-gradient-to-br from-blue-500 to-blue-700",
  },
  {
    icon: <Clock className="h-10 w-10 text-white" />,
    title: "1st EMI On Us",
    description: "We'll cover your first EMI payment up to ₹1 Lac",
    color: "bg-gradient-to-br from-purple-500 to-purple-700",
  },
  {
    icon: <UserPlus className="h-10 w-10 text-white" />,
    title: "Loyalty Discount",
    description: "Get ₹1 Lac discount on your next property purchase",
    color: "bg-gradient-to-br from-green-500 to-green-700",
  },
  {
    icon: <Home className="h-10 w-10 text-white" />,
    title: "Interior Discounts",
    description: "30% off on interior design services from partner companies",
    color: "bg-gradient-to-br from-pink-500 to-pink-700",
  },
  {
    icon: <Zap className="h-10 w-10 text-white" />,
    title: "Smart Home Tech",
    description: "We cover 30% of your home automation costs",
    color: "bg-gradient-to-br from-amber-500 to-amber-700",
  },
  {
    icon: <Wrench className="h-10 w-10 text-white" />,
    title: "Home Services",
    description: "Free 24/7 home services for 3 months post-purchase",
    color: "bg-gradient-to-br from-cyan-500 to-cyan-700",
  },
  {
    icon: <Truck className="h-10 w-10 text-white" />,
    title: "Moving Assistance",
    description: "Home moving costs are on us",
    color: "bg-gradient-to-br from-indigo-500 to-indigo-700",
  },
  {
    icon: <FileText className="h-10 w-10 text-white" />,
    title: "Registration Support",
    description: "Documentation costs covered up to ₹20,000",
    color: "bg-gradient-to-br from-red-500 to-red-700",
  },
  {
    icon: <Search className="h-10 w-10 text-white" />,
    title: "Referral Rewards",
    description: "Refer a friend and get ₹1 Lac off your next purchase",
    color: "bg-gradient-to-br from-emerald-500 to-emerald-700",
  },
];

export default function BenefitsSection() {
  return (
    <section id="benefits-section" className="py-20 bg-gradient-to-b from-white to-blue-50">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Exclusive Relai <span className="text-[#1752FF]">Benefits Package</span>
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            When you buy a property through Relai, you unlock a premium suite of benefits 
            designed to make your real estate journey smooth and rewarding.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefitItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ 
                scale: 1.03,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
              }}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              <div className="flex flex-col h-full">
                <div className={`${item.color} p-6 flex items-center justify-center`}>
                  <div className="rounded-full bg-white/20 p-3">
                    {item.icon}
                  </div>
                </div>
                <div className="p-6 flex-grow">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 text-center"
        >
          <Link href="/benefits">
            <Button 
              className="bg-[#1752FF] hover:bg-blue-700 text-white px-8 py-6 rounded-full text-lg font-semibold"
              size="lg"
            >
              Explore All Benefits in Detail
            </Button>
          </Link>
        </motion.div>
      </Container>
    </section>
  );
}