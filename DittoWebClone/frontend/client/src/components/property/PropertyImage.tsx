import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, HomeIcon } from 'lucide-react';

interface PropertyImageProps {
  images: string[];
  propertyName: string;
  className?: string;
}

const PropertyImage: React.FC<PropertyImageProps> = ({ images, propertyName, className }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  if (!images || images.length === 0) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <HomeIcon className="h-12 w-12 text-gray-400" />
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      <img src={images[currentIndex]} alt={`${propertyName} ${currentIndex + 1}`} className="w-full h-full object-cover" />
      
      {images.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-75 transition-opacity"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-75 transition-opacity"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full">
            {currentIndex + 1} / {images.length}
          </div>
        </>
      )}
    </div>
  );
};

export default PropertyImage; 