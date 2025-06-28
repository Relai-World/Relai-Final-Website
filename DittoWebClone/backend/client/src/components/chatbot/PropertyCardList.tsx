import React from 'react';
import PropertyCard, { Property } from './PropertyCard';
import { motion } from 'framer-motion';

interface PropertyCardListProps {
  properties: Property[];
}

export default function PropertyCardList({ properties }: PropertyCardListProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <motion.div
      className="space-y-2 mt-2"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {properties.map((property, index) => (
        <PropertyCard key={index} property={property} />
      ))}
    </motion.div>
  );
}