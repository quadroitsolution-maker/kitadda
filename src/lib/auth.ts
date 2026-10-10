import crypto from "crypto";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { supabase, getSupabase, getServiceSupabase } from "./supabase";

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

export async function authenticateAdmin(
  email: string,
  password: string
): Promise<{ user: AdminUser | null; error?: string }> {
  const trimmedEmail = email.trim().toLowerCase();
  const trimmedPassword = password.trim();

  try {
    const client = getSupabase();
    const { data, error } = await client.auth.signInWithPassword({
      email: trimmedEmail,
      password: trimmedPassword,
    });

    if (error) {
      console.warn("Supabase signInWithPassword failed:", error.message, error.status);
      return { user: null, error: error.message };
    }

    if (data?.user) {
      return {
        user: {
          id: data.user.id,
          email: data.user.email || trimmedEmail,
          role: (data.user.user_metadata?.role as "admin") || "admin",
        },
      };
    }

    return { user: null, error: "No user returned by Supabase" };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Authentication error";
    console.error("Supabase auth exception:", err);
    return { user: null, error: msg };
  }
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
