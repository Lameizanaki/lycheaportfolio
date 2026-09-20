import { upload } from "@vercel/blob/client";

const THUMBNAIL_MAX_EDGE = 800;
const THUMBNAIL_QUALITY = 0.82;
const DISPLAY_MAX_EDGE = 2000;
const DISPLAY_QUALITY = 0.82;

export async function uploadImage(file: File): Promise<string> {
  const blob = await upload(`lychea/${file.name}`, file, {
    access: "public",
    handleUploadUrl: "/api/admin/upload",
  });
  return blob.url;
}

async function resizeImage(file: File, maxEdge: number, quality: number, suffix: string): Promise<File> {
  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("This image format cannot be resized in the browser."));
      element.src = objectUrl;
    });

    const scale = Math.min(1, maxEdge / Math.max(image.naturalWidth, image.naturalHeight));
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Image resizing is not available in this browser.");
    }

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(image, 0, 0, width, height);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => (result ? resolve(result) : reject(new Error("Could not resize this image."))),
        "image/webp",
        quality,
      );
    });

    const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
    return new File([blob], `${baseName}-${suffix}.webp`, { type: "image/webp" });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function createThumbnail(file: File): Promise<File> {
  return resizeImage(file, THUMBNAIL_MAX_EDGE, THUMBNAIL_QUALITY, "thumbnail");
}

export async function uploadCoverImage(file: File): Promise<{ url: string; thumbnailUrl: string | null }> {
  const thumbnailUpload = createThumbnail(file)
    .then((thumbnail) => (thumbnail.size < file.size ? uploadImage(thumbnail) : undefined))
    .catch(() => undefined);

  const [url, thumbnailUrl] = await Promise.all([uploadImage(file), thumbnailUpload]);
  return { url, thumbnailUrl: thumbnailUrl ?? null };
}

export async function uploadGalleryImage(file: File): Promise<string> {
  try {
    const display = await resizeImage(file, DISPLAY_MAX_EDGE, DISPLAY_QUALITY, "display");
    if (display.size < file.size) {
      return await uploadImage(display);
    }
  } catch {
    // Fall through to uploading the original file.
  }

  return uploadImage(file);
}
