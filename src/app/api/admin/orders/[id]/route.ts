import { NextRequest, NextResponse } from "next/server";
import { updateOrderStatus } from "@/lib/db";
import { OrderStatus } from "@/types";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteProps) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, error: "Status is required" },
        { status: 400 }
      );
    }

    const updated = await updateOrderStatus(id, status as OrderStatus);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order status updated successfully",
      order: updated,
    });
  } catch (error) {
    console.error("Admin PATCH /api/admin/orders/[id] error:", error);
    const message = error instanceof Error ? error.message : "Failed to update order";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
