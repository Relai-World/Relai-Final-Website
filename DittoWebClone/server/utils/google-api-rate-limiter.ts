import { Request, Response, NextFunction } from 'express';

// Global rate limiter for Google Maps API calls
class GoogleApiRateLimiter {
  private queue: Array<() => Promise<any>> = [];
  private isProcessing = false;
  private requestCount = 0;
  private lastResetTime = Date.now();
  private readonly maxRequestsPerSecond = 10;
  private readonly maxRequestsPerMinute = 100;
  private readonly resetInterval = 60000; // 1 minute

  private minuteRequestCount = 0;
  private lastMinuteReset = Date.now();

  async addToQueue<T>(apiCall: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await apiCall();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      if (!this.isProcessing) {
        this.processQueue();
      }
    });
  }

  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0) {
      // Check if we need to reset counters
      const now = Date.now();
      if (now - this.lastMinuteReset >= this.resetInterval) {
        this.minuteRequestCount = 0;
        this.lastMinuteReset = now;
      }

      if (now - this.lastResetTime >= 1000) {
        this.requestCount = 0;
        this.lastResetTime = now;
      }

      // Check rate limits
      if (this.requestCount >= this.maxRequestsPerSecond || 
          this.minuteRequestCount >= this.maxRequestsPerMinute) {
        
        const waitTime = this.requestCount >= this.maxRequestsPerSecond ? 
          1100 - (now - this.lastResetTime) : 
          this.resetInterval - (now - this.lastMinuteReset);
        
        console.log(`Rate limit reached, waiting ${waitTime}ms before next Google API request`);
        await new Promise(resolve => setTimeout(resolve, Math.max(0, waitTime)));
        continue;
      }

      // Process the next request
      const apiCall = this.queue.shift();
      if (apiCall) {
        this.requestCount++;
        this.minuteRequestCount++;
        await apiCall();
        
        // Small delay between requests to be extra safe
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    this.isProcessing = false;
  }

  // Middleware to handle rate limiting errors
  handleRateLimitError(error: any): boolean {
    if (error.response?.status === 429 || 
        error.message?.includes('rate limit') || 
        error.message?.includes('quota exceeded')) {
      console.warn('Google API rate limit detected:', error.message);
      return true;
    }
    return false;
  }

  // Get current status
  getStatus() {
    return {
      queueLength: this.queue.length,
      isProcessing: this.isProcessing,
      requestCount: this.requestCount,
      minuteRequestCount: this.minuteRequestCount,
      maxRequestsPerSecond: this.maxRequestsPerSecond,
      maxRequestsPerMinute: this.maxRequestsPerMinute
    };
  }
}

export const googleApiLimiter = new GoogleApiRateLimiter();

// Express middleware for handling Google API rate limit errors
export function handleGoogleApiErrors(req: Request, res: Response, next: NextFunction) {
  res.locals.handleGoogleError = (error: any) => {
    if (googleApiLimiter.handleRateLimitError(error)) {
      return res.status(429).json({
        error: 'Rate limit exceeded. Please try again later.',
        retryAfter: 300 // 5 minutes
      });
    }
    return null;
  };
  next();
}