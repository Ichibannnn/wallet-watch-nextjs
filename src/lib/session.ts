// lib/session.ts
//
// Minimal stateless session: an httpOnly cookie holding `userId.signature`,
// where the signature is an HMAC-SHA256 of the userId keyed by AUTH_SECRET.
// The server can therefore trust the userId without a session table (the
// signature can't be forged without the secret). Swap for a DB-backed session
// table later if you need server-side revocation.
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "wallet-watch:session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function secret(): string {
  const value = process.env.AUTH_SECRET;
  if (!value) {
    throw new Error("AUTH_SECRET is not set — cannot sign session cookies.");
  }
  return value;
}

function sign(userId: string): string {
  return createHmac("sha256", secret()).update(userId).digest("hex");
}

/** Constant-time compare of two hex signatures. */
function signatureMatches(expected: string, actual: string): boolean {
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(actual, "hex");
  if (a.length !== b.length || a.length === 0) return false;
  return timingSafeEqual(a, b);
}

/** Set the signed session cookie. Call from a Route Handler / Server Function. */
export async function createSession(userId: string): Promise<void> {
  const value = `${userId}.${sign(userId)}`;
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

/** Read + verify the cookie, returning the userId, or null if absent/invalid. */
export async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  if (!raw) return null;

  const separator = raw.lastIndexOf(".");
  if (separator <= 0) return null;

  const userId = raw.slice(0, separator);
  const signature = raw.slice(separator + 1);
  if (!signatureMatches(sign(userId), signature)) return null;

  return userId;
}

/** Clear the session cookie. Call from a Route Handler / Server Function. */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
