import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.ADMIN_SESSION_SECRET!);
const COOKIE = "half_full_admin";

export async function createAdminSession() {
  const token = await new SignJWT({ admin: true, username: process.env.ADMIN_USERNAME })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
}

export async function isAdmin() {
  try {
    const jar = await cookies();
    const token = jar.get(COOKIE)?.value;
    if (!token) return false;
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export async function logoutAdmin() {
  const jar = await cookies();
  jar.delete(COOKIE);
}
