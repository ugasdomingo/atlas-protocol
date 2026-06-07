import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import type { SessionData } from "@/lib/session";

const sessionOptions = {
  cookieName: "pa_session",
  password: process.env.IRON_SESSION_PASSWORD!,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
  },
};

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const session = await getIronSession<SessionData>(req, res, sessionOptions);

  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/biblioteca")) {
    if (!session.email || !session.entitlements?.length) {
      return NextResponse.redirect(new URL("/acceso", req.url));
    }
  }

  if (pathname.startsWith("/admin")) {
    if (!session.isAdmin) {
      return NextResponse.redirect(new URL("/acceso", req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ["/biblioteca/:path*", "/admin/:path*"],
};
