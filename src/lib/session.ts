import { getIronSession, IronSession } from "iron-session";
import { cookies } from "next/headers";
import { env } from "./env";

export type SessionData = {
  email?: string;
  entitlements?: string[];
  isAdmin?: boolean;
};

const sessionOptions = {
  cookieName: "pa_session",
  password: env.IRON_SESSION_PASSWORD,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24, // 24 horas
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}
