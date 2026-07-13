import { Resend } from "resend";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value, maxLength = 5000) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function getBody(request) {
  if (!request.body) {
    return {};
  }

  if (typeof request.body === "string") {
    return JSON.parse(request.body);
  }

  return request.body;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.RESEND_API_KEY) {
    return response.status(500).json({ error: "Missing RESEND_API_KEY" });
  }

  let body;

  try {
    body = getBody(request);
  } catch {
    return response.status(400).json({ error: "Invalid JSON body" });
  }

  const name = clean(body.name, 120);
  const email = clean(body.email, 180);
  const phone = clean(body.phone, 80);
  const message = clean(body.message, 5000);

  if (!name || !emailPattern.test(email) || !message) {
    return response.status(400).json({ error: "Missing required fields" });
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safePhone = escapeHtml(phone || "Not provided");
    const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");

    const result = await resend.emails.send({
      from:
        process.env.RESEND_FROM_EMAIL ??
        "Lychea Portfolio <onboarding@resend.dev>",
      to: process.env.CONTACT_TO_EMAIL ?? "lycheacheurn@gmail.com",
      replyTo: email,
      subject: `Portfolio inquiry from ${name}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        `Phone: ${phone || "Not provided"}`,
        "",
        message,
      ].join("\n"),
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
          <h2>Portfolio inquiry</h2>
          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <p><strong>Phone:</strong> ${safePhone}</p>
          <p><strong>Message:</strong></p>
          <p>${safeMessage}</p>
        </div>
      `,
    });

    return response.status(200).json({ ok: true, id: result.data?.id });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: "Email could not be sent" });
  }
}
