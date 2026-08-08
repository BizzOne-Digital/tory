import { describe, expect, it } from "vitest";
import {
  assertSafeUploadSubfolder,
  isProtectedAsset,
  publicPathToFsRelative,
  sanitizeFilename,
  toPublicUploadPath,
} from "./sanitize";

describe("sanitizeFilename", () => {
  it("normalizes safe image filenames", () => {
    const result = sanitizeFilename("My Photo.JPG");
    expect(result).toMatch(/^my-photo-[a-zA-Z0-9_-]+\.jpg$/);
  });

  it("converts .jpeg to .jpg", () => {
    const result = sanitizeFilename("photo.jpeg");
    expect(result.endsWith(".jpg")).toBe(true);
  });

  it("rejects unsupported extensions", () => {
    expect(() => sanitizeFilename("file.exe")).toThrow(
      "Unsupported file extension",
    );
  });

  it("handles path traversal in original name", () => {
    const result = sanitizeFilename("../../etc/passwd.png");
    expect(result).toMatch(/\.png$/);
    expect(result).not.toContain("..");
  });
});

describe("assertSafeUploadSubfolder", () => {
  it("allows known upload folders", () => {
    expect(assertSafeUploadSubfolder("products")).toBe("products");
    expect(assertSafeUploadSubfolder("blog")).toBe("blog");
  });

  it("rejects unknown folders", () => {
    expect(() => assertSafeUploadSubfolder("secrets")).toThrow(
      "Invalid upload folder",
    );
  });
});

describe("toPublicUploadPath", () => {
  it("builds a public upload path", () => {
    expect(toPublicUploadPath("gallery", "image-abc.jpg")).toBe(
      "/uploads/gallery/image-abc.jpg",
    );
  });
});

describe("publicPathToFsRelative", () => {
  it("maps public upload paths to fs paths", () => {
    const result = publicPathToFsRelative("/uploads/products/foo.jpg");
    expect(result).toMatch(/public[/\\]uploads[/\\]products[/\\]foo\.jpg/);
  });

  it("returns null for non-upload paths", () => {
    expect(publicPathToFsRelative("/brand/logo.svg")).toBeNull();
  });

  it("returns null for path traversal attempts", () => {
    expect(publicPathToFsRelative("/uploads/../etc/passwd")).toBeNull();
  });
});

describe("isProtectedAsset", () => {
  it("identifies protected asset paths", () => {
    expect(isProtectedAsset("/brand/logo.svg")).toBe(true);
    expect(isProtectedAsset("/images/placeholders/product.jpg")).toBe(true);
    expect(isProtectedAsset("/uploads/products/default-hero.jpg")).toBe(true);
  });

  it("allows regular upload paths", () => {
    expect(isProtectedAsset("/uploads/products/user-photo.jpg")).toBe(false);
  });
});
