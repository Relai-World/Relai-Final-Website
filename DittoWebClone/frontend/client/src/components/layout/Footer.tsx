import { Link } from "wouter";
import Container from "../ui/container";
import { Instagram, Linkedin, Facebook } from "lucide-react";
import { FOOTER_LINKS } from "@/lib/constants";
import relaiWhiteLogo from "@/assets/images/relai-logo-white-footer.png";
import ScrollToTopLink from "./ScrollToTopLink";

// X (Twitter) icon
const XIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    className={className} 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M4 4l11.733 16h4.267l-11.733 -16z"></path>
    <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"></path>
  </svg>
);

export default function Footer() {
  return (
    <footer className="bg-[#2C2C2E] text-white py-12">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="mb-4">
              <img 
                src={relaiWhiteLogo} 
                alt="relai" 
                width="77.5"
                height="32"
                style={{ 
                  width: "77.5px", 
                  height: "32px",
                  objectFit: "contain"
                }}
              />
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Property Services</h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.propertyServices.map((link, index) => (
                <li key={index}>
                  <ScrollToTopLink href={link.href} className="text-gray-300 hover:text-[#1752FF] transition">
                    {link.label}
                  </ScrollToTopLink>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.resources.map((link, index) => (
                <li key={index}>
                  <ScrollToTopLink href={link.href} className="text-gray-300 hover:text-[#1752FF] transition">
                    {link.label}
                  </ScrollToTopLink>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.company.map((link, index) => (
                <li key={index}>
                  <ScrollToTopLink href={link.href} className="text-gray-300 hover:text-[#1752FF] transition">
                    {link.label}
                  </ScrollToTopLink>
                </li>
              ))}
            </ul>
            
            <h3 className="font-semibold mt-6 mb-2">Connect With Us</h3>
            <div className="flex space-x-4 mb-4">
              <a href="https://x.com/relaiworld" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-[#1752FF] transition">
                <XIcon className="h-5 w-5" />
              </a>
              <a href="https://www.instagram.com/relai.world/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-[#1752FF] transition">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://www.linkedin.com/company/relaiworld/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-[#1752FF] transition">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="https://www.facebook.com/profile.php?id=61575099697345" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-[#1752FF] transition">
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-4">
            <ScrollToTopLink href="/terms-and-conditions" className="text-gray-300 hover:text-[#1752FF] transition text-sm">
              Terms and Conditions
            </ScrollToTopLink>
            <span className="hidden md:inline text-gray-500">|</span>
            <ScrollToTopLink href="/privacy-policy" className="text-gray-300 hover:text-[#1752FF] transition text-sm">
              Privacy Policy
            </ScrollToTopLink>
          </div>
          <p className="text-gray-400 text-sm text-center">
            © {new Date().getFullYear()} Relai Real Estate. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}
