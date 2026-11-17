import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE = "admin_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 días

function secret() {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) throw new Error("Falta ADMIN_PASSWORD en las variables de entorno.");
  return pw + "|" + (process.env.SUPABASE_SERVICE_ROLE_KEY || "");
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

function safeEqual(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export function checkPassword(input: string) {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return false;
  // compara hashes para que la longitud no filtre información
  return safeEqual(sign("pw:" + input), sign("pw:" + pw));
}

export async function createSession() {
  const exp = String(Math.floor(Date.now() / 1000) + MAX_AGE);
  const jar = await cookies();
  jar.set(COOKIE, `${exp}.${sign("session:" + exp)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin() {
  if (!process.env.ADMIN_PASSWORD) return false;
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return false;
  const [exp, sig] = raw.split(".");
  if (!exp || !sig) return false;
  if (Number(exp) < Date.now() / 1000) return false;
  return safeEqual(sig, sign("session:" + exp));
}

export async function requireAdmin() {
  if (!(await isAdmin())) throw new Error("No autorizado");
}
