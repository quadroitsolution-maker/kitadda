import fs from "fs/promises";
import path from "path";
import { Product, OrderRecord, StockStatus, OrderStatus } from "@/types";
import { PRODUCTS as INITIAL_PRODUCTS } from "@/data/products";
import { getServiceSupabase } from "./supabase";

const DATA_DIR = path.join(process.cwd(), "data");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

// Ensure data folder exists
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (err) {
    console.error("Failed to create data dir:", err);
  }
}

// Initial seed products with default WooCommerce-like inventory attributes
const DEFAULT_SEED_PRODUCTS: Product[] = INITIAL_PRODUCTS.map((p, idx) => ({
  ...p,
  sku: p.sku || `KA-${p.team.replace(/\s+/g, "").slice(0, 3).toUpperCase()}-${String(idx + 1).padStart(3, "0")}`,
  stock_quantity: p.stock_quantity ?? (p.stock_status === "out_of_stock" ? 0 : p.stock_status === "low_stock" ? 4 : 25),
  sizes: p.sizes || ["S", "M", "L", "XL", "XXL"],
  created_at: new Date(Date.now() - (idx * 3600000)).toISOString(),
  updated_at: new Date().toISOString(),
}));

/**
 * Read all products from disk, or initialize if not present
 */
export async function getProducts(options?: {
  category?: string;
  search?: string;
  stock_status?: string;
}): Promise<Product[]> {
  await ensureDataDir();

  let products: Product[] = [];

  try {
    const data = await fs.readFile(PRODUCTS_FILE, "utf-8");
    products = JSON.parse(data);
  } catch {
    // If file doesn't exist, seed it with default catalog
    products = DEFAULT_SEED_PRODUCTS;
    await fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2), "utf-8");
  }

  // Filter if criteria passed
  if (options?.category && options.category !== "all") {
    products = products.filter((p) => p.category === options.category);
  }

  if (options?.stock_status && options.stock_status !== "all") {
    products = products.filter((p) => p.stock_status === options.stock_status);
  }

  if (options?.search) {
    const q = options.search.toLowerCase().trim();
    products = products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.team.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q))
    );
  }

  return products;
}

/**
 * Get single product by ID or SKU
 */
export async function getProductById(idOrSku: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find((p) => p.id === idOrSku || p.sku?.toLowerCase() === idOrSku.toLowerCase()) || null;
}

/**
 * Create a new product (WooCommerce 'Add New Product')
 */
export async function createProduct(
  newProduct: Omit<Product, "created_at" | "updated_at">
): Promise<Product> {
  await ensureDataDir();
  const products = await getProducts();

  // Generate ID if not provided
  const id = newProduct.id?.trim() || newProduct.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `prod-${Date.now()}`;
  const sku = newProduct.sku?.trim() || `KA-${Date.now().toString().slice(-6)}`;

  const stockQuantity = Number(newProduct.stock_quantity ?? 10);
  const stockStatus: StockStatus = newProduct.stock_status || (stockQuantity <= 0 ? "out_of_stock" : stockQuantity <= 5 ? "low_stock" : "in_stock");

  const product: Product = {
    ...newProduct,
    id,
    sku,
    stock_quantity: stockQuantity,
    stock_status: stockStatus,
    price: Number(newProduct.price),
    compare_at_price: Number(newProduct.compare_at_price || newProduct.price * 1.5),
    gallery: newProduct.gallery && newProduct.gallery.length > 0 ? newProduct.gallery : [newProduct.image_url],
    sizes: newProduct.sizes || ["S", "M", "L", "XL", "XXL"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Check if exists
  const existingIdx = products.findIndex((p) => p.id === id);
  if (existingIdx >= 0) {
    products[existingIdx] = product;
  } else {
    products.unshift(product);
  }

  await fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2), "utf-8");

  // Optional Supabase dual-sync
  try {
    const supabase = getServiceSupabase();
    await supabase.from("products").upsert({
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
      compare_at_price: product.compare_at_price,
      category: product.category,
      image_url: product.image_url,
      gallery: product.gallery,
      stock_status: product.stock_status,
      team: product.team,
      league: product.league,
      season: product.season,
      badge: product.badge,
      is_featured: product.is_featured,
      version_type: product.version_type,
    });
  } catch (err) {
    // Silently continue if Supabase is offline/placeholder
    console.debug("Supabase product sync skipped:", err);
  }

  return product;
}

/**
 * Update an existing product
 */
