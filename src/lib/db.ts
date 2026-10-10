import fs from "fs/promises";
import path from "path";
import { Product, OrderRecord, StockStatus, OrderStatus, CartItem, HeroSlide, Coupon } from "@/types";
import { PRODUCTS as INITIAL_PRODUCTS } from "@/data/products";
import { getServiceSupabase } from "./supabase";

const DATA_DIR = path.join(process.cwd(), "data");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
const SLIDERS_FILE = path.join(DATA_DIR, "sliders.json");
const COUPONS_FILE = path.join(DATA_DIR, "coupons.json");

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
 * Read all products from Supabase (or fallback to local disk)
 */
export async function getProducts(options?: {
  category?: string;
  search?: string;
  stock_status?: string;
}): Promise<Product[]> {
  await ensureDataDir();

  let products: Product[] = [];
  let fetchedFromSupabase = false;

  // Try fetching from Supabase first
  try {
    const supabase = getServiceSupabase();
    let query = supabase.from("products").select("*").order("created_at", { ascending: false });

    if (options?.category && options.category !== "all") {
      query = query.eq("category", options.category);
    }
    if (options?.stock_status && options.stock_status !== "all") {
      query = query.eq("stock_status", options.stock_status);
    }

    const { data, error } = await query;

    if (!error && data && data.length > 0) {
      products = data.map((item) => ({
        id: item.id,
        sku: item.sku || `KA-${item.id.slice(0, 6)}`,
        title: item.title,
        description: item.description || "",
        price: Number(item.price),
        compare_at_price: Number(item.compare_at_price || item.price * 1.5),
        category: item.category,
        image_url: item.image_url,
        gallery: Array.isArray(item.gallery) && item.gallery.length > 0 ? item.gallery : [item.image_url],
        stock_status: item.stock_status || "in_stock",
        stock_quantity: item.stock_quantity ?? 15,
        team: item.team || "",
        league: item.league || "",
        season: item.season || "2024/25",
        badge: item.badge || "",
        is_featured: Boolean(item.is_featured),
        version_type: item.version_type || "Fan Version",
        sizes: item.sizes || ["S", "M", "L", "XL", "XXL"],
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));
      fetchedFromSupabase = true;
    }
  } catch (err) {
    console.debug("Supabase getProducts fallback to local:", err);
  }

  // Fallback to local JSON if Supabase returned nothing or errored
  if (!fetchedFromSupabase) {
    try {
      const data = await fs.readFile(PRODUCTS_FILE, "utf-8");
      products = JSON.parse(data);
    } catch {
      products = DEFAULT_SEED_PRODUCTS;
      await fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2), "utf-8");
    }

    // Filter criteria on local dataset
    if (options?.category && options.category !== "all") {
      products = products.filter((p) => p.category === options.category);
    }

    if (options?.stock_status && options.stock_status !== "all") {
      products = products.filter((p) => p.stock_status === options.stock_status);
    }
  }

  // Search filter
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

  // Dual-sync to Supabase
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
    console.debug("Supabase product upsert skipped:", err);
  }

  // Update local file
  const existingIdx = products.findIndex((p) => p.id === id);
  if (existingIdx >= 0) {
    products[existingIdx] = product;
  } else {
    products.unshift(product);
  }
  await fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2), "utf-8");

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
    id: existing.id,
    stock_quantity: stockQuantity,
    stock_status: stockStatus,
    price: updates.price !== undefined ? Number(updates.price) : existing.price,
    compare_at_price: updates.compare_at_price !== undefined ? Number(updates.compare_at_price) : existing.compare_at_price,
    updated_at: new Date().toISOString(),
  };

  // Sync to Supabase
  try {
    const supabase = getServiceSupabase();
    await supabase.from("products").update({
      title: updated.title,
      description: updated.description,
      price: updated.price,
      compare_at_price: updated.compare_at_price,
      category: updated.category,
      image_url: updated.image_url,
      gallery: updated.gallery,
      stock_status: updated.stock_status,
      team: updated.team,
      league: updated.league,
      season: updated.season,
      badge: updated.badge,
      is_featured: updated.is_featured,
      version_type: updated.version_type,
      updated_at: new Date().toISOString(),
    }).eq("id", id);
  } catch (err) {
    console.debug("Supabase product update skipped:", err);
  }

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

  // Supabase delete
  try {
    const supabase = getServiceSupabase();
    await supabase.from("products").delete().eq("id", id);
  } catch (err) {
    console.debug("Supabase delete skipped:", err);
  }

  return true;
}

