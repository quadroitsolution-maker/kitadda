import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const ENV_PATH = path.join(process.cwd(), ".env.local");

/**
 * Read and parse .env.local file into a Map
 */
async function readEnvFile(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  try {
    const content = await fs.readFile(ENV_PATH, "utf-8");
    const lines = content.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        const value = trimmed.slice(eqIdx + 1).trim();
        map.set(key, value);
      }
    }
  } catch {
    // If .env.local doesn't exist yet, return empty map
  }
  return map;
}

/**
 * Write updated key-value map back to .env.local
 */
async function writeEnvFile(envMap: Map<string, string>): Promise<void> {
  let content = `# ============================================\n# KIT ADDA — Environment Variables\n# Updated via Admin Settings Portal\n# ============================================\n\n`;

  content += `# --- SUPABASE ---\n`;
  content += `NEXT_PUBLIC_SUPABASE_URL=${envMap.get("NEXT_PUBLIC_SUPABASE_URL") || ""}\n`;
  content += `NEXT_PUBLIC_SUPABASE_ANON_KEY=${envMap.get("NEXT_PUBLIC_SUPABASE_ANON_KEY") || ""}\n`;
  content += `SUPABASE_SERVICE_ROLE_KEY=${envMap.get("SUPABASE_SERVICE_ROLE_KEY") || ""}\n\n`;

  content += `# --- RAZORPAY ---\n`;
  content += `NEXT_PUBLIC_RAZORPAY_KEY_ID=${envMap.get("NEXT_PUBLIC_RAZORPAY_KEY_ID") || ""}\n`;
  content += `RAZORPAY_KEY_ID=${envMap.get("RAZORPAY_KEY_ID") || envMap.get("NEXT_PUBLIC_RAZORPAY_KEY_ID") || ""}\n`;
  content += `RAZORPAY_KEY_SECRET=${envMap.get("RAZORPAY_KEY_SECRET") || ""}\n\n`;

  content += `# --- ADMIN AUTHENTICATION ---\n`;
  content += `ADMIN_EMAIL=${envMap.get("ADMIN_EMAIL") || "kitadda01@gmail.com"}\n`;
  content += `ADMIN_PASSWORD=${envMap.get("ADMIN_PASSWORD") || "kitadda@admin2026"}\n`;
  content += `ADMIN_JWT_SECRET=${envMap.get("ADMIN_JWT_SECRET") || "kitadda_super_secret_jwt_key_2026_987654321_xyz"}\n\n`;

  content += `# --- CONTACT & SUPPORT ---\n`;
  content += `NEXT_PUBLIC_WHATSAPP_NUMBER=${envMap.get("NEXT_PUBLIC_WHATSAPP_NUMBER") || "919315963809"}\n`;

  await fs.writeFile(ENV_PATH, content, "utf-8");
}

export async function GET(req: NextRequest) {
  const adminUser = await getAdminSession(req);
  if (!adminUser) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const envMap = await readEnvFile();

  const supabaseUrl = envMap.get("NEXT_PUBLIC_SUPABASE_URL") || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey = envMap.get("NEXT_PUBLIC_SUPABASE_ANON_KEY") || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const supabaseServiceKey = envMap.get("SUPABASE_SERVICE_ROLE_KEY") || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const razorpayKeyId = envMap.get("NEXT_PUBLIC_RAZORPAY_KEY_ID") || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "";
  const razorpayKeySecret = envMap.get("RAZORPAY_KEY_SECRET") || process.env.RAZORPAY_KEY_SECRET || "";
  const whatsappNumber = envMap.get("NEXT_PUBLIC_WHATSAPP_NUMBER") || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919315963809";
  const adminEmail = envMap.get("ADMIN_EMAIL") || process.env.ADMIN_EMAIL || "kitadda01@gmail.com";

  return NextResponse.json({
    success: true,
    settings: {
      supabaseUrl,
      supabaseAnonKey,
      supabaseServiceKey,
      razorpayKeyId,
      razorpayKeySecret,
      whatsappNumber,
      adminEmail,
    },
  });
}

