import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';

/**
 * ScrollToTop Component
 * Automatically scrolls to the top of the page when the route changes
 * This more robust implementation ensures it works across all browsers and with different navigation patterns
 */
export default function ScrollToTop() {
  const [location] = useLocation();
  const prevLocationRef = useRef(location);

  useEffect(() => {
    // If the location has changed
    if (location !== prevLocationRef.current) {
      // Scroll to top with smooth behavior
      try {
        // Try to use smooth scrolling first (modern browsers)
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth'
        });
      } catch (error) {
        // Fallback for older browsers
        window.scrollTo(0, 0);
      }
      
      // Update the previous location reference
      prevLocationRef.current = location;
    }
  }, [location]);

  // Also handle initial page load
  useEffect(() => {
    // When component initially mounts, scroll to top of the page
    window.scrollTo(0, 0);
  }, []);

  // This component doesn't render anything
  return null;
}