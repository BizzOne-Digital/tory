import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { saveUploadedImage } from "@/lib/uploads/save";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const folder = formData.get("folder");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { ok: false, error: "A valid image file is required" },
        { status: 400 },
      );
    }

    if (typeof folder !== "string" || !folder.trim()) {
      return NextResponse.json(
        { ok: false, error: "Upload folder is required" },
        { status: 400 },
      );
    }

    const alt =
      typeof formData.get("alt") === "string"
        ? formData.get("alt")!.toString()
        : "";
    const caption =
      typeof formData.get("caption") === "string"
        ? formData.get("caption")!.toString()
        : "";

    const saved = await saveUploadedImage(file, folder.trim(), {
      alt,
      caption,
    });

    return NextResponse.json({ ok: true, image: saved });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
