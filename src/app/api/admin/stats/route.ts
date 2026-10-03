import { NextResponse } from "next/server";
import { getDashboardStats } from "@/lib/db";

export async function GET() {
  try {
    const stats = await getDashboardStats();
    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Admin GET /api/admin/stats error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
