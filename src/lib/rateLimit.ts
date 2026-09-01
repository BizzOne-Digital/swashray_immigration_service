import { connectDB } from "@/lib/db";
import RateLimit from "@/lib/models/RateLimit";

/**
 * Very lightweight rate limiter for public form endpoints.
 * Returns true if the request should be BLOCKED (too many recent submissions).
 */
export async function isRateLimited(scope: string, identifier: string, maxPerHour = 5): Promise<boolean> {
  await connectDB();
  const key = `${scope}:${identifier}`;
  const count = await RateLimit.countDocuments({ key });
  if (count >= maxPerHour) return true;
  await RateLimit.create({ key });
  return false;
}