export async function POST(req: NextRequest) {
  const adminUser = await getAdminSession(req);
  if (!adminUser) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      supabaseUrl,
      supabaseAnonKey,
      supabaseServiceKey,
      razorpayKeyId,
      razorpayKeySecret,
      whatsappNumber,
      adminEmail,
    } = body;

    const envMap = await readEnvFile();

    if (supabaseUrl !== undefined) envMap.set("NEXT_PUBLIC_SUPABASE_URL", supabaseUrl.trim());
    if (supabaseAnonKey !== undefined) envMap.set("NEXT_PUBLIC_SUPABASE_ANON_KEY", supabaseAnonKey.trim());
    if (supabaseServiceKey !== undefined) envMap.set("SUPABASE_SERVICE_ROLE_KEY", supabaseServiceKey.trim());
    if (razorpayKeyId !== undefined) {
      envMap.set("NEXT_PUBLIC_RAZORPAY_KEY_ID", razorpayKeyId.trim());
      envMap.set("RAZORPAY_KEY_ID", razorpayKeyId.trim());
    }
    if (razorpayKeySecret !== undefined) envMap.set("RAZORPAY_KEY_SECRET", razorpayKeySecret.trim());
    if (whatsappNumber !== undefined) envMap.set("NEXT_PUBLIC_WHATSAPP_NUMBER", whatsappNumber.trim().replace(/\D/g, ""));
    if (adminEmail !== undefined) envMap.set("ADMIN_EMAIL", adminEmail.trim());

    // Write to .env.local file
    await writeEnvFile(envMap);

    // Apply to current runtime process.env
    if (supabaseUrl) process.env.NEXT_PUBLIC_SUPABASE_URL = supabaseUrl.trim();
    if (supabaseAnonKey) process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = supabaseAnonKey.trim();
    if (supabaseServiceKey) process.env.SUPABASE_SERVICE_ROLE_KEY = supabaseServiceKey.trim();
    if (razorpayKeyId) {
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID = razorpayKeyId.trim();
      process.env.RAZORPAY_KEY_ID = razorpayKeyId.trim();
    }
    if (razorpayKeySecret) process.env.RAZORPAY_KEY_SECRET = razorpayKeySecret.trim();
    if (whatsappNumber) process.env.NEXT_PUBLIC_WHATSAPP_NUMBER = whatsappNumber.trim();
    if (adminEmail) process.env.ADMIN_EMAIL = adminEmail.trim();

    // Test Supabase connection if provided
    let supabaseStatus = "not_tested";
    if (supabaseUrl && (supabaseAnonKey || supabaseServiceKey)) {
      try {
        const testClient = createClient(supabaseUrl.trim(), (supabaseServiceKey || supabaseAnonKey).trim());
        const { error } = await testClient.from("products").select("id").limit(1);
        supabaseStatus = error ? `connected_with_notice: ${error.message}` : "connected_successfully";
      } catch (sbErr) {
        supabaseStatus = `error: ${sbErr instanceof Error ? sbErr.message : "Connection failed"}`;
      }
    }

    // Test Razorpay auth if provided
    let razorpayStatus = "not_tested";
    if (razorpayKeyId && razorpayKeySecret) {
      try {
        const auth = Buffer.from(`${razorpayKeyId.trim()}:${razorpayKeySecret.trim()}`).toString("base64");
        const rzpRes = await fetch("https://api.razorpay.com/v1/orders?count=1", {
          headers: { Authorization: `Basic ${auth}` },
        });
        razorpayStatus = rzpRes.ok ? "connected_successfully" : `failed_auth (${rzpRes.status})`;
      } catch {
        razorpayStatus = "network_error";
      }
    }

    return NextResponse.json({
      success: true,
      message: "Environment variables saved successfully to .env.local!",
      supabaseStatus,
      razorpayStatus,
    });
  } catch (error) {
    console.error("Save settings error:", error);
    const message = error instanceof Error ? error.message : "Failed to save settings";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
