import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { apiRateLimiter } from "@/utils/rateLimiter";
import { ErrorHandler } from "@/utils/errorHandler";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    
    // Handle rate limiting specifically
    if (res.status === 429 || text.includes("Rate limit exceeded")) {
      try {
        const errorData = JSON.parse(text);
        ErrorHandler.handleRateLimit(errorData);
        throw errorData;
      } catch (parseError) {
        const rateLimitError = {
          error: "Rate limit exceeded. Access temporarily blocked.",
          retryAfter: 60
        };
        ErrorHandler.handleRateLimit(rateLimitError);
        throw rateLimitError;
      }
    }
    
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest<T = any>(
  url: string,
  method: string = 'GET',
  data?: unknown | undefined,
): Promise<T> {
  // Check rate limiter before making request
  const requestKey = `${method}:${url}`;
  if (!apiRateLimiter.canMakeRequest(requestKey)) {
    const retryAfter = apiRateLimiter.getRetryAfter(requestKey);
    const rateLimitError = {
      error: "Rate limit exceeded. Access temporarily blocked.",
      retryAfter
    };
    ErrorHandler.handleRateLimit(rateLimitError);
    throw rateLimitError;
  }

  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res.json();
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey[0] as string;
    const requestKey = `GET:${url}`;
    
    // Check rate limiter before making request
    if (!apiRateLimiter.canMakeRequest(requestKey)) {
      const retryAfter = apiRateLimiter.getRetryAfter(requestKey);
      const rateLimitError = {
        error: "Rate limit exceeded. Access temporarily blocked.",
        retryAfter
      };
      ErrorHandler.handleRateLimit(rateLimitError);
      throw rateLimitError;
    }

    const res = await fetch(url, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        // Don't retry on rate limit errors
        if (error && typeof error === 'object' && 'error' in error && 
            String(error.error).includes('Rate limit exceeded')) {
          return false;
        }
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: (failureCount, error) => {
        // Don't retry on rate limit errors
        if (error && typeof error === 'object' && 'error' in error && 
            String(error.error).includes('Rate limit exceeded')) {
          return false;
        }
        return failureCount < 1;
      },
    },
  },
});
