import { fileTypeFromBuffer } from "file-type";
import { getEnv } from "@/lib/env";

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

export async function validateImageUpload(file: File) {
  const { MAX_UPLOAD_BYTES } = getEnv();

  if (!file || file.size === 0) {
    throw new Error("No file provided");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(
      `File exceeds maximum size of ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)}MB`,
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const detected = await fileTypeFromBuffer(buffer);

  if (!detected || !ALLOWED_MIME.has(detected.mime)) {
    throw new Error("Only JPG, PNG, WebP, and AVIF images are allowed");
  }

  // Disallow SVG entirely for admin uploads
  if (
    file.type === "image/svg+xml" ||
    detected.mime === "image/svg+xml" ||
    file.name.toLowerCase().endsWith(".svg")
  ) {
    throw new Error("SVG uploads are not allowed");
  }

  return { buffer, mime: detected.mime, ext: detected.ext };
}
