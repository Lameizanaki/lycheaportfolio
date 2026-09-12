import { buildSessionCookie, createSessionToken, verifyPassword } from "../../lib/auth.js";
import { getJsonBody } from "../../lib/http.js";

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;

  if (!adminPassword || !sessionSecret) {
    return response.status(500).json({ error: "Admin auth is not configured" });
  }

  let body;
  try {
    body = getJsonBody(request);
  } catch {
    return response.status(400).json({ error: "Invalid JSON body" });
  }

  const password = typeof body.password === "string" ? body.password : "";

  if (!verifyPassword(password, adminPassword)) {
    return response.status(401).json({ error: "Incorrect password" });
  }

  const token = createSessionToken(sessionSecret);
  response.setHeader("Set-Cookie", buildSessionCookie(token, request));
  return response.status(200).json({ ok: true });
}
