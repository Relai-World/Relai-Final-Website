import { useEffect, useRef } from "react";
import HeroSection from "@/components/home/HeroSection";
import RelaiExperience from "@/components/home/RelaiExperience";
import TrustSection from "@/components/home/TrustSection";
import NriPropertySection from "@/components/home/NriPropertySection";
import FaqSection from "@/components/home/FaqSection";
import ComparisonSection from "@/components/home/ComparisonSection";
import PropertyComparisonHub from "@/components/home/PropertyComparisonHub";
import PropertyChatbotSection from "@/components/home/PropertyChatbotSection";
import BenefitsSection from "@/components/home/BenefitsSection";

export default function HomePage() {
  // Ref for the top of the page
  const topRef = useRef<HTMLDivElement>(null);
  
  // Scroll to top when the component mounts
  useEffect(() => {
    if (topRef.current) {
      window.scrollTo(0, 0);
    }
  }, []);

  return (
    <>
      <div ref={topRef} /> {/* Invisible element at the top */}
      <HeroSection />
      <RelaiExperience />
      <PropertyChatbotSection />
      <PropertyComparisonHub />
      <ComparisonSection />
      <TrustSection />
      <NriPropertySection />
      <BenefitsSection />
      <FaqSection />
    </>
  );
}
