import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE = "boi_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET is not set");
  return s;
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function checkPassword(input: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) throw new Error("ADMIN_PASSWORD is not set");
  return safeEqual(sign(input), sign(expected));
}

export async function startSession() {
  const issued = Date.now().toString();
  const jar = await cookies();
  jar.set(COOKIE, `${issued}.${sign(issued)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

export async function isSignedIn() {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return false;
  const [issued, sig] = raw.split(".");
  if (!issued || !sig || !safeEqual(sig, sign(issued))) return false;
  return Date.now() - Number(issued) < MAX_AGE * 1000;
}

// Call at the top of every admin page and admin server action.
export async function requireAdmin() {
  if (!(await isSignedIn())) redirect("/login");
}
