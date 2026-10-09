import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const adminUser = await getAdminSession(req);

  if (!adminUser) {
    return NextResponse.json(
      { success: false, authenticated: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    authenticated: true,
    user: adminUser,
  });
}
