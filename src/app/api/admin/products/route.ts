import { NextRequest, NextResponse } from "next/server";
import { getProducts, createProduct } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;
    const stock_status = searchParams.get("stock_status") || undefined;

    const products = await getProducts({
      category,
      search,
      stock_status,
    });

    return NextResponse.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Admin GET /api/admin/products error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.title || !body.price || !body.category) {
      return NextResponse.json(
        { success: false, error: "Title, Price, and Category are required" },
        { status: 400 }
      );
    }

    const created = await createProduct({
      id: body.id,
      sku: body.sku,
      title: body.title,
      description: body.description || "",
      price: Number(body.price),
      compare_at_price: Number(body.compare_at_price || body.price),
      category: body.category,
      image_url: body.image_url || "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=800&q=80",
      gallery: body.gallery || (body.image_url ? [body.image_url] : []),
      stock_status: body.stock_status || "in_stock",
      stock_quantity: body.stock_quantity !== undefined ? Number(body.stock_quantity) : 10,
      team: body.team || "Official Kit",
      league: body.league || "Club / International",
      season: body.season || "2024/25",
      badge: body.badge || "",
      is_featured: Boolean(body.is_featured),
      version_type: body.version_type || "Fan Version",
      sizes: body.sizes || ["S", "M", "L", "XL", "XXL"],
    });

    return NextResponse.json({
      success: true,
      message: "Product created successfully",
      product: created,
    }, { status: 201 });
  } catch (error) {
    console.error("Admin POST /api/admin/products error:", error);
    const message = error instanceof Error ? error.message : "Failed to create product";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
