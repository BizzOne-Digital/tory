import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/auth/rate-limit";
import {
  CreateOrderError,
  createOrder,
} from "@/lib/orders/create-order";

const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60 * 60 * 1000;

function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limited = rateLimit(`order:${ip}`, RATE_LIMIT, RATE_WINDOW_MS);

    if (!limited.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: "Too many order submissions. Please try again later.",
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

    const result = await createOrder(body as Parameters<typeof createOrder>[0]);

    return NextResponse.json({
      ok: true,
      orderNumber: result.orderNumber,
      subtotalMinor: result.subtotalMinor,
      discountMinor: result.discountMinor,
      discountLabel: result.discountLabel,
      totalMinor: result.totalMinor,
      currency: result.currency,
    });
  } catch (error) {
    if (error instanceof CreateOrderError) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: error.status },
      );
    }

    return NextResponse.json(
      { ok: false, error: "Unable to create order right now" },
      { status: 500 },
    );
  }
}
