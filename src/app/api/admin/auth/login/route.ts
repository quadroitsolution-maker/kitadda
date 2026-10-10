import { NextRequest, NextResponse } from "next/server";
import { authenticateAdmin, signToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    const { user: adminUser, error: authError } = await authenticateAdmin(email, password);

    if (!adminUser) {
      return NextResponse.json(
        { success: false, error: authError || "Invalid admin credentials. Please check your Supabase email and password." },
        { status: 401 }
      );
    }

    const token = signToken(adminUser);

    const response = NextResponse.json({
      success: true,
      message: "Admin authenticated successfully",
      user: adminUser,
    });

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Admin Login Error:", error);
    const message = error instanceof Error ? error.message : "Authentication failed";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