export async function updateProduct(
  id: string,
  updates: Partial<Product>
): Promise<Product | null> {
  await ensureDataDir();
  const products = await getProducts();
  const index = products.findIndex((p) => p.id === id);

  if (index === -1) {
    return null;
  }

  const existing = products[index];

  let stockQuantity = updates.stock_quantity !== undefined ? Number(updates.stock_quantity) : existing.stock_quantity;
  let stockStatus = updates.stock_status || existing.stock_status;

  if (updates.stock_quantity !== undefined) {
    stockQuantity = Number(updates.stock_quantity);
    if (stockQuantity <= 0) {
      stockStatus = "out_of_stock";
    } else if (stockQuantity <= 5) {
      stockStatus = "low_stock";
    } else if (!updates.stock_status || updates.stock_status === "out_of_stock") {
      stockStatus = "in_stock";
    }
  }

  const updated: Product = {
    ...existing,
    ...updates,
    id: existing.id, // Immutable ID
    stock_quantity: stockQuantity,
    stock_status: stockStatus,
    price: updates.price !== undefined ? Number(updates.price) : existing.price,
    compare_at_price: updates.compare_at_price !== undefined ? Number(updates.compare_at_price) : existing.compare_at_price,
    updated_at: new Date().toISOString(),
  };

  products[index] = updated;
  await fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2), "utf-8");

  return updated;
}

/**
 * Delete a product
 */
export async function deleteProduct(id: string): Promise<boolean> {
  await ensureDataDir();
  const products = await getProducts();
  const filtered = products.filter((p) => p.id !== id);

  if (filtered.length === products.length) {
    return false;
  }

  await fs.writeFile(PRODUCTS_FILE, JSON.stringify(filtered, null, 2), "utf-8");

  // Optional Supabase sync
  try {
    const supabase = getServiceSupabase();
    await supabase.from("products").delete().eq("id", id);
  } catch (err) {
    console.debug("Supabase delete sync skipped:", err);
  }

  return true;
}

/**
 * WooCommerce quick stock adjuster: inline change quantity & status
 */
export async function updateStock(
  id: string,
  quantityDelta: number,
  statusOverride?: StockStatus
): Promise<Product | null> {
  const product = await getProductById(id);
  if (!product) return null;

  const currentQty = product.stock_quantity ?? 0;
  const newQty = Math.max(0, currentQty + quantityDelta);

  let newStatus: StockStatus = statusOverride || (newQty <= 0 ? "out_of_stock" : newQty <= 5 ? "low_stock" : "in_stock");
  if (statusOverride) {
    newStatus = statusOverride;
  }

  return updateProduct(id, {
    stock_quantity: newQty,
    stock_status: newStatus,
  });
}

/**
 * Get all orders
 */
export async function getOrders(options?: {
  status?: string;
  search?: string;
}): Promise<OrderRecord[]> {
  await ensureDataDir();

  let orders: OrderRecord[] = [];

  try {
    const data = await fs.readFile(ORDERS_FILE, "utf-8");
    orders = JSON.parse(data);
  } catch {
    orders = [];
    await fs.writeFile(ORDERS_FILE, JSON.stringify([], null, 2), "utf-8");
  }

  // Filter if requested
  if (options?.status && options.status !== "all") {
    orders = orders.filter((o) => o.status === options.status);
  }

  if (options?.search) {
    const q = options.search.toLowerCase().trim();
    orders = orders.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        o.shipping_address?.fullName.toLowerCase().includes(q) ||
        o.shipping_address?.phone.includes(q) ||
        (o.razorpay_order_id && o.razorpay_order_id.toLowerCase().includes(q))
    );
  }

  // Sort newest first
  return orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

/**
 * Record a new order and decrement inventory
 */
export async function createOrder(
  newOrder: Omit<OrderRecord, "id" | "created_at">
): Promise<OrderRecord> {
  await ensureDataDir();
  const orders = await getOrders();

  const id = `KA-ORD-${Date.now().toString().slice(-6)}`;
  const order: OrderRecord = {
    ...newOrder,
    id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  orders.unshift(order);
  await fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf-8");

  // Automatically decrement inventory stock if items exist
  if (order.items && order.items.length > 0) {
    for (const item of order.items) {
      if (item.product?.id) {
        await updateStock(item.product.id, -item.quantity);
      }
    }
  }

  return order;
}

/**
 * Update order status (Processing, Shipped, Delivered, Cancelled)
 */
export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<OrderRecord | null> {
  await ensureDataDir();
  const orders = await getOrders();
  const index = orders.findIndex((o) => o.id === id);

  if (index === -1) return null;

  orders[index].status = status;
  orders[index].updated_at = new Date().toISOString();

  await fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf-8");
  return orders[index];
}

/**
 * Dashboard & Inventory Stats
 */
export async function getDashboardStats() {
  const products = await getProducts();
  const orders = await getOrders();

  const totalRevenue = orders.reduce((acc, o) => {
    if (o.payment_status === "paid" || o.payment_method === "cod") {
      return acc + (o.total_amount || 0);
    }
    return acc;
  }, 0);

  const lowStockCount = products.filter((p) => p.stock_status === "low_stock" || ((p.stock_quantity ?? 0) > 0 && (p.stock_quantity ?? 0) <= 5)).length;
  const outOfStockCount = products.filter((p) => p.stock_status === "out_of_stock" || (p.stock_quantity ?? 0) <= 0).length;

  return {
    totalRevenue,
    totalOrders: orders.length,
    totalProducts: products.length,
    lowStockCount,
    outOfStockCount,
    processingOrdersCount: orders.filter((o) => o.status === "processing").length,
  };
}
