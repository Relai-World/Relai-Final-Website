import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export interface QuickResponseOption {
  label: string;
  value: string;
}

interface QuickResponseButtonsProps {
  options: QuickResponseOption[];
  onSelect: (value: string) => void;
}

export default function QuickResponseButtons({ options, onSelect }: QuickResponseButtonsProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="flex flex-wrap gap-2 mt-2"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {options.map((option, index) => (
        <motion.div key={index} variants={item}>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-[#1752FF] text-[#1752FF] hover:bg-[#1752FF]/10"
            onClick={() => onSelect(option.value)}
          >
            {option.label}
          </Button>
        </motion.div>
      ))}
    </motion.div>
  );
}