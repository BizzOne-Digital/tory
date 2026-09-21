import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import {
  assertSafeUploadSubfolder,
  sanitizeFilename,
  toPublicUploadPath,
  publicPathToFsRelative,
  isProtectedAsset,
} from "./sanitize";
import { validateImageUpload } from "./validate";

export type SavedUpload = {
  url: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
};

export async function saveUploadedImage(
  file: File,
  folder: string,
  options?: { alt?: string; caption?: string; preferWebp?: boolean },
): Promise<SavedUpload> {
  const safeFolder = assertSafeUploadSubfolder(folder);
  const { buffer, mime } = await validateImageUpload(file);

  let output = buffer;
  let filename = sanitizeFilename(file.name);
  let width = 0;
  let height = 0;

  try {
    const image = sharp(buffer, { failOn: "none" }).rotate();
    const meta = await image.metadata();
    width = meta.width ?? 0;
    height = meta.height ?? 0;

    if (width > 4000 || height > 4000) {
      image.resize({
        width: 4000,
        height: 4000,
        fit: "inside",
        withoutEnlargement: true,
      });
    }

    if (options?.preferWebp !== false && mime !== "image/avif") {
      output = await image.webp({ quality: 82 }).toBuffer();
      filename = filename.replace(/\.(jpe?g|png|webp)$/i, ".webp");
      const outMeta = await sharp(output).metadata();
      width = outMeta.width ?? width;
      height = outMeta.height ?? height;
    } else {
      output = await image.toBuffer();
    }
  } catch {
    // Fall back to original validated buffer if sharp fails in the environment
    const image = sharp(buffer);
    const meta = await image.metadata().catch(() => ({ width: 0, height: 0 }));
    width = meta.width ?? 0;
    height = meta.height ?? 0;
  }

  if (width > 0 && height > 0 && (width < 32 || height < 32)) {
    throw new Error("Image dimensions are too small");
  }

  const destDir = path.join(process.cwd(), "public", "uploads", safeFolder);
  await fs.mkdir(destDir, { recursive: true });
  const destPath = path.join(destDir, filename);
  await fs.writeFile(destPath, output);

  return {
    url: toPublicUploadPath(safeFolder, filename),
    alt: options?.alt ?? "",
    caption: options?.caption ?? "",
    width,
    height,
  };
}

export async function deleteUploadIfOrphan(publicPath?: string | null) {
  if (!publicPath || isProtectedAsset(publicPath)) return;
  const relative = publicPathToFsRelative(publicPath);
  if (!relative) return;
  const absolute = path.join(/*turbopackIgnore: true*/ process.cwd(), relative);
  try {
    await fs.unlink(absolute);
  } catch {
    // ignore missing files
  }
}
