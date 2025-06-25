import { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Video, Clapperboard, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { PropertyGalleryType } from '@/lib/data/mock-properties';

interface PropertyGalleryProps {
  gallery: PropertyGalleryType;
}

export default function PropertyGallery({ gallery }: PropertyGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFullGallery, setShowFullGallery] = useState(false);
  
  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === gallery.images.length - 1 ? 0 : prevIndex + 1
    );
  };
  
  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? gallery.images.length - 1 : prevIndex - 1
    );
  };
  
  return (
    <div className="relative rounded-lg overflow-hidden">
      {/* Main image */}
      <div className="relative aspect-[16/9] bg-gray-100">
        <img 
          src={gallery.images[currentImageIndex]} 
          alt="Property" 
          className="w-full h-full object-cover"
        />
        
        {/* Video overlay if available */}
        {gallery.videos && gallery.videos.length > 0 && (
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="ghost" 
                className="absolute top-4 right-4 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2"
              >
                <Video className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <div className="relative w-full aspect-video">
                <iframe 
                  src={gallery.videos[0]} 
                  title="Property video"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <Button 
                variant="ghost" 
                className="absolute top-2 right-2 rounded-full p-2 bg-black/50 hover:bg-black/70 text-white"
                onClick={() => {
                  const closeButton = document.querySelector("[data-state='open'] button[data-state='closed']") as HTMLElement;
                  if (closeButton) closeButton.click();
                }}
              >
                <X className="h-5 w-5" />
              </Button>
            </DialogContent>
          </Dialog>
        )}
        
        {/* Navigation arrows */}
        <button
          onClick={prevImage}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/70 hover:bg-white p-2 rounded-full"
        >
          <ChevronLeft className="h-5 w-5 text-gray-800" />
        </button>
        <button
          onClick={nextImage}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/70 hover:bg-white p-2 rounded-full"
        >
          <ChevronRight className="h-5 w-5 text-gray-800" />
        </button>
        
        {/* Image counter */}
        <div className="absolute bottom-4 left-4 bg-black/60 text-white text-sm px-3 py-1 rounded-full">
          {currentImageIndex + 1} / {gallery.images.length}
        </div>
      </div>
      
      {/* Thumbnail gallery */}
      <div className="mt-2 flex space-x-2 overflow-x-auto pb-2">
        {gallery.images.map((image, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={`rounded-md overflow-hidden h-20 w-32 flex-shrink-0 border-2 transition-all ${
              index === currentImageIndex ? 'border-[#1752FF]' : 'border-transparent'
            }`}
          >
            <img
              src={image}
              alt={`Property thumbnail ${index + 1}`}
              className="h-full w-full object-cover"
            />
          </button>
        ))}
        
        {/* Floor plans thumbnails if available */}
        {gallery.floorPlans && gallery.floorPlans.length > 0 && (
          <>
            <div className="h-20 w-2 border-r border-gray-300 mx-2"></div>
            {gallery.floorPlans.map((plan, index) => (
              <Dialog key={`floor-plan-${index}`}>
                <DialogTrigger asChild>
                  <button className="rounded-md overflow-hidden h-20 w-32 flex-shrink-0 border-2 border-gray-200 relative">
                    <img
                      src={plan}
                      alt={`Floor plan ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-white text-xs font-medium">
                      Floor Plan {index + 1}
                    </div>
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <img
                    src={plan}
                    alt={`Floor plan ${index + 1}`}
                    className="w-full h-auto object-contain"
                  />
                </DialogContent>
              </Dialog>
            ))}
          </>
        )}
      </div>

      {/* Full gallery dialog */}
      <Dialog open={showFullGallery} onOpenChange={setShowFullGallery}>
        <DialogContent className="max-w-6xl h-[90vh] p-0 bg-black flex flex-col">
          <div className="flex-1 relative">
            {/* Main large image */}
            <img
              src={gallery.images[currentImageIndex]}
              alt="Property"
              className="absolute inset-0 w-full h-full object-contain"
            />
            
            {/* Navigation arrows */}
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 p-3 rounded-full"
            >
              <ChevronLeft className="h-6 w-6 text-white" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 p-3 rounded-full"
            >
              <ChevronRight className="h-6 w-6 text-white" />
            </button>
          </div>
          
          {/* Thumbnails at bottom */}
          <div className="h-24 bg-black/90 p-2 flex space-x-2 overflow-x-auto">
            {gallery.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`rounded overflow-hidden h-full w-auto aspect-[4/3] flex-shrink-0 border-2 ${
                  index === currentImageIndex ? 'border-[#1752FF]' : 'border-transparent'
                }`}
              >
                <img
                  src={image}
                  alt={`Property thumbnail ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
          
          {/* Close button */}
          <Button 
            variant="ghost" 
            className="absolute top-4 right-4 rounded-full p-2 bg-black/50 hover:bg-black/70 text-white"
            onClick={() => setShowFullGallery(false)}
          >
            <X className="h-5 w-5" />
          </Button>
          
          {/* Image counter */}
          <div className="absolute top-4 left-4 bg-black/60 text-white text-sm px-3 py-1 rounded-full">
            {currentImageIndex + 1} / {gallery.images.length}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* View all photos button */}
      <button
        onClick={() => setShowFullGallery(true)}
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 hover:bg-white py-2 px-4 rounded-full text-sm font-medium shadow-md"
      >
        View All Photos
      </button>
    </div>
  );
}