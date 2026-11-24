type Entry = { count: number; resetAt: number };
const entries = new Map<string, Entry>();

export function consume(origin: string, limit = 5, windowMs = 60_000, now = Date.now()) {
  if (entries.size > 10_000) for (const [key, entry] of entries) if (entry.resetAt <= now) entries.delete(key);
  const entry = entries.get(origin);
  if (!entry || entry.resetAt <= now) {
    entries.set(origin, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count += 1;
  return true;
}

export function resetLimiter() { entries.clear(); }
