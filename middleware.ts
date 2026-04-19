import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_PATHS = ["/login", "/api/auth", "/landing"];
const DEVICE_COOKIE = "hamzah_device_id";
const DENIED_MSG = "الوصول غير مسموح به.";

function deny(status = 403): NextResponse {
  return new NextResponse(DENIED_MSG, {
    status,
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function firstHopIp(req: NextRequest): string | null {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  const real = req.headers.get("x-real-ip");
  return real ? real.trim() : null;
}

function ipAllowed(req: NextRequest): boolean {
  const list = (process.env.ALLOWED_IPS ?? "").trim();
  if (!list) return true; // disabled
  const allowed = list.split(",").map((s) => s.trim()).filter(Boolean);
  const ip = firstHopIp(req);
  if (!ip) return false;
  return allowed.includes(ip);
}

function parseHM(s: string | undefined): number | null {
  if (!s) return null;
  const m = s.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const h = parseInt(m[1]!, 10);
  const mm = parseInt(m[2]!, 10);
  if (h < 0 || h > 23 || mm < 0 || mm > 59) return null;
  return h * 60 + mm;
}

function timeAllowed(): boolean {
  const start = parseHM(process.env.ALLOWED_HOURS_START);
  const end = parseHM(process.env.ALLOWED_HOURS_END);
  if (start === null || end === null) return true; // disabled
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Riyadh",
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });
  const parts = fmt.formatToParts(new Date());
  const h = parseInt(parts.find((p) => p.type === "hour")?.value ?? "0", 10);
  const m = parseInt(parts.find((p) => p.type === "minute")?.value ?? "0", 10);
  const now = h * 60 + m;
  return start <= end ? now >= start && now <= end : now >= start || now <= end;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public routes (landing page, auth endpoints) bypass every gate.
  if (isPublic(pathname)) return NextResponse.next();

  // Everything else is internal: IP allowlist + Asia/Riyadh time window first.
  if (!ipAllowed(req)) return deny();
  if (!timeAllowed()) return deny();

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Device fingerprint: set on first authenticated request, verify after.
  const existing = req.cookies.get(DEVICE_COOKIE)?.value;
  const res = NextResponse.next();
  if (!existing) {
    const id =
      globalThis.crypto?.randomUUID?.() ??
      `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    res.cookies.set(DEVICE_COOKIE, id, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
  }
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
