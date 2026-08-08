import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/auth/rate-limit";
import { verifyPassword } from "@/lib/auth/password";
import {
  createSessionToken,
  setSessionCookie,
} from "@/lib/auth/session";
import { connectDB } from "@/lib/db/connect";
import { loginSchema } from "@/lib/validation/auth";
import { AdminUser } from "@/models";

const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 15 * 60 * 1000;
const LOCKOUT_MS = 15 * 60 * 1000;
const MAX_FAILED_ATTEMPTS = 5;

function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(request: Request) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { ok: false, error: "Invalid JSON body" },
        { status: 400 },
      );
    }

    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: parsed.error.issues[0]?.message ?? "Invalid credentials",
        },
        { status: 400 },
      );
    }

    const { email, password } = parsed.data;
    const ip = getClientIp(request);
    const limitKey = `login:${email.toLowerCase()}:${ip}`;
    const limited = rateLimit(limitKey, RATE_LIMIT, RATE_WINDOW_MS);

    if (!limited.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: "Too many login attempts. Please try again later.",
          retryAfterMs: limited.retryAfterMs,
        },
        { status: 429 },
      );
    }

    await connectDB();

    const admin = await AdminUser.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return NextResponse.json(
        { ok: false, error: "Invalid email or password" },
        { status: 401 },
      );
    }

    if (admin.lockUntil && admin.lockUntil.getTime() > Date.now()) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "This account is temporarily locked due to failed login attempts.",
        },
        { status: 423 },
      );
    }

    const valid = await verifyPassword(password, admin.passwordHash);
    if (!valid) {
      admin.failedLoginAttempts = (admin.failedLoginAttempts ?? 0) + 1;

      if (admin.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
        admin.lockUntil = new Date(Date.now() + LOCKOUT_MS);
      }

      await admin.save();

      return NextResponse.json(
        { ok: false, error: "Invalid email or password" },
        { status: 401 },
      );
    }

    admin.failedLoginAttempts = 0;
    admin.lockUntil = undefined;
    admin.lastLoginAt = new Date();
    await admin.save();

    const { token, expires } = await createSessionToken({
      sub: String(admin._id),
      email: admin.email,
      name: admin.name ?? "Administrator",
    });

    await setSessionCookie(token, expires);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Unable to sign in right now" },
      { status: 500 },
    );
  }
}
