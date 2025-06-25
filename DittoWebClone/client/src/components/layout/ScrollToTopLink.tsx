import React from 'react';
import { Link } from 'wouter';

/**
 * ScrollToTopLink Component
 * A wrapper around the wouter Link component that scrolls to top when clicked
 * Specifically designed for navigation links in footers and menus
 */
interface ScrollToTopLinkProps {
  href: string;
  className?: string;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
}

export default function ScrollToTopLink({ 
  href, 
  className, 
  children, 
  onClick 
}: ScrollToTopLinkProps) {
  
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Execute any provided onClick handler if it exists
    if (onClick) onClick(e);
    
    // Scroll to top immediately - this ensures it happens before navigation
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  };

  return (
    <Link href={href}>
      <div className={className} onClick={handleClick} style={{ cursor: 'pointer' }}>
        {children}
      </div>
    </Link>
  );
}