import { handleUpload } from "@vercel/blob/client";
import { requireAdmin } from "../../lib/auth.js";
import { getJsonBody } from "../../lib/http.js";

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  let body;
  try {
    body = getJsonBody(request);
  } catch {
    return response.status(400).json({ error: "Invalid JSON body" });
  }

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        if (!requireAdmin(request)) {
          throw new Error("Unauthorized");
        }

        return {
          allowedContentTypes: ["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"],
          addRandomSuffix: true,
          maximumSizeInBytes: 15 * 1024 * 1024,
        };
      },
      onUploadCompleted: async () => {},
    });

    return response.status(200).json(jsonResponse);
  } catch (error) {
    return response.status(400).json({ error: error instanceof Error ? error.message : "Upload failed" });
  }
}
