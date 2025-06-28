// Typography utility for consistent font sizes across the application

// Typography classes following a consistent scale
export const typography = {
  // Headers
  h1: "text-4xl font-bold text-gray-900",          // Main page titles
  h2: "text-3xl font-bold text-gray-900",          // Section titles
  h3: "text-2xl font-bold text-gray-800",          // Sub-section titles
  h4: "text-xl font-semibold text-gray-800",       // Card titles
  
  // Body text
  bodyLarge: "text-lg text-gray-700",              // Larger body text
  body: "text-base text-gray-700",                 // Standard body text
  bodySmall: "text-sm text-gray-600",              // Secondary text, captions
  
  // Feature highlights
  featureTitle: "text-lg font-semibold text-gray-800", // Feature titles
  
  // Specialized text
  accent: "text-lg font-medium text-[#1752FF]",    // Accent text in primary color
  callout: "text-xl font-semibold text-[#1752FF]", // Call to action or highlight text
  
  // For consistent buttons
  buttonText: "text-base font-medium",             // Standard button text
};

// Usage:
// import { typography } from "@/lib/typography";
// <h1 className={typography.h1}>Page Title</h1>
// <p className={typography.body}>Regular paragraph text</p>