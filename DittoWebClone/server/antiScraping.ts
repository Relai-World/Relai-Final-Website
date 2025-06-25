import { Request, Response, NextFunction } from 'express';

// Rate limiting store
const requestCounts = new Map<string, { count: number, lastReset: number, blocked: boolean }>();

// Create rate limiting middleware
export const createRateLimit = (windowMs: number = 15 * 60 * 1000, max: number = 100) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    
    if (!requestCounts.has(ip)) {
      requestCounts.set(ip, { count: 1, lastReset: now, blocked: false });
      return next();
    }
    
    const data = requestCounts.get(ip)!;
    
    // Reset count if window has passed
    if (now - data.lastReset > windowMs) {
      data.count = 1;
      data.lastReset = now;
      data.blocked = false;
      return next();
    }
    
    // Check if IP is blocked
    if (data.blocked) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded. Access temporarily blocked.',
        retryAfter: Math.ceil((windowMs - (now - data.lastReset)) / 1000)
      });
    }
    
    data.count++;
    
    // Block if limit exceeded
    if (data.count > max) {
      data.blocked = true;
      return res.status(429).json({ 
        error: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((windowMs - (now - data.lastReset)) / 1000)
      });
    }
    
    next();
  };
};

// User agent validation
export const validateUserAgent = (req: Request, res: Response, next: NextFunction) => {
  const userAgent = req.headers['user-agent'];
  
  // Allow admin routes to bypass user agent validation
  if (req.path.startsWith('/api/admin/') || req.path.startsWith('/admin/')) {
    return next();
  }
  
  // Allow requests without user agent from legitimate sources
  if (!userAgent) {
    return next();
  }
  
  // Block only obvious scraping tools
  const blockedAgents = [
    'python-requests',
    'scrapy',
    'beautifulsoup',
    'curl',
    'wget',
    'httpie'
  ];
  
  const isBlocked = blockedAgents.some(agent => 
    userAgent.toLowerCase().includes(agent.toLowerCase())
  );
  
  if (isBlocked) {
    console.log(`Blocked user agent: ${userAgent}`);
    return res.status(403).json({ error: 'Access denied' });
  }
  
  next();
};

// Request pattern analysis
export const analyzeRequestPattern = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const shortInterval = 5 * 1000; // 5 seconds
  
  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, { count: 1, lastReset: now, blocked: false });
    return next();
  }
  
  const data = requestCounts.get(ip)!;
  
  // Check for extremely rapid requests (likely bot behavior)
  if (now - data.lastReset < shortInterval && data.count > 50) {
    console.log(`Blocking IP ${ip} for rapid requests: ${data.count} in ${now - data.lastReset}ms`);
    data.blocked = true;
    return res.status(429).json({ 
      error: 'Too many requests',
      message: 'Please slow down and try again later'
    });
  }
  
  next();
};

// Add random delays to responses (makes scraping less predictable)
export const addRandomDelay = (req: Request, res: Response, next: NextFunction) => {
  // Only add delay for API endpoints
  if (req.path.startsWith('/api/')) {
    const delay = Math.random() * 500 + 200; // 200-700ms random delay
    setTimeout(next, delay);
  } else {
    next();
  }
};

// Request validation
export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  // Check request size only
  const contentLength = parseInt(req.headers['content-length'] || '0');
  if (contentLength > 10 * 1024 * 1024) { // 10MB limit
    return res.status(413).json({ error: 'Request too large' });
  }
  
  next();
};

// Honeypot middleware - add hidden endpoints that only bots would access
export const honeypot = (req: Request, res: Response, next: NextFunction) => {
  const honeypotPaths = [
    '/robots.txt',
    '/sitemap.xml',
    '/admin',
    '/wp-admin',
    '/api/internal',
    '/.env',
    '/config',
    '/backup'
  ];
  
  if (honeypotPaths.some(path => req.path.includes(path))) {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    console.log(`Honeypot triggered by ${ip}: ${req.path}`);
    
    // Block this IP
    if (requestCounts.has(ip)) {
      requestCounts.get(ip)!.blocked = true;
    }
    
    return res.status(404).json({ error: 'Not found' });
  }
  
  next();
};

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours
  
  const keysToDelete: string[] = [];
  requestCounts.forEach((data, ip) => {
    if (now - data.lastReset > maxAge) {
      keysToDelete.push(ip);
    }
  });
  
  keysToDelete.forEach(ip => requestCounts.delete(ip));
}, 60 * 60 * 1000); // Clean up every hour