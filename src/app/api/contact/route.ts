import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/auth/rate-limit";
import { connectDB } from "@/lib/db/connect";
import { escapeText } from "@/lib/sanitize-html";
import { contactSchema } from "@/lib/validation/contact";
import { ContactSubmission } from "@/models";

const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 15 * 60 * 1000;

function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

function hashIp(ip: string) {
  return createHash("sha256").update(ip).digest("hex");
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limited = rateLimit(`contact:${ip}`, RATE_LIMIT, RATE_WINDOW_MS);

    if (!limited.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: "Too many messages sent. Please try again later.",
          retryAfterMs: limited.retryAfterMs,
        },
        { status: 429 },
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { ok: false, error: "Invalid JSON body" },
        { status: 400 },
      );
    }

    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: parsed.error.issues[0]?.message ?? "Invalid form data",
        },
        { status: 400 },
      );
    }

    const data = parsed.data;
    await connectDB();

    await ContactSubmission.create({
      name: escapeText(data.name),
      email: data.email.toLowerCase(),
      phone: escapeText(data.phone),
      subject: escapeText(data.subject),
      message: escapeText(data.message),
      meta: {
        userAgent: request.headers.get("user-agent") ?? "",
        ipHash: hashIp(ip),
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Unable to send message right now" },
      { status: 500 },
    );
  }
}
