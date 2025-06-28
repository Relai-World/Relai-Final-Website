// Rate limiter utility to prevent API abuse
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 10, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  canMakeRequest(key: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length < this.maxRequests) {
      validRequests.push(now);
      this.requests.set(key, validRequests);
      return true;
    }
    
    return false;
  }

  getRetryAfter(key: string): number {
    const requests = this.requests.get(key) || [];
    if (requests.length === 0) return 0;
    
    const oldestRequest = Math.min(...requests);
    const retryAfter = (oldestRequest + this.windowMs) - Date.now();
    return Math.max(0, Math.ceil(retryAfter / 1000));
  }

  reset(key?: string): void {
    if (key) {
      this.requests.delete(key);
    } else {
      this.requests.clear();
    }
  }
}

export const apiRateLimiter = new RateLimiter(5, 30000); // 5 requests per 30 seconds
export default RateLimiter;