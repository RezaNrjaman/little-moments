/**
 * Rate limiting for the login endpoint (SECURITY.md section 11).
 *
 * Uses Upstash Redis over REST when UPSTASH_REDIS_REST_URL/TOKEN are set,
 * which persists counters across serverless invocations.
 * Without Upstash a best effort in-memory limiter is used, which is still
 * useful during local development and single instance deployments.
 */

export type RateLimitResult = {
  allowed: boolean;
  /** Seconds until the caller may try again (when blocked). */
  retryAfterSeconds: number;
};

type WindowCounter = { count: number; resetAt: number };

const memoryStore = new Map<string, WindowCounter>();

/** Keep the in-memory store small. */
function pruneMemoryStore(now: number): void {
  if (memoryStore.size < 1000) return;
  for (const [key, counter] of memoryStore) {
    if (counter.resetAt <= now) memoryStore.delete(key);
  }
}

function inMemoryHit(key: string, limit: number, windowSeconds: number): RateLimitResult {
  const now = Date.now();
  pruneMemoryStore(now);

  const existing = memoryStore.get(key);
  if (!existing || existing.resetAt <= now) {
    memoryStore.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  existing.count += 1;
  if (existing.count > limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((existing.resetAt - now) / 1000),
      ),
    };
  }
  return { allowed: true, retryAfterSeconds: 0 };
}

async function upstashHit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<RateLimitResult | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const prefixedKey = `lm:ratelimit:${key}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["INCR", prefixedKey],
        ["EXPIRE", prefixedKey, windowSeconds, "NX"],
      ]),
      cache: "no-store",
    });

    if (!response.ok) return null;

    const data = (await response.json()) as unknown;
    const count = Array.isArray(data)
      ? Number((data as unknown[])[0])
      : Number(data);
    if (!Number.isFinite(count)) return null;

    if (count > limit) {
      const ttl = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([["TTL", prefixedKey]]),
        cache: "no-store",
      });
      const ttlData = (await ttl.json()) as unknown;
      const seconds = Array.isArray(ttlData)
        ? Number((ttlData as unknown[])[0])
        : Number(ttlData);
      return {
        allowed: false,
        retryAfterSeconds: Number.isFinite(seconds) && seconds > 0 ? seconds : windowSeconds,
      };
    }

    return { allowed: true, retryAfterSeconds: 0 };
  } catch {
    // Fail open on infrastructure errors so legitimate users are not locked
    // out because of a Redis outage; the in-memory limiter still applies.
    return null;
  }
}

/**
 * Register one hit against a fixed window counter.
 * Returns whether the request is allowed.
 */
export async function rateLimit(
  key: string,
  options: { limit: number; windowSeconds: number },
): Promise<RateLimitResult> {
  const { limit, windowSeconds } = options;

  const persistent = await upstashHit(key, limit, windowSeconds);
  if (persistent) return persistent;

  return inMemoryHit(key, limit, windowSeconds);
}

/** Extract a stable client identifier from the request. */
export function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

/**
 * Clear the counter for a key (called after a successful login so only
 * failed attempts consume the allowance). Never throws.
 */
export async function resetRateLimit(key: string): Promise<void> {
  memoryStore.delete(key);

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return;

  const prefixedKey = `lm:ratelimit:${key}`;
  try {
    await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([["DEL", prefixedKey]]),
      cache: "no-store",
    });
  } catch {
    // Ignore: the limiter is best effort on infrastructure failures.
  }
}
