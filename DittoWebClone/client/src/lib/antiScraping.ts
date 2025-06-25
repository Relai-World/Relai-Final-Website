// Client-side anti-scraping utilities

// Detect headless browsers and automation tools
export const detectAutomation = (): boolean => {
  const checks = [
    // Check for headless browser indicators
    () => window.navigator.webdriver === true,
    () => !(window as any).chrome || !(window as any).chrome.runtime,
    () => window.outerHeight === 0,
    () => window.outerWidth === 0,
    
    // Check for common automation frameworks
    () => 'webdriver' in window,
    () => 'phantom' in window,
    () => '_phantom' in window,
    () => 'callPhantom' in window,
    () => '_selenium' in window,
    () => 'selenium' in window,
    () => '__selenium_unwrapped' in window,
    () => '__webdriver_evaluate' in window,
    () => '__driver_evaluate' in window,
    () => '__webdriver_script_function' in window,
    () => '__webdriver_script_func' in window,
    () => '__webdriver_script_fn' in window,
    () => '__fxdriver_evaluate' in window,
    () => '__driver_unwrapped' in window,
    () => '__webdriver_unwrapped' in window,
    () => '__selenium_evaluate' in window,
    () => '__fxdriver_unwrapped' in window,
    
    // Check user agent
    () => {
      const ua = navigator.userAgent.toLowerCase();
      return ua.includes('headless') || 
             ua.includes('phantom') || 
             ua.includes('selenium') ||
             ua.includes('chromedriver') ||
             ua.includes('bot');
    },
    
    // Check for missing features that real browsers have
    () => !window.Notification,
    () => !window.localStorage,
    () => !window.sessionStorage,
    () => typeof window.ontouchstart === 'undefined' && 
          typeof window.onmousedown === 'undefined'
  ];
  
  return checks.some(check => {
    try {
      return check();
    } catch {
      return false;
    }
  });
};

// Rate limit client-side requests
class ClientRateLimit {
  private requests: number[] = [];
  private readonly maxRequests: number;
  private readonly windowMs: number;
  
  constructor(maxRequests: number = 50, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }
  
  canMakeRequest(): boolean {
    const now = Date.now();
    
    // Remove old requests outside the window
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    
    if (this.requests.length >= this.maxRequests) {
      return false;
    }
    
    this.requests.push(now);
    return true;
  }
  
  getRemainingRequests(): number {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    return Math.max(0, this.maxRequests - this.requests.length);
  }
}

export const clientRateLimit = new ClientRateLimit();

// Detect rapid property viewing (bot behavior)
export const detectRapidViewing = (): boolean => {
  const key = 'property_views';
  const maxViews = 20;
  const timeWindow = 60000; // 1 minute
  
  try {
    const stored = localStorage.getItem(key);
    const views = stored ? JSON.parse(stored) : [];
    const now = Date.now();
    
    // Filter recent views
    const recentViews = views.filter((time: number) => now - time < timeWindow);
    
    if (recentViews.length >= maxViews) {
      return true;
    }
    
    // Add current view
    recentViews.push(now);
    localStorage.setItem(key, JSON.stringify(recentViews));
    
    return false;
  } catch {
    return false;
  }
};

// Add mouse movement tracking
export const trackMouseMovement = (): void => {
  let mouseMovements = 0;
  let lastMouseTime = 0;
  
  const handleMouseMove = () => {
    const now = Date.now();
    if (now - lastMouseTime > 100) { // Throttle to every 100ms
      mouseMovements++;
      lastMouseTime = now;
    }
  };
  
  document.addEventListener('mousemove', handleMouseMove);
  
  // Check for human-like mouse movement after 10 seconds
  setTimeout(() => {
    if (mouseMovements < 5) {
      console.warn('Suspicious: Very low mouse activity detected');
    }
    document.removeEventListener('mousemove', handleMouseMove);
  }, 10000);
};

// Scramble property data display order
export const scramblePropertyOrder = <T>(properties: T[]): T[] => {
  if (detectAutomation()) {
    // Return shuffled array for potential bots
    return [...properties].sort(() => Math.random() - 0.5);
  }
  return properties;
};

// Add request fingerprinting
export const addRequestFingerprint = (headers: Record<string, string> = {}): Record<string, string> => {
  return {
    ...headers,
    'X-Client-Time': Date.now().toString(),
    'X-Screen-Resolution': `${screen.width}x${screen.height}`,
    'X-Timezone': Intl.DateTimeFormat().resolvedOptions().timeZone,
    'X-Language': navigator.language,
  };
};

// Initialize anti-scraping measures
export const initAntiScraping = (): void => {
  // Start mouse tracking
  trackMouseMovement();
  
  // Check for automation on page load
  if (detectAutomation()) {
    console.warn('Automation detected');
  }
  
  // Add context menu protection
  document.addEventListener('contextmenu', (e) => {
    if (detectAutomation()) {
      e.preventDefault();
    }
  });
  
  // Disable text selection for bots
  if (detectAutomation()) {
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
  }
  
  // Monitor rapid property viewing
  const checkRapidViewing = setInterval(() => {
    if (detectRapidViewing()) {
      console.warn('Rapid property viewing detected');
      clearInterval(checkRapidViewing);
    }
  }, 5000);
};