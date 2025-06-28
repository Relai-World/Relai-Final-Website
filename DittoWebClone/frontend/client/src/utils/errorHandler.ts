// Error handler for rate limiting and API errors
export class ErrorHandler {
  private static retryTimeouts: Map<string, NodeJS.Timeout> = new Map();

  static handleRateLimit(error: any, retryCallback?: () => void): void {
    if (error?.error === "Rate limit exceeded. Access temporarily blocked.") {
      const retryAfter = error.retryAfter || 60;
      console.warn(`Rate limit exceeded. Retrying after ${retryAfter} seconds.`);
      
      // Clear any existing timeout for this callback
      const timeoutKey = retryCallback?.toString() || 'default';
      const existingTimeout = this.retryTimeouts.get(timeoutKey);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }
      
      // Set new retry timeout
      if (retryCallback) {
        const timeout = setTimeout(() => {
          retryCallback();
          this.retryTimeouts.delete(timeoutKey);
        }, retryAfter * 1000);
        
        this.retryTimeouts.set(timeoutKey, timeout);
      }
      
      return;
    }
    
    // Handle other errors
    console.error('Application error:', error);
  }

  static clearAllRetries(): void {
    this.retryTimeouts.forEach(timeout => clearTimeout(timeout));
    this.retryTimeouts.clear();
  }
}

// Debounce utility to prevent excessive function calls
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle utility to limit function execution frequency
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}