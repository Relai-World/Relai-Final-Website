import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface EnhancedPropertyGalleryProps {
  images: string[];
  propertyName: string;
}

const EnhancedPropertyGallery: React.FC<EnhancedPropertyGalleryProps> = ({ images, propertyName }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-[16/9] bg-gray-200 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">No images available</p>
      </div>
    );
  }

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };

  const nextImage = () => {
    setSelectedIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  return (
    <div className="relative">
      <motion.div
        key={selectedIndex}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full aspect-[16/9] rounded-lg overflow-hidden cursor-pointer"
        onClick={() => openLightbox(selectedIndex)}
      >
        <img
          src={images[selectedIndex]}
          alt={`${propertyName} - Image ${selectedIndex + 1}`}
          className="w-full h-full object-cover"
        />
      </motion.div>

      <div className="absolute bottom-4 right-4 flex items-center gap-2">
        <AnimatePresence>
          {images.length > 1 && (
            <>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={prevImage}
                className="bg-black/50 text-white rounded-full p-2"
              >
                <ChevronLeft className="h-5 w-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={nextImage}
                className="bg-black/50 text-white rounded-full p-2"
              >
                <ChevronRight className="h-5 w-5" />
              </motion.button>
            </>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-4 grid grid-cols-3 md:grid-cols-5 gap-2">
        {images.slice(0, 5).map((image, index) => (
          <div
            key={index}
            className={`aspect-square rounded-md overflow-hidden cursor-pointer border-2 ${
              selectedIndex === index ? 'border-blue-500' : 'border-transparent'
            }`}
            onClick={() => setSelectedIndex(index)}
          >
            <img src={image} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>

      {isLightboxOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <div className="relative max-w-4xl max-h-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={images[selectedIndex]}
              alt={`${propertyName} - Image ${selectedIndex + 1}`}
              className="max-w-full max-h-[90vh] object-contain"
            />
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2"
            >
              <X className="h-6 w-6" />
            </button>
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/50 rounded-full p-2"
                >
                  <ChevronLeft className="h-8 w-8" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/50 rounded-full p-2"
                >
                  <ChevronRight className="h-8 w-8" />
                </button>
              </>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default EnhancedPropertyGallery;