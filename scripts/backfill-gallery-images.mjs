// One-off maintenance script: compress existing gallery images that were
// uploaded before src/lib/upload.ts started resizing them client-side.
//
// Talks to a running `vercel dev` instance (default http://localhost:3000)
// for reads/writes instead of connecting to Postgres directly, because a
// direct Prisma connection from a standalone script fails to reach the
// Neon pooler host on this machine even though the same DATABASE_URL works
// fine from inside `vercel dev`'s own process.
//
// Requires `sharp`, which is not a project dependency (kept out of
// package.json since this only needs to run occasionally): install it
// temporarily first with `npm install sharp --no-save`.
//
// Run with: node --env-file=.env.local scripts/backfill-gallery-images.mjs [--dry-run]
import { createHmac } from "node:crypto";
import { put } from "@vercel/blob";
import sharp from "sharp";

const DRY_RUN = process.argv.includes("--dry-run");
const MAX_EDGE = 2000;
const QUALITY = 82;
const BLOB_HOST_SUFFIX = ".public.blob.vercel-storage.com";
const BASE_URL = process.env.BACKFILL_BASE_URL ?? "http://localhost:3000";

function adminSessionCookie() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not set");
  const timestamp = Date.now().toString();
  const signature = createHmac("sha256", secret).update(timestamp).digest("hex");
  return `lychea_admin_session=${timestamp}.${signature}`;
}

const cookie = adminSessionCookie();

function isBackfillCandidate(url) {
  try {
    const parsed = new URL(url);
    return parsed.hostname.endsWith(BLOB_HOST_SUFFIX) && !/-display\.webp$/i.test(parsed.pathname);
  } catch {
    return false;
  }
}

async function compress(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
  const originalBuffer = Buffer.from(await response.arrayBuffer());

  const resizedBuffer = await sharp(originalBuffer)
    .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toBuffer();

  return { originalBuffer, resizedBuffer };
}

async function fetchProjects() {
  const response = await fetch(`${BASE_URL}/api/projects?fresh=1`);
  if (!response.ok) throw new Error(`GET /api/projects failed: ${response.status}`);
  const data = await response.json();
  return data.projects;
}

async function saveProject(project, nextImages) {
  const response = await fetch(`${BASE_URL}/api/projects/${encodeURIComponent(project.slug)}`, {
    method: "PUT",
    headers: { "content-type": "application/json", cookie },
    body: JSON.stringify({
      title: project.title,
      description: project.description,
      coverImage: project.coverImage,
      coverThumbnail: project.coverThumbnail,
      images: nextImages,
    }),
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`PUT /api/projects/${project.slug} failed: ${response.status} ${body}`);
  }
}

async function main() {
  const projects = await fetchProjects();

  let totalOriginal = 0;
  let totalNew = 0;
  let replacedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  for (const project of projects) {
    let changed = false;
    const nextImages = [...project.images];

    for (let i = 0; i < nextImages.length; i += 1) {
      const url = nextImages[i];
      if (!isBackfillCandidate(url)) {
        skippedCount += 1;
        continue;
      }

      try {
        const { originalBuffer, resizedBuffer } = await compress(url);

        if (resizedBuffer.length >= originalBuffer.length) {
          console.log(`[skip] ${project.slug} #${i + 1}: compressed size not smaller, leaving as-is`);
          skippedCount += 1;
          continue;
        }

        totalOriginal += originalBuffer.length;
        totalNew += resizedBuffer.length;
        replacedCount += 1;

        const pct = (100 * (1 - resizedBuffer.length / originalBuffer.length)).toFixed(1);
        console.log(
          `[${DRY_RUN ? "dry-run" : "replace"}] ${project.slug} #${i + 1}: ` +
            `${(originalBuffer.length / 1024 / 1024).toFixed(2)}MB -> ${(resizedBuffer.length / 1024).toFixed(0)}KB (-${pct}%)`,
        );

        if (!DRY_RUN) {
          const originalName = decodeURIComponent(new URL(url).pathname.split("/").pop() ?? "image");
          const baseName = originalName.replace(/\.[^.]+$/, "") || "image";
          const blob = await put(`lychea/${baseName}-display.webp`, resizedBuffer, {
            access: "public",
            contentType: "image/webp",
            token: process.env.BLOB_READ_WRITE_TOKEN,
          });
          nextImages[i] = blob.url;
          changed = true;
        }
      } catch (error) {
        failedCount += 1;
        console.error(`[fail] ${project.slug} #${i + 1}: ${error instanceof Error ? error.message : error}`);
      }
    }

    if (changed && !DRY_RUN) {
      await saveProject(project, nextImages);
      console.log(`[db] ${project.slug}: updated ${nextImages.length} image URLs`);
    }
  }

  console.log("\n--- summary ---");
  console.log(`Replaced: ${replacedCount}, skipped: ${skippedCount}, failed: ${failedCount}`);
  console.log(
    `Total size: ${(totalOriginal / 1024 / 1024).toFixed(2)}MB -> ${(totalNew / 1024 / 1024).toFixed(2)}MB`,
  );
  if (DRY_RUN) {
    console.log("Dry run only: no files were uploaded and no database rows were changed.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
