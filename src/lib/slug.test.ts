import { describe, expect, it, vi } from "vitest";
import { makeSlug, uniqueSlug } from "./slug";

describe("makeSlug", () => {
  it("slugifies text", () => {
    expect(makeSlug("Silk Column Gown")).toBe("silk-column-gown");
    expect(makeSlug("  Hello World!  ")).toBe("hello-world");
  });

  it("handles special characters", () => {
    expect(makeSlug("LUCCI CRENO — Atelier")).toBe("lucci-creno-atelier");
  });
});

describe("uniqueSlug", () => {
  it("returns base slug when available", async () => {
    const exists = vi.fn().mockResolvedValue(false);
    const slug = await uniqueSlug("Silk Gown", exists);
    expect(slug).toBe("silk-gown");
    expect(exists).toHaveBeenCalledOnce();
  });

  it("appends suffix when slug exists", async () => {
    const exists = vi
      .fn()
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);
    const slug = await uniqueSlug("Silk Gown", exists);
    expect(slug).toBe("silk-gown-2");
    expect(exists).toHaveBeenCalledTimes(3);
  });

  it("falls back to item for empty input", async () => {
    const exists = vi.fn().mockResolvedValue(false);
    const slug = await uniqueSlug("---", exists);
    expect(slug).toBe("item");
  });
});
