import "server-only";
import { NextResponse } from "next/server";

type LimitEntry = { count: number; resetAt: number };

// Best-effort per-process guard. Put a durable limiter at the edge or in a
// shared store when deploying multiple server instances.
const buckets = new Map<string, LimitEntry>();
let lastPruneAt = 0;

export async function readJsonLimited(
  request: Request,
  maxBytes: number,
): Promise<unknown | null> {
  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) return null;
  if (!request.body) return null;

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
  } catch {
    return null;
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    return JSON.parse(new TextDecoder().decode(bytes)) as unknown;
  } catch {
    return null;
  }
}

export function rateLimit(
  request: Request,
  key: string,
  limit: number,
  windowMs: number,
): NextResponse | null {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip =
    request.headers.get("cf-connecting-ip")?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    forwarded ||
    "unknown";
  const now = Date.now();
  const bucketKey = `${key}:${ip}`;
  let entry = buckets.get(bucketKey);
  if (!entry || entry.resetAt <= now) {
    entry = { count: 0, resetAt: now + windowMs };
    buckets.set(bucketKey, entry);
    if (buckets.size > 10_000) {
      const oldestKey = buckets.keys().next().value;
      if (oldestKey) buckets.delete(oldestKey);
    }
  }

  entry.count += 1;
  if (now - lastPruneAt > windowMs) {
    for (const [candidate, value] of buckets) {
      if (value.resetAt <= now) buckets.delete(candidate);
    }
    lastPruneAt = now;
  }

  if (entry.count <= limit) return null;
  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: { "Retry-After": String(Math.max(1, Math.ceil((entry.resetAt - now) / 1000))) },
    },
  );
}