/**
 * Quick stock adjuster: inline change quantity & status
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
 * Get all orders (from Supabase with local JSON fallback)
 */
export async function getOrders(options?: {
  status?: string;
  search?: string;
}): Promise<OrderRecord[]> {
  await ensureDataDir();

  let orders: OrderRecord[] = [];
  let fetchedFromSupabase = false;

  // 1. Try fetching from Supabase
  try {
    const supabase = getServiceSupabase();
    let query = supabase.from("orders").select(`
      *,
      order_items (*)
    `).order("created_at", { ascending: false });

    if (options?.status && options.status !== "all") {
      query = query.eq("status", options.status);
    }

    const { data, error } = await query;

    if (!error && data && data.length > 0) {
      orders = data.map((o) => {
        // Map order_items to CartItem structure
        const items: CartItem[] = (o.order_items || []).map((oi: {
          id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          size: string;
          custom_name: string | null;
          custom_number: string | null;
          patches: boolean;
          customizations?: { version?: string; title?: string; product_title?: string; product_image?: string };
        }) => ({
          cart_item_id: oi.id,
          product: {
            id: oi.product_id,
            title: oi.customizations?.product_title || oi.customizations?.title || "Football Jersey",
            description: "",
            price: Number(oi.unit_price),
            compare_at_price: Number(oi.unit_price) * 1.5,
            category: "fan-version" as const,
            image_url: oi.customizations?.product_image || "https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&w=800&q=80",
            gallery: [],
            stock_status: "in_stock" as const,
            team: "",
            league: "",
            season: "2024/25",
          },
          size: (oi.size || "M") as "S" | "M" | "L" | "XL" | "XXL",
          version: (oi.customizations?.version || "Fan Version") as "Fan Version" | "Player Version",
          custom_name: oi.custom_name || "",
          custom_number: oi.custom_number || "",
          patches: Boolean(oi.patches),
          patch_fee: oi.patches ? 150 : 0,
          unit_price: Number(oi.unit_price),
          quantity: oi.quantity || 1,
        }));

        return {
          id: String(o.id),
          user_id: o.user_id,
          total_amount: Number(o.total_amount),
          payment_status: o.payment_status,
          payment_method: o.payment_method || "razorpay",
          razorpay_order_id: o.razorpay_order_id,
          razorpay_payment_id: o.razorpay_payment_id,
          razorpay_signature: o.razorpay_signature,
          shipping_address: o.shipping_address || {},
          status: o.status,
          items,
          created_at: o.created_at,
          updated_at: o.updated_at,
        };
      });
      fetchedFromSupabase = true;
    }
  } catch (err) {
    console.debug("Supabase getOrders fallback to local:", err);
  }

  // 2. Fallback to local JSON if Supabase had no data or errored
  if (!fetchedFromSupabase) {
    try {
      const data = await fs.readFile(ORDERS_FILE, "utf-8");
      orders = JSON.parse(data);
    } catch {
      orders = [];
      await fs.writeFile(ORDERS_FILE, JSON.stringify([], null, 2), "utf-8");
    }

    if (options?.status && options.status !== "all") {
      orders = orders.filter((o) => o.status === options.status);
    }
  }

  // 3. Search Filter (by customer name, phone, order ID, or pincode)
  if (options?.search) {
    const q = options.search.toLowerCase().trim();
    orders = orders.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        o.shipping_address?.fullName?.toLowerCase().includes(q) ||
        o.shipping_address?.phone?.includes(q) ||
        o.shipping_address?.city?.toLowerCase().includes(q) ||
        o.shipping_address?.pincode?.includes(q) ||
        (o.razorpay_order_id && o.razorpay_order_id.toLowerCase().includes(q)) ||
        (o.razorpay_payment_id && o.razorpay_payment_id.toLowerCase().includes(q))
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

  // Sync to Supabase
  try {
    const supabase = getServiceSupabase();
    const { data: dbOrder } = await supabase
      .from("orders")
      .insert({
        total_amount: order.total_amount,
        payment_status: order.payment_status,
        payment_method: order.payment_method || "razorpay",
        razorpay_order_id: order.razorpay_order_id || null,
        razorpay_payment_id: order.razorpay_payment_id || null,
        razorpay_signature: order.razorpay_signature || null,
        shipping_address: order.shipping_address,
        status: order.status,
      })
      .select()
      .single();

    if (dbOrder && order.items && order.items.length > 0) {
      const orderItems = order.items.map((it) => ({
        order_id: dbOrder.id,
        product_id: it.product.id,
        quantity: it.quantity,
        unit_price: it.unit_price,
        size: it.size,
        custom_name: it.custom_name || null,
        custom_number: it.custom_number || null,
        patches: it.patches || false,
        customizations: {
          version: it.version,
          product_title: it.product.title,
          product_image: it.product.image_url,
        },
      }));
      await supabase.from("order_items").insert(orderItems);
    }
  } catch (err) {
    console.debug("Supabase createOrder sync skipped:", err);
  }

  // Update local file
  orders.unshift(order);
  await fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf-8");

  // Automatically decrement inventory stock
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
  const index = orders.findIndex((o) => o.id === id || o.razorpay_order_id === id);

  if (index === -1) {
    // If not found in memory, try updating directly in Supabase
    try {
      const supabase = getServiceSupabase();
      const { data, error } = await supabase
        .from("orders")
        .update({ status, updated_at: new Date().toISOString() })
        .or(`id.eq.${id},razorpay_order_id.eq.${id}`)
        .select()
        .single();

      if (!error && data) {
        return {
          id: String(data.id),
          total_amount: Number(data.total_amount),
          payment_status: data.payment_status,
          payment_method: data.payment_method,
          razorpay_order_id: data.razorpay_order_id,
          razorpay_payment_id: data.razorpay_payment_id,
          shipping_address: data.shipping_address,
          status: data.status,
          created_at: data.created_at,
          updated_at: data.updated_at,
        };
      }
    } catch (dbErr) {
      console.debug("Supabase direct order status update failed:", dbErr);
    }
    return null;
  }

  orders[index].status = status;
  orders[index].updated_at = new Date().toISOString();

  // Sync status to Supabase
  try {
    const supabase = getServiceSupabase();
    await supabase
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .or(`id.eq.${id},razorpay_order_id.eq.${id}`);
  } catch (err) {
    console.debug("Supabase updateOrderStatus skipped:", err);
  }

  await fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf-8");
  return orders[index];
}

/**
 * Dashboard & Inventory Stats
 */
export async function getDashboardStats() {
  const products = await getProducts();
  const orders = await getOrders();

  let totalRevenue = 0;
  let processingOrdersCount = 0;
  let shippedOrdersCount = 0;
  let deliveredOrdersCount = 0;
  let cancelledOrdersCount = 0;

  for (const o of orders) {
    const amount = Number(o.total_amount || 0);

    if (o.status === "processing") processingOrdersCount++;
    else if (o.status === "shipped") shippedOrdersCount++;
    else if (o.status === "delivered") deliveredOrdersCount++;
    else if (o.status === "cancelled") cancelledOrdersCount++;

    if (o.payment_status === "paid" || o.status !== "cancelled") {
      totalRevenue += amount;
    }
  }

  const lowStockCount = products.filter(
    (p) => p.stock_status === "low_stock" || ((p.stock_quantity ?? 0) > 0 && (p.stock_quantity ?? 0) <= 5)
  ).length;

  const outOfStockCount = products.filter(
    (p) => p.stock_status === "out_of_stock" || (p.stock_quantity ?? 0) <= 0
  ).length;

  return {
    totalRevenue,
    totalOrders: orders.length,
    processingOrdersCount, // Pending
    shippedOrdersCount,   // Shipped
    deliveredOrdersCount, // Fulfilled
    cancelledOrdersCount, // Cancelled
    totalProducts: products.length,
    lowStockCount,
    outOfStockCount,
  };
}

/**
 * Default initial hero slides
 */
export const DEFAULT_SLIDERS: HeroSlide[] = [
  {
    id: "slide-1",
    badge: "2024/25 SEASON",
    headline: "Current Season Kits",
    description: "Player & Fan Version master grade drops.",
    cta_link: "#latest-drops",
    image_url: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1920&q=85",
    order_index: 0,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "slide-2",
    badge: "MATCH GEAR",
    headline: "Anti-Slip Grip Socks",
    description: "High-traction silicone lock-in.",
    cta_link: "#latest-drops",
    image_url: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1920&q=85",
    order_index: 1,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "slide-3",
    badge: "INTERNATIONAL",
    headline: "World Cup Editions",
    description: "Official national team jerseys.",
    cta_link: "#latest-drops",
    image_url: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=1920&q=85",
    order_index: 2,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

/**
 * Get all hero sliders (Supabase with JSON disk backup)
 */
export async function getSliders(activeOnly: boolean = false): Promise<HeroSlide[]> {
  await ensureDataDir();

  let slides: HeroSlide[] = [];

  // 1. Try Supabase hero_slides table or site_settings
  try {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from("hero_slides")
      .select("*")
      .order("order_index", { ascending: true });

    if (!error && data && data.length > 0) {
      slides = data.map((item) => ({
        id: item.id,
        badge: item.badge || "",
        headline: item.headline || "",
        description: item.description || "",
        cta_link: item.cta_link || item.ctaLink || "#latest-drops",
        image_url: item.image_url || item.imageUrl || "",
        order_index: item.order_index ?? 0,
        is_active: item.is_active ?? true,
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));
    }
  } catch (err) {
    console.warn("Supabase hero_slides fetch error, falling back to disk:", err);
  }

  // 2. Fallback to local JSON file if Supabase has no data
  if (slides.length === 0) {
    try {
      const raw = await fs.readFile(SLIDERS_FILE, "utf-8");
      slides = JSON.parse(raw);
    } catch {
      // Initialize with default slides
      slides = [...DEFAULT_SLIDERS];
      await fs.writeFile(SLIDERS_FILE, JSON.stringify(slides, null, 2));
    }
  }

  if (activeOnly) {
    return slides.filter((s) => s.is_active);
  }

  return slides.sort((a, b) => a.order_index - b.order_index);
}

/**
 * Save / Create a new hero slider
 */
export async function createSlider(data: Partial<HeroSlide>): Promise<HeroSlide> {
  const current = await getSliders();
  const nextOrder = current.length > 0 ? Math.max(...current.map((s) => s.order_index)) + 1 : 0;

  const newSlide: HeroSlide = {
    id: `slide-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    badge: data.badge || "NEW DROP",
    headline: data.headline || "New Collection",
    description: data.description || "Master grade official kits.",
    cta_link: data.cta_link || "#latest-drops",
    image_url: data.image_url || "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1920&q=85",
    order_index: data.order_index ?? nextOrder,
    is_active: data.is_active !== undefined ? data.is_active : true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // 1. Try Supabase
  try {
    const supabase = getServiceSupabase();
    await supabase.from("hero_slides").upsert(newSlide);
  } catch (err) {
    console.warn("Supabase createSlider error:", err);
  }

  // 2. Write to local disk
  const updatedList = [...current, newSlide];
  await fs.writeFile(SLIDERS_FILE, JSON.stringify(updatedList, null, 2));

  return newSlide;
}

/**
 * Update an existing hero slider
 */
export async function updateSlider(id: string, updates: Partial<HeroSlide>): Promise<HeroSlide | null> {
  const current = await getSliders();
  const index = current.findIndex((s) => s.id === id);

  if (index === -1) return null;

  const updated: HeroSlide = {
    ...current[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };

  // 1. Try Supabase
  try {
    const supabase = getServiceSupabase();
    await supabase.from("hero_slides").update(updated).eq("id", id);
  } catch (err) {
    console.warn("Supabase updateSlider error:", err);
  }

  // 2. Write to local disk
  current[index] = updated;
  await fs.writeFile(SLIDERS_FILE, JSON.stringify(current, null, 2));

  return updated;
}

/**
 * Delete a hero slider
 */
export async function deleteSlider(id: string): Promise<boolean> {
  const current = await getSliders();
  const filtered = current.filter((s) => s.id !== id);

  if (filtered.length === current.length) return false;

  // 1. Try Supabase
  try {
    const supabase = getServiceSupabase();
    await supabase.from("hero_slides").delete().eq("id", id);
  } catch (err) {
    console.warn("Supabase deleteSlider error:", err);
  }

  // 2. Write to local disk
  await fs.writeFile(SLIDERS_FILE, JSON.stringify(filtered, null, 2));
  return true;
}

/**
 * Reorder hero sliders
 */
export async function reorderSliders(orderedIds: string[]): Promise<HeroSlide[]> {
  const current = await getSliders();
  const reordered: HeroSlide[] = [];

  orderedIds.forEach((id, idx) => {
    const item = current.find((s) => s.id === id);
    if (item) {
      const updatedItem = { ...item, order_index: idx, updated_at: new Date().toISOString() };
      reordered.push(updatedItem);

      // Try updating in Supabase
      try {
        const supabase = getServiceSupabase();
        supabase.from("hero_slides").update({ order_index: idx }).eq("id", id);
      } catch (err) {
        console.warn("Supabase reorder update error:", err);
      }
    }
  });

  await fs.writeFile(SLIDERS_FILE, JSON.stringify(reordered, null, 2));
  return reordered;
}

/**
 * Default initial active coupon codes
 */
export const DEFAULT_COUPONS: Coupon[] = [
  {
    id: "coup-1",
    code: "ADDA10",
    discount_type: "percentage",
    discount_value: 10,
    min_order_amount: 0,
    max_discount_amount: 500,
    is_active: true,
    description: "10% off across all kits in store",
    usage_count: 24,
    created_at: new Date().toISOString(),
  },
  {
    id: "coup-2",
    code: "KIT100",
    discount_type: "fixed",
    discount_value: 100,
    min_order_amount: 999,
    is_active: true,
    description: "Flat ₹100 instant discount on orders above ₹999",
    usage_count: 18,
    created_at: new Date().toISOString(),
  },
  {
    id: "coup-3",
    code: "FREESHIP",
    discount_type: "free_shipping",
    discount_value: 0,
    min_order_amount: 0,
    is_active: true,
    description: "Free express shipping on your entire cart",
    usage_count: 31,
    created_at: new Date().toISOString(),
  },
  {
    id: "coup-4",
    code: "WELCOME50",
    discount_type: "fixed",
    discount_value: 50,
    min_order_amount: 499,
    is_active: true,
    description: "Flat ₹50 off on first order",
    usage_count: 42,
    created_at: new Date().toISOString(),
  },
];

/**
 * Get all coupons
 */
export async function getCoupons(activeOnly: boolean = false): Promise<Coupon[]> {
  await ensureDataDir();
  let coupons: Coupon[] = [];

  // 1. Try Supabase
  try {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      coupons = data.map((c) => ({
        id: c.id,
        code: (c.code || "").toUpperCase(),
        discount_type: c.discount_type || "percentage",
        discount_value: Number(c.discount_value || 0),
        min_order_amount: c.min_order_amount ? Number(c.min_order_amount) : undefined,
        max_discount_amount: c.max_discount_amount ? Number(c.max_discount_amount) : undefined,
        is_active: c.is_active ?? true,
        description: c.description || "",
        expires_at: c.expires_at,
        usage_count: c.usage_count || 0,
        created_at: c.created_at,
      }));
    }
  } catch (err) {
    console.warn("Supabase coupons fetch fallback to local disk:", err);
  }

  // 2. Fallback to local JSON file
  if (coupons.length === 0) {
    try {
      const raw = await fs.readFile(COUPONS_FILE, "utf-8");
      coupons = JSON.parse(raw);
    } catch {
      coupons = [...DEFAULT_COUPONS];
      await fs.writeFile(COUPONS_FILE, JSON.stringify(coupons, null, 2));
    }
  }

  if (activeOnly) {
    return coupons.filter((c) => c.is_active);
  }

  return coupons;
}

/**
 * Find coupon by code (case insensitive)
 */
export async function getCouponByCode(rawCode: string): Promise<Coupon | null> {
  const code = rawCode.trim().toUpperCase();
  const coupons = await getCoupons(true);
  const found = coupons.find((c) => c.code.toUpperCase() === code);
  return found || null;
}

/**
 * Validate and calculate discount for a coupon
 */
export function calculateCouponDiscount(
  coupon: Coupon,
  subtotal: number,
  shippingFee: number
): {
  isValid: boolean;
  error?: string;
  discount: number;
  finalShipping: number;
  message: string;
} {
  if (!coupon.is_active) {
    return {
      isValid: false,
      error: `Coupon "${coupon.code}" is currently inactive`,
      discount: 0,
      finalShipping: shippingFee,
      message: "Coupon is inactive",
    };
  }

  if (coupon.min_order_amount && subtotal < coupon.min_order_amount) {
    return {
      isValid: false,
      error: `Minimum order amount of ₹${coupon.min_order_amount} required for coupon "${coupon.code}"`,
      discount: 0,
      finalShipping: shippingFee,
      message: `Add ₹${coupon.min_order_amount - subtotal} more to use this coupon`,
    };
  }

  if (coupon.expires_at && new Date(coupon.expires_at).getTime() < Date.now()) {
    return {
      isValid: false,
      error: `Coupon "${coupon.code}" has expired`,
      discount: 0,
      finalShipping: shippingFee,
      message: "Coupon has expired",
    };
  }

  let discount = 0;
  let finalShipping = shippingFee;

  if (coupon.discount_type === "percentage") {
    discount = Math.round((subtotal * coupon.discount_value) / 100);
    if (coupon.max_discount_amount && discount > coupon.max_discount_amount) {
      discount = coupon.max_discount_amount;
    }
  } else if (coupon.discount_type === "fixed") {
    discount = Math.min(coupon.discount_value, subtotal);
  } else if (coupon.discount_type === "free_shipping") {
    finalShipping = 0;
    discount = 0; // Discount applies to shipping only, not deducted from product subtotal
  }

  const message =
    coupon.discount_type === "free_shipping" && subtotal >= 999
      ? "Free express shipping is already unlocked for orders above ₹999!"
      : coupon.description || `Coupon ${coupon.code} applied successfully!`;

  return {
    isValid: true,
    discount,
    finalShipping,
    message,
  };
}

/**
 * Create a new coupon
 */
export async function createCoupon(data: Partial<Coupon>): Promise<Coupon> {
  const current = await getCoupons();
  const code = (data.code || "").trim().toUpperCase();

  const newCoupon: Coupon = {
    id: `coup-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    code,
    discount_type: data.discount_type || "percentage",
    discount_value: Number(data.discount_value || 10),
    min_order_amount: data.min_order_amount ? Number(data.min_order_amount) : 0,
    max_discount_amount: data.max_discount_amount ? Number(data.max_discount_amount) : undefined,
    is_active: data.is_active !== undefined ? Boolean(data.is_active) : true,
    description: data.description || `${data.discount_value}% discount on orders`,
    expires_at: data.expires_at,
    usage_count: 0,
    created_at: new Date().toISOString(),
  };

  // 1. Supabase
  try {
    const supabase = getServiceSupabase();
    await supabase.from("coupons").upsert(newCoupon);
  } catch (err) {
    console.warn("Supabase createCoupon error:", err);
  }

  // 2. Disk
  const updated = [newCoupon, ...current];
  await fs.writeFile(COUPONS_FILE, JSON.stringify(updated, null, 2));

  return newCoupon;
}

/**
 * Update a coupon
 */
export async function updateCoupon(id: string, updates: Partial<Coupon>): Promise<Coupon | null> {
  const current = await getCoupons();
  const idx = current.findIndex((c) => c.id === id);
  if (idx === -1) return null;

  const updated: Coupon = {
    ...current[idx],
    ...updates,
    code: updates.code ? updates.code.trim().toUpperCase() : current[idx].code,
  };

  try {
    const supabase = getServiceSupabase();
    await supabase.from("coupons").update(updated).eq("id", id);
  } catch (err) {
    console.warn("Supabase updateCoupon error:", err);
  }

  current[idx] = updated;
  await fs.writeFile(COUPONS_FILE, JSON.stringify(current, null, 2));
  return updated;
}

/**
 * Delete a coupon
 */
export async function deleteCoupon(id: string): Promise<boolean> {
  const current = await getCoupons();
  const filtered = current.filter((c) => c.id !== id);
  if (filtered.length === current.length) return false;

  try {
    const supabase = getServiceSupabase();
    await supabase.from("coupons").delete().eq("id", id);
  } catch (err) {
    console.warn("Supabase deleteCoupon error:", err);
  }

  await fs.writeFile(COUPONS_FILE, JSON.stringify(filtered, null, 2));
  return true;
}

/**
 * Increment usage counter for a coupon
 */
export async function incrementCouponUsage(code: string): Promise<void> {
  const coupon = await getCouponByCode(code);
  if (!coupon) return;
  await updateCoupon(coupon.id, { usage_count: (coupon.usage_count || 0) + 1 });
}


