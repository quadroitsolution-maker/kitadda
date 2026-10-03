import { NextRequest, NextResponse } from "next/server";
import { updateStock, updateProduct } from "@/lib/db";
import { StockStatus } from "@/types";

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, quantity_delta, stock_quantity, stock_status } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Product id is required" },
        { status: 400 }
      );
    }

    let updatedProduct;

    // Delta adjustment (+1 or -1 or custom delta)
    if (quantity_delta !== undefined) {
      updatedProduct = await updateStock(
        id,
        Number(quantity_delta),
        stock_status as StockStatus | undefined
      );
    } else {
      // Direct set
      const updates: { stock_quantity?: number; stock_status?: StockStatus } = {};
      if (stock_quantity !== undefined) {
        updates.stock_quantity = Math.max(0, Number(stock_quantity));
      }
      if (stock_status !== undefined) {
        updates.stock_status = stock_status as StockStatus;
      }
      updatedProduct = await updateProduct(id, updates);
    }

    if (!updatedProduct) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Inventory updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Admin PATCH /api/admin/inventory error:", error);
    const message = error instanceof Error ? error.message : "Failed to update inventory";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
