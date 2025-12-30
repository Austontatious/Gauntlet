const buckets = new Map<string, number[]>();

export type RateLimitResult = {
  allowed: boolean;
  retryAfterMs: number;
  remaining: number;
};

export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const cutoff = now - windowMs;
  const timestamps = buckets.get(key) ?? [];
  const recent = timestamps.filter((timestamp) => timestamp > cutoff);

  if (recent.length >= limit) {
    const oldest = recent[0] ?? now;
    const retryAfterMs = Math.max(oldest + windowMs - now, 0);
    buckets.set(key, recent);
    return { allowed: false, retryAfterMs, remaining: 0 };
  }

  recent.push(now);
  buckets.set(key, recent);
  return { allowed: true, retryAfterMs: 0, remaining: Math.max(limit - recent.length, 0) };
}
