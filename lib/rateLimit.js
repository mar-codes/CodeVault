const rateLimit = new Map();

const AUTHENTICATED_LIMIT = 3;  // 20 creations per minute for authenticated users
const ANONYMOUS_LIMIT = 5;      // 5 creations per minute for anonymous users
const WINDOW_MS = 60 * 1000;     // 1 minute window

export function checkRateLimit(key, isAuthenticated = false) {
  const now = Date.now();
  const limit = isAuthenticated ? AUTHENTICATED_LIMIT : ANONYMOUS_LIMIT;
  
  if (rateLimit.has(key)) {
    const { count, windowStart } = rateLimit.get(key);
    
    if (now - windowStart > WINDOW_MS) {
      rateLimit.set(key, { count: 1, windowStart: now });
      return { allowed: true, remaining: limit - 1 };
    }
    
    if (count >= limit) {
      return { allowed: false, remaining: 0 };
    }
    
    rateLimit.set(key, { count: count + 1, windowStart });
    return { allowed: true, remaining: limit - (count + 1) };
  }
  
  rateLimit.set(key, { count: 1, windowStart: now });
  return { allowed: true, remaining: limit - 1 };
}
