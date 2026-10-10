import crypto from "crypto";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { getServiceSupabase } from "./supabase";

const COOKIE_NAME = "kitadda_admin_session";
const JWT_SECRET = process.env.ADMIN_JWT_SECRET || "kitadda_secret_jwt_admin_key_2026_987654321";

export interface AdminUser {
  id: string;
  email: string;
  role: "admin";
}

/**
 * Sign a payload into a secure HMAC-SHA256 token
 */
export function signToken(payload: AdminUser, expiresInMs: number = 7 * 24 * 60 * 60 * 1000): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const exp = Date.now() + expiresInMs;
  const body = Buffer.from(JSON.stringify({ ...payload, exp })).toString("base64url");
  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${header}.${body}`)
    .digest("base64url");
  return `${header}.${body}.${signature}`;
}

/**
 * Verify and decode an HMAC-SHA256 token
 */
export function verifyToken(token: string): AdminUser | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;

    const expectedSignature = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(`${header}.${body}`)
      .digest("base64url");

    if (expectedSignature !== signature) return null;

    const data = JSON.parse(Buffer.from(body, "base64url").toString("utf-8"));
    if (data.exp && Date.now() > data.exp) {
      return null; // Expired
    }

    return {
      id: data.id,
      email: data.email,
      role: data.role || "admin",
    };
  } catch {
    return null;
  }
}

/**
 * Check Admin Credentials against .env and Supabase Auth
 */
export async function authenticateAdmin(email: string, password: string): Promise<AdminUser | null> {
  const trimmedEmail = email.trim().toLowerCase();
  const trimmedPassword = password.trim();

  // 1. Authenticate with Supabase Auth first (using public client with anon key)
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password: trimmedPassword,
    });

    if (error) {
      console.warn("Supabase signInWithPassword failed:", error.message, error.status);
    } else if (data?.user) {
      return {
        id: data.user.id,
        email: data.user.email || trimmedEmail,
        role: (data.user.user_metadata?.role as "admin") || "admin",
      };
    }
  } catch (err) {
    console.warn("Supabase auth exception:", err);
  }

  // 2. Fallback to .env configured Admin Credentials
  const envAdminEmail = (process.env.ADMIN_EMAIL || "kitadda01@gmail.com").toLowerCase();
  const envAdminPassword = process.env.ADMIN_PASSWORD || "kitadda@admin2026";

  if (trimmedEmail === envAdminEmail && trimmedPassword === envAdminPassword) {
    return {
      id: "admin-env",
      email: envAdminEmail,
      role: "admin",
    };
  }

  return null;
}

/**
 * Get currently authenticated admin user from Next.js request or cookies
 */
export async function getAdminSession(req?: NextRequest): Promise<AdminUser | null> {
  let token: string | undefined;

  if (req) {
    token = req.cookies.get(COOKIE_NAME)?.value;
    const authHeader = req.headers.get("authorization");
    if (!token && authHeader?.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  } else {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get(COOKIE_NAME)?.value;
    } catch {
      // Ignore
    }
  }

  if (!token) return null;
  return verifyToken(token);
}

export { COOKIE_NAME };
