import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_SESSION_COOKIE = "lychea_admin_session";
const SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export function createSessionToken(secret) {
  const timestamp = Date.now().toString();
  const signature = createHmac("sha256", secret).update(timestamp).digest("hex");
  return `${timestamp}.${signature}`;
}

export function verifySessionToken(token, secret) {
  if (!token || !secret) return false;

  const [timestamp, signature] = token.split(".");
  if (!timestamp || !signature) return false;

  const expected = createHmac("sha256", secret).update(timestamp).digest("hex");
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== actualBuffer.length) return false;
  if (!timingSafeEqual(expectedBuffer, actualBuffer)) return false;

  const age = Date.now() - Number(timestamp);
  return age >= 0 && age < SESSION_MAX_AGE_MS;
}

export function verifyPassword(input, expected) {
  if (!input || !expected) return false;

  const inputBuffer = Buffer.from(input);
  const expectedBuffer = Buffer.from(expected);
  if (inputBuffer.length !== expectedBuffer.length) return false;

  return timingSafeEqual(inputBuffer, expectedBuffer);
}

export function isHttpsRequest(request) {
  return request.headers["x-forwarded-proto"] === "https";
}

export function buildSessionCookie(token, request) {
  const secure = isHttpsRequest(request) ? " Secure;" : "";
  return `${ADMIN_SESSION_COOKIE}=${token}; HttpOnly;${secure} SameSite=Lax; Path=/; Max-Age=${Math.floor(
    SESSION_MAX_AGE_MS / 1000,
  )}`;
}

export function buildClearedSessionCookie(request) {
  const secure = isHttpsRequest(request) ? " Secure;" : "";
  return `${ADMIN_SESSION_COOKIE}=; HttpOnly;${secure} SameSite=Lax; Path=/; Max-Age=0`;
}

export function requireAdmin(request) {
  const token = request.cookies?.[ADMIN_SESSION_COOKIE];
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;
  return Boolean(sessionSecret && verifySessionToken(token, sessionSecret));
}
