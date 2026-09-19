import { prisma } from "../../lib/prisma.js";
import { slugify } from "../../lib/slug.js";
import { requireAdmin } from "../../lib/auth.js";
import { getJsonBody } from "../../lib/http.js";
import { MAX_IMAGES_PER_PROJECT } from "../../lib/constants.js";

async function generateUniqueSlug(title) {
  const base = slugify(title) || "project";
  let candidate = base;
  let suffix = 2;

  while (await prisma.project.findUnique({ where: { slug: candidate } })) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

export default async function handler(request, response) {
  try {
    if (request.method === "GET") {
      response.setHeader(
        "Cache-Control",
        request.query.fresh === "1" ? "private, no-store" : "public, max-age=0, s-maxage=5, stale-while-revalidate=30",
      );
      const projects = await prisma.project.findMany({
        orderBy: { createdAt: "desc" },
      });
      return response.status(200).json({ projects });
    }

    if (request.method === "POST") {
      if (!requireAdmin(request)) {
        return response.status(401).json({ error: "Unauthorized" });
      }

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

      const slug = await generateUniqueSlug(title);

      const project = await prisma.project.create({
        data: { slug, title, description, coverImage, coverThumbnail, images },
      });

      return response.status(201).json({ project });
    }

    response.setHeader("Allow", "GET, POST");
    return response.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: "Something went wrong. Please try again." });
  }
}
