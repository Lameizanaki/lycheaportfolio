import { del } from "@vercel/blob";
import { prisma } from "../../lib/prisma.js";
import { requireAdmin } from "../../lib/auth.js";
import { getJsonBody } from "../../lib/http.js";
import { MAX_IMAGES_PER_PROJECT } from "../../lib/constants.js";

export default async function handler(request, response) {
  try {
    return await route(request, response);
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: "Something went wrong. Please try again." });
  }
}

async function route(request, response) {
  const { slug } = request.query;

  if (request.method === "GET") {
    const project = await prisma.project.findUnique({ where: { slug } });
    if (!project) {
      return response.status(404).json({ error: "Project not found" });
    }
    return response.status(200).json({ project });
  }

  if (!requireAdmin(request)) {
    return response.status(401).json({ error: "Unauthorized" });
  }

  const existing = await prisma.project.findUnique({ where: { slug } });
  if (!existing) {
    return response.status(404).json({ error: "Project not found" });
  }

  if (request.method === "PUT") {
    let body;
    try {
      body = getJsonBody(request);
    } catch {
      return response.status(400).json({ error: "Invalid JSON body" });
    }

    const title = typeof body.title === "string" ? body.title.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() : "";
    const coverImage = typeof body.coverImage === "string" ? body.coverImage.trim() : "";
    const coverThumbnail = typeof body.coverThumbnail === "string" ? body.coverThumbnail.trim() || null : null;
    const images = Array.isArray(body.images) ? body.images.filter((url) => typeof url === "string") : [];

    if (!title || !description || !coverImage) {
      return response.status(400).json({ error: "Title, description, and cover image are required." });
    }

    if (images.length > MAX_IMAGES_PER_PROJECT) {
      return response.status(400).json({ error: `You can have up to ${MAX_IMAGES_PER_PROJECT} images per project.` });
    }

    const previousBlobUrls = [existing.coverImage, existing.coverThumbnail, ...existing.images].filter(Boolean);
    const nextBlobUrls = new Set([coverImage, coverThumbnail, ...images].filter(Boolean));
    const removedUrls = previousBlobUrls.filter((url) => !nextBlobUrls.has(url));

    if (removedUrls.length > 0) {
      try {
        await del(removedUrls);
      } catch {
        // Non-fatal: the blob may already be gone. Continue saving the project.
      }
    }

    const project = await prisma.project.update({
      where: { slug },
      data: { title, description, coverImage, coverThumbnail, images },
    });

    return response.status(200).json({ project });
  }

  if (request.method === "DELETE") {
    const blobUrls = [existing.coverImage, existing.coverThumbnail, ...existing.images].filter(Boolean);
    if (blobUrls.length > 0) {
      try {
        await del(blobUrls);
      } catch {
        // Non-fatal: proceed with deleting the project record regardless.
      }
    }

    await prisma.project.delete({ where: { slug } });
    return response.status(200).json({ ok: true });
  }

  response.setHeader("Allow", "GET, PUT, DELETE");
  return response.status(405).json({ error: "Method not allowed" });
}
