import { upload } from "@vercel/blob/client";

export async function uploadImage(file: File): Promise<string> {
  const blob = await upload(`lychea/${file.name}`, file, {
    access: "public",
    handleUploadUrl: "/api/admin/upload",
  });
  return blob.url;
}
