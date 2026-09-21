import path from "path";
import { nanoid } from "nanoid";

const SAFE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

export function sanitizeFilename(originalName: string): string {
  const base = path.basename(originalName).toLowerCase();
  const ext = path.extname(base);
  if (!SAFE_EXT.has(ext)) {
    throw new Error("Unsupported file extension");
  }
  const stem = path
    .basename(base, ext)
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return `${stem || "image"}-${nanoid(10)}${ext === ".jpeg" ? ".jpg" : ext}`;
}

export function assertSafeUploadSubfolder(folder: string): string {
  const allowed = new Set([
    "pages",
    "products",
    "services",
    "gallery",
    "testimonials",
    "blog",
    "settings",
    "misc",
  ]);
  if (!allowed.has(folder)) {
    throw new Error("Invalid upload folder");
  }
  return folder;
}

export function toPublicUploadPath(folder: string, filename: string): string {
  const safeFolder = assertSafeUploadSubfolder(folder);
  const safeName = path.basename(filename);
  return `/uploads/${safeFolder}/${safeName}`;
}

export function publicPathToFsRelative(publicPath: string): string | null {
  if (!publicPath.startsWith("/uploads/")) return null;
  const normalized = path.posix.normalize(publicPath);
  if (normalized.includes("..") || !normalized.startsWith("/uploads/")) {
    return null;
  }
  return path.join("public", normalized.slice(1));
}

export function isProtectedAsset(publicPath: string): boolean {
  return (
    publicPath.startsWith("/brand/") ||
    publicPath.startsWith("/images/placeholders/") ||
    publicPath.includes("default-")
  );
}
