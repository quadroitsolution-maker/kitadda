"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product, OrderRecord, StockStatus, OrderStatus, ProductCategory } from "@/types";
import {
  Package,
  Layers,
  ShoppingBag,
  TrendingUp,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Server,
  Lock,
  Unlock,
  ChevronRight,
  Eye,
  X,
  MessageCircle,
  DollarSign
} from "lucide-react";

type AdminTab = "dashboard" | "products" | "inventory" | "orders" | "hostinger";

const CATEGORY_LABELS: Record<ProductCategory, string> = {
  "player-version": "Player Version",
  "fan-version": "Fan Version",
  "world-cup": "World Cup",
  "accessories": "Grip Socks & Accessories",
  "club": "Club Jerseys",
  "retro": "Retro Vault",
  "international": "International",
  "jackets": "Jackets & Streetwear",
};

export default function AdminDashboardPage() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passkeyInput, setPasskeyInput] = useState<string>("");
  const [authError, setAuthError] = useState<string>("");

  // Tab navigation
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");

  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    processingOrdersCount: 0,
  });
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Filters
  const [productSearch, setProductSearch] = useState<string>("");
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>("all");
  const [productStockFilter, setProductStockFilter] = useState<string>("all");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");
  const [orderSearch, setOrderSearch] = useState<string>("");

  // Notification toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<OrderRecord | null>(null);

  // Form State for Add / Edit Product
  const [formData, setFormData] = useState({
    id: "",
    sku: "",
    title: "",
    description: "",
    price: 1199,
    compare_at_price: 2199,
    category: "fan-version" as ProductCategory,
    image_url: "",
    galleryInput: "",
    stock_status: "in_stock" as StockStatus,
    stock_quantity: 20,
    team: "",
    league: "",
    season: "2024/25",
    badge: "",
    is_featured: false,
    version_type: "Fan Version" as "Fan Version" | "Player Version",
    sizes: ["S", "M", "L", "XL", "XXL"] as ("S" | "M" | "L" | "XL" | "XXL")[],
  });

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Check saved passkey in localStorage safely
  useEffect(() => {
    const timer = setTimeout(() => {
      const saved = localStorage.getItem("kitadda_admin_auth");
      if (saved === "true") {
        setIsAuthenticated(true);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default passkey kitadda2026 (or kitadda)
    if (passkeyInput === "kitadda2026" || passkeyInput === "kitadda" || passkeyInput === "admin") {
      setIsAuthenticated(true);
      localStorage.setItem("kitadda_admin_auth", "true");
      setAuthError("");
      showToast("Store Manager Unlocked");
    } else {
      setAuthError("Invalid Admin Passkey. Default is: kitadda2026");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("kitadda_admin_auth");
    showToast("Logged out of Admin Portal");
  };

  // Fetch all data on manual click
  const fetchData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [prodRes, orderRes, statRes] = await Promise.all([
        fetch("/api/admin/products"),
        fetch("/api/admin/orders"),
        fetch("/api/admin/stats"),
      ]);

      const prodData = await prodRes.json();
      const orderData = await orderRes.json();
      const statData = await statRes.json();

      if (prodData.success) setProducts(prodData.products);
      if (orderData.success) setOrders(orderData.orders);
      if (statData.success) setStats(statData.stats);
    } catch (err) {
      console.error("Failed to load admin data:", err);
      showToast("Error loading data from backend", "error");
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Synchronize data on authentication
  useEffect(() => {
    if (!isAuthenticated) return;
    let isCancelled = false;

    const loadInitialData = async () => {
      try {
        const [prodRes, orderRes, statRes] = await Promise.all([
          fetch("/api/admin/products"),
          fetch("/api/admin/orders"),
          fetch("/api/admin/stats"),
        ]);

        const prodData = await prodRes.json();
        const orderData = await orderRes.json();
        const statData = await statRes.json();

        if (!isCancelled) {
          if (prodData.success) setProducts(prodData.products);
          if (orderData.success) setOrders(orderData.orders);
          if (statData.success) setStats(statData.stats);
        }
      } catch (err) {
        console.error("Initial admin data load error:", err);
      }
    };

    loadInitialData();

    return () => {
      isCancelled = true;
    };
  }, [isAuthenticated]);

  // Open Add Product Modal
  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      id: "",
      sku: `KA-${Date.now().toString().slice(-6)}`,
      title: "",
      description: "",
      price: 1199,
      compare_at_price: 2199,
      category: "fan-version",
      image_url: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=800&q=80",
      galleryInput: "",
      stock_status: "in_stock",
      stock_quantity: 20,
      team: "",
      league: "Club",
      season: "2024/25",
      badge: "NEW DROP",
      is_featured: false,
      version_type: "Fan Version",
      sizes: ["S", "M", "L", "XL", "XXL"],
    });
    setIsProductModalOpen(true);
  };

  // Open Edit Product Modal
  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      id: p.id,
      sku: p.sku || `KA-${p.id.slice(0, 6)}`,
      title: p.title,
      description: p.description || "",
      price: p.price,
      compare_at_price: p.compare_at_price || p.price,
      category: p.category,
      image_url: p.image_url,
      galleryInput: p.gallery ? p.gallery.join(", ") : "",
      stock_status: p.stock_status,
      stock_quantity: p.stock_quantity ?? 10,
      team: p.team || "",
      league: p.league || "",
      season: p.season || "2024/25",
      badge: p.badge || "",
      is_featured: Boolean(p.is_featured),
      version_type: p.version_type || "Fan Version",
      sizes: p.sizes || ["S", "M", "L", "XL", "XXL"],
    });
    setIsProductModalOpen(true);
  };

  // Submit Product Create or Update
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const gallery = formData.galleryInput
        ? formData.galleryInput.split(",").map((s) => s.trim()).filter(Boolean)
        : [formData.image_url];

      const payload = {
        ...formData,
        gallery,
      };

      if (editingProduct) {
        // PUT update
        const res = await fetch(`/api/admin/products/${editingProduct.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          showToast(`Product "${formData.title}" updated successfully!`);
          setIsProductModalOpen(false);
          fetchData();
        } else {
          showToast(data.error || "Update failed", "error");
        }
      } else {
        // POST create
        const res = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          showToast(`Product "${formData.title}" added to inventory!`);
          setIsProductModalOpen(false);
          fetchData();
        } else {
          showToast(data.error || "Creation failed", "error");
        }
      }
    } catch (err) {
      console.error("Submit error:", err);
      showToast("Error saving product", "error");
    }
  };

  // Delete product
  const handleDeleteProduct = async (p: Product) => {
    if (!confirm(`Are you sure you want to delete "${p.title}" from store inventory?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/products/${p.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Product "${p.title}" deleted.`);
        fetchData();
      } else {
        showToast(data.error || "Failed to delete product", "error");
      }
    } catch {
      showToast("Error deleting product", "error");
    }
  };

  // Quick stock adjuster (+1 or -1 or custom delta)
  const handleStockDelta = async (productId: string, delta: number) => {
    try {
      const res = await fetch("/api/admin/inventory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: productId,
          quantity_delta: delta,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? data.product : p))
        );
        fetchData();
      }
    } catch {
      showToast("Stock adjustment error", "error");
    }
  };

  // Direct status toggle (In Stock <-> Out of Stock)
  const handleToggleStockStatus = async (productId: string, newStatus: StockStatus) => {
    try {
      const res = await fetch("/api/admin/inventory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: productId,
          stock_status: newStatus,
          stock_quantity: newStatus === "out_of_stock" ? 0 : 15,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Stock status updated to ${newStatus}`);
        fetchData();
      }
    } catch {
      showToast("Failed to toggle stock status", "error");
    }
  };

  // Update order status
  const handleOrderStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Order #${orderId} marked as ${newStatus}`);
        fetchData();
      }
    } catch {
      showToast("Failed to update order status", "error");
    }
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !productSearch ||
      p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.team.toLowerCase().includes(productSearch.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(productSearch.toLowerCase()));

    const matchesCategory =
      productCategoryFilter === "all" || p.category === productCategoryFilter;

    const matchesStock =
      productStockFilter === "all" || p.stock_status === productStockFilter;

    return matchesSearch && matchesCategory && matchesStock;
  });

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    const matchesStatus =
      orderStatusFilter === "all" || o.status === orderStatusFilter;

    const matchesSearch =
      orderSearch === "all" ||
      !orderSearch ||
      o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.shipping_address?.fullName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.shipping_address?.phone.includes(orderSearch);

    return matchesStatus && matchesSearch;
  });

  // --- UNLOCK SCREEN IF NOT AUTHENTICATED ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0A0D14] flex items-center justify-center p-4 text-white">
        <div className="w-full max-w-md bg-[#0E131F] border border-[#1C2438] p-8 space-y-6">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="relative w-16 h-16 rounded-full overflow-hidden border border-[#C5A059]/40 shrink-0">
              <Image
                src="/logo.jpg"
                alt="Kit Adda"
                fill
                sizes="64px"
                className="object-cover object-center"
              />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight font-jersey">
                KIT<span className="text-[#C5A059]">ADDA</span> STORE MANAGER
              </h1>
              <p className="text-xs text-neutral-400 mt-1">
                Enter your administrative passkey to access inventory &amp; WooCommerce-style backend.
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                Admin Passkey
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={passkeyInput}
                  onChange={(e) => setPasskeyInput(e.target.value)}
                  placeholder="Enter passkey (default: kitadda2026)"
                  className="w-full bg-[#0A0D14] border border-[#1C2438] px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-[#C5A059]"
                  autoFocus
                />
                <Lock className="w-4 h-4 text-neutral-500 absolute right-3.5 top-3.5" />
              </div>
              {authError && (
                <p className="text-xs text-red-400 mt-1.5 font-medium">{authError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-[#C5A059] hover:bg-[#DFB76C] text-[#0A0D14] font-black uppercase tracking-wider text-xs py-3.5 transition"
            >
              Unlock Store Manager
            </button>
          </form>

          <div className="pt-4 border-t border-[#1C2438] text-center text-xs text-neutral-500">
            <span>Hint: Default passkey is </span>
            <code className="text-[#DFB76C] font-mono bg-[#0A0D14] px-1.5 py-0.5 border border-[#1C2438]">
              kitadda2026
            </code>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN ADMIN INTERFACE ---
  return (
    <div className="min-h-screen bg-[#07090E] text-neutral-100 flex flex-col font-sans selection:bg-[#C5A059] selection:text-[#0A0D14]">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 border text-xs font-bold uppercase tracking-wider shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5 ${
            toastMessage.type === "error"
              ? "bg-red-950/90 text-red-200 border-red-800"
              : "bg-[#0E1A33] text-[#DFB76C] border-[#C5A059]/40"
          }`}
        >
          {toastMessage.type === "error" ? (
            <AlertTriangle className="w-4 h-4 text-red-400" />
          ) : (
            <CheckCircle className="w-4 h-4 text-[#C5A059]" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Admin Navbar */}
      <header className="sticky top-0 z-40 bg-[#0A0D14] border-b border-[#1C2438] px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5 group" title="Return to Storefront">
            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#C5A059]/40 group-hover:border-[#C5A059] shrink-0 transition">
              <Image src="/logo.jpg" alt="Kit Adda" fill sizes="32px" className="object-cover" />
            </div>
            <div>
              <div className="text-lg font-black tracking-tight uppercase text-white font-jersey leading-none">
                KIT<span className="text-[#C5A059]">ADDA</span>
              </div>
              <div className="text-[9px] uppercase tracking-widest text-[#DFB76C] font-semibold">
                Store Manager • Hostinger Ready
              </div>
            </div>
          </Link>

          <span className="hidden md:inline-block w-px h-6 bg-[#1C2438]" />

          <div className="hidden md:flex items-center gap-2 text-xs text-neutral-400">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Working Backend Active</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={isRefreshing}
            className="p-2 bg-[#0E131F] hover:bg-[#162035] border border-[#1C2438] text-neutral-300 hover:text-white transition"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-[#DFB76C]" : ""}`} />
          </button>

          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0B132B] hover:bg-[#162035] border border-[#1C2438] text-xs font-bold uppercase tracking-wider text-neutral-200 hover:text-[#DFB76C] transition"
          >
            <span>View Store</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleLogout}
            className="p-2 bg-[#0E131F] hover:bg-red-950/40 border border-[#1C2438] hover:border-red-800 text-neutral-400 hover:text-red-300 transition"
            title="Lock Admin"
          >
            <Unlock className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-60 bg-[#0A0D14] border-r border-[#1C2438] p-3 sm:p-4 shrink-0 flex md:flex-col justify-between overflow-x-auto">
          <div className="flex md:flex-col gap-1 w-full">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold uppercase tracking-wider transition text-left whitespace-nowrap ${
                activeTab === "dashboard"
                  ? "bg-[#C5A059] text-[#0A0D14] font-black"
                  : "text-neutral-400 hover:text-white hover:bg-[#0E131F]"
              }`}
            >
              <TrendingUp className="w-4 h-4 shrink-0" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab("products")}
              className={`flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold uppercase tracking-wider transition text-left whitespace-nowrap ${
                activeTab === "products"
                  ? "bg-[#C5A059] text-[#0A0D14] font-black"
                  : "text-neutral-400 hover:text-white hover:bg-[#0E131F]"
              }`}
            >
              <Package className="w-4 h-4 shrink-0" />
              <span>Products ({products.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("inventory")}
              className={`flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold uppercase tracking-wider transition text-left whitespace-nowrap ${
                activeTab === "inventory"
                  ? "bg-[#C5A059] text-[#0A0D14] font-black"
                  : "text-neutral-400 hover:text-white hover:bg-[#0E131F]"
              }`}
            >
              <Layers className="w-4 h-4 shrink-0" />
              <span>Stock Central</span>
              {stats.lowStockCount > 0 && (
                <span className="ml-auto bg-amber-500/20 text-amber-300 text-[10px] px-1.5 py-0.2 border border-amber-500/40">
                  {stats.lowStockCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("orders")}
              className={`flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold uppercase tracking-wider transition text-left whitespace-nowrap ${
                activeTab === "orders"
                  ? "bg-[#C5A059] text-[#0A0D14] font-black"
                  : "text-neutral-400 hover:text-white hover:bg-[#0E131F]"
              }`}
            >
              <ShoppingBag className="w-4 h-4 shrink-0" />
              <span>Orders ({orders.length})</span>
              {stats.processingOrdersCount > 0 && (
                <span className="ml-auto bg-[#DFB76C] text-[#0A0D14] text-[10px] px-1.5 py-0.2 font-black">
                  {stats.processingOrdersCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("hostinger")}
              className={`flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold uppercase tracking-wider transition text-left whitespace-nowrap ${
                activeTab === "hostinger"
                  ? "bg-[#C5A059] text-[#0A0D14] font-black"
                  : "text-neutral-400 hover:text-white hover:bg-[#0E131F]"
              }`}
            >
              <Server className="w-4 h-4 shrink-0" />
              <span>Hostinger Setup</span>
            </button>
          </div>

          <div className="hidden md:block pt-4 border-t border-[#1C2438] text-[11px] text-neutral-500">
            <div>Storage: Local JSON + Supabase</div>
            <div className="mt-1 text-neutral-600">v0.1.0 • WooCommerce Engine</div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          {/* ===================== TAB 1: DASHBOARD ===================== */}
          {activeTab === "dashboard" && (
            <div className="space-y-8 animate-in fade-in duration-200">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black uppercase text-white font-jersey tracking-tight">
                    Store Performance &amp; Inventory Overview
                  </h1>
                  <p className="text-xs text-neutral-400 mt-1">
                    Real-time status of your store catalog, revenue, and inventory alerts.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={openAddModal}
                    className="inline-flex items-center gap-2 bg-[#C5A059] hover:bg-[#DFB76C] text-[#0A0D14] px-4 py-2 text-xs font-black uppercase tracking-wider transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Kit</span>
                  </button>
                </div>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 bg-[#0E131F] border border-[#1C2438]">
                  <div className="flex items-center justify-between text-neutral-400 text-xs font-bold uppercase tracking-wider">
                    <span>Total Sales</span>
                    <DollarSign className="w-4 h-4 text-[#DFB76C]" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white mt-2 font-jersey">
                    ₹{stats.totalRevenue.toLocaleString("en-IN")}
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-1">
                    Razorpay + Confirmed COD
                  </div>
                </div>

                <div className="p-5 bg-[#0E131F] border border-[#1C2438]">
                  <div className="flex items-center justify-between text-neutral-400 text-xs font-bold uppercase tracking-wider">
                    <span>Total Orders</span>
                    <ShoppingBag className="w-4 h-4 text-[#DFB76C]" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white mt-2 font-jersey">
                    {stats.totalOrders}
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-1">
                    {stats.processingOrdersCount} awaiting dispatch
                  </div>
                </div>

                <div className="p-5 bg-[#0E131F] border border-[#1C2438]">
                  <div className="flex items-center justify-between text-neutral-400 text-xs font-bold uppercase tracking-wider">
                    <span>Catalog Products</span>
                    <Package className="w-4 h-4 text-[#DFB76C]" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white mt-2 font-jersey">
                    {stats.totalProducts}
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-1">
                    Active on Storefront
                  </div>
                </div>

                <div className="p-5 bg-[#0E131F] border border-[#1C2438]">
                  <div className="flex items-center justify-between text-neutral-400 text-xs font-bold uppercase tracking-wider">
                    <span>Inventory Warnings</span>
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-2 font-jersey">
                    {stats.lowStockCount + stats.outOfStockCount}
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-1">
                    {stats.lowStockCount} low stock • {stats.outOfStockCount} out of stock
                  </div>
                </div>
              </div>

              {/* Quick Actions & Recent Orders Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Orders */}
                <div className="lg:col-span-2 bg-[#0E131F] border border-[#1C2438] p-5">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1C2438]">
                    <h2 className="text-sm font-black uppercase text-white font-jersey tracking-wider">
                      Recent Customer Orders
                    </h2>
                    <button
                      onClick={() => setActiveTab("orders")}
                      className="text-xs font-bold text-[#DFB76C] hover:underline flex items-center gap-1"
                    >
                      <span>View All</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {orders.length === 0 ? (
                    <div className="py-8 text-center text-xs text-neutral-500">
                      No orders placed yet. Orders made on the storefront will appear here.
                    </div>
                  ) : (
                    <div className="divide-y divide-[#1C2438] overflow-x-auto">
                      {orders.slice(0, 5).map((order) => (
                        <div key={order.id} className="py-3 flex items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">#{order.id}</span>
                              <span
                                className={`text-[10px] font-bold uppercase px-2 py-0.5 border ${
                                  order.status === "delivered"
                                    ? "bg-emerald-950/60 text-emerald-400 border-emerald-800"
                                    : order.status === "shipped"
                                    ? "bg-blue-950/60 text-blue-300 border-blue-800"
                                    : order.status === "processing"
                                    ? "bg-amber-950/60 text-amber-300 border-amber-800"
                                    : "bg-red-950/60 text-red-400 border-red-800"
                                }`}
                              >
                                {order.status}
                              </span>
                            </div>
                            <div className="text-xs text-neutral-400 mt-0.5">
                              {order.shipping_address?.fullName} ({order.shipping_address?.phone})
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-bold text-[#DFB76C] font-jersey">
                              ₹{order.total_amount}
                            </div>
                            <div className="text-[10px] text-neutral-500 uppercase">
                              {order.payment_method || "Online"}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Stock Alerts Widget */}
                <div className="bg-[#0E131F] border border-[#1C2438] p-5">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1C2438]">
                    <h2 className="text-sm font-black uppercase text-white font-jersey tracking-wider">
                      Stock Restock Alerts
                    </h2>
                    <button
                      onClick={() => setActiveTab("inventory")}
                      className="text-xs font-bold text-[#DFB76C] hover:underline"
                    >
                      Manage
                    </button>
                  </div>

                  {products.filter((p) => p.stock_status !== "in_stock" || (p.stock_quantity ?? 0) <= 5).length === 0 ? (
                    <div className="py-8 text-center text-xs text-emerald-400 flex flex-col items-center gap-2">
                      <CheckCircle className="w-6 h-6" />
                      <span>All products have healthy inventory!</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {products
                        .filter((p) => p.stock_status !== "in_stock" || (p.stock_quantity ?? 0) <= 5)
                        .slice(0, 4)
                        .map((p) => (
                          <div
                            key={p.id}
                            className="flex items-center justify-between p-2.5 bg-[#0A0D14] border border-[#1C2438]"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="relative w-10 h-10 shrink-0 bg-[#0E131F]">
                                <Image src={p.image_url} alt={p.title} fill className="object-cover" />
                              </div>
                              <div>
                                <div className="text-xs font-bold text-white line-clamp-1">
                                  {p.title}
                                </div>
                                <div className="text-[10px] text-neutral-400">
                                  SKU: {p.sku || p.id}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <span
                                className={`text-[10px] font-bold uppercase px-2 py-0.5 border ${
                                  p.stock_status === "out_of_stock"
                                    ? "bg-red-950/60 text-red-400 border-red-800"
                                    : "bg-amber-950/60 text-amber-300 border-amber-800"
                                }`}
                              >
                                {p.stock_quantity ?? 0} units
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ===================== TAB 2: PRODUCTS ===================== */}
          {activeTab === "products" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black uppercase text-white font-jersey tracking-tight">
                    Product Catalog ({filteredProducts.length})
                  </h1>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Create, edit, and organize football jerseys and accessories for your store.
                  </p>
                </div>
                <button
                  onClick={openAddModal}
                  className="inline-flex items-center gap-2 bg-[#C5A059] hover:bg-[#DFB76C] text-[#0A0D14] px-4 py-2 text-xs font-black uppercase tracking-wider transition self-start"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Product</span>
                </button>
              </div>

              {/* Filters & Search Toolbar (WooCommerce Style) */}
              <div className="p-3 bg-[#0E131F] border border-[#1C2438] flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search by kit title, team, or SKU..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full bg-[#0A0D14] border border-[#1C2438] pl-9 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div className="flex gap-2">
                  <select
                    value={productCategoryFilter}
                    onChange={(e) => setProductCategoryFilter(e.target.value)}
                    className="bg-[#0A0D14] border border-[#1C2438] px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-[#C5A059]"
                  >
                    <option value="all">All Categories</option>
                    <option value="player-version">Player Version</option>
                    <option value="fan-version">Fan Version</option>
                    <option value="world-cup">World Cup</option>
                    <option value="accessories">Grip Socks</option>
                    <option value="club">Club</option>
                    <option value="retro">Retro Vault</option>
                    <option value="jackets">Jackets</option>
                  </select>

                  <select
                    value={productStockFilter}
                    onChange={(e) => setProductStockFilter(e.target.value)}
                    className="bg-[#0A0D14] border border-[#1C2438] px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-[#C5A059]"
                  >
                    <option value="all">All Stock Statuses</option>
                    <option value="in_stock">In Stock</option>
                    <option value="low_stock">Low Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>
              </div>

              {/* WooCommerce Products Table */}
              <div className="bg-[#0E131F] border border-[#1C2438] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0A0D14] border-b border-[#1C2438] text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                      <tr>
                        <th className="py-3 px-4 w-14">Image</th>
                        <th className="py-3 px-4">Name &amp; SKU</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Price</th>
                        <th className="py-3 px-4">Stock Status</th>
                        <th className="py-3 px-4 text-center">Qty</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1C2438]">
                      {filteredProducts.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-neutral-500">
                            No products match your search or filter.
                          </td>
                        </tr>
                      ) : (
                        filteredProducts.map((p) => (
                          <tr key={p.id} className="hover:bg-[#12192B]/50 transition">
                            <td className="py-3 px-4">
                              <div className="relative w-12 h-14 bg-[#0A0D14] border border-[#1C2438] overflow-hidden">
                                <Image
                                  src={p.image_url}
                                  alt={p.title}
                                  fill
                                  sizes="48px"
                                  className="object-cover"
                                />
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-bold text-white hover:text-[#DFB76C] transition">
                                {p.title}
                              </div>
                              <div className="text-[10px] text-neutral-500 mt-0.5">
                                SKU: <span className="font-mono text-neutral-400">{p.sku || p.id}</span> • {p.team}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="uppercase text-[10px] text-neutral-300 bg-[#0A0D14] px-2 py-0.5 border border-[#1C2438]">
                                {CATEGORY_LABELS[p.category] || p.category}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-jersey text-sm text-[#DFB76C]">
                              ₹{p.price}
                              {p.compare_at_price > p.price && (
                                <span className="line-through text-neutral-500 text-xs ml-1.5 font-sans">
                                  ₹{p.compare_at_price}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`text-[10px] font-bold uppercase px-2 py-0.5 border ${
                                  p.stock_status === "in_stock"
                                    ? "bg-emerald-950/60 text-emerald-400 border-emerald-800"
                                    : p.stock_status === "low_stock"
                                    ? "bg-amber-950/60 text-amber-300 border-amber-800"
                                    : "bg-red-950/60 text-red-400 border-red-800"
                                }`}
                              >
                                {p.stock_status.replace(/_/g, " ")}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center font-mono font-bold text-neutral-200">
                              {p.stock_quantity ?? 0}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <Link
                                  href={`/products/${p.id}`}
                                  target="_blank"
                                  className="p-1.5 text-neutral-400 hover:text-white hover:bg-[#162035] transition"
                                  title="View on store"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </Link>
                                <button
                                  onClick={() => openEditModal(p)}
                                  className="p-1.5 text-neutral-400 hover:text-[#DFB76C] hover:bg-[#162035] transition"
                                  title="Edit Product"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p)}
                                  className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-red-950/30 transition"
                                  title="Delete Product"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===================== TAB 3: INVENTORY (STOCK CENTRAL) ===================== */}
          {activeTab === "inventory" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black uppercase text-white font-jersey tracking-tight">
                    Stock Central &amp; Inventory Manager
                  </h1>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Quickly increment, decrement, and update stock counts across all SKUs without opening individual forms.
                  </p>
                </div>
              </div>

              {/* Inventory Table with Quick Buttons */}
              <div className="bg-[#0E131F] border border-[#1C2438] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0A0D14] border-b border-[#1C2438] text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                      <tr>
                        <th className="py-3 px-4">Product</th>
                        <th className="py-3 px-4">SKU</th>
                        <th className="py-3 px-4">Stock Status</th>
                        <th className="py-3 px-4 text-center">Current Quantity</th>
                        <th className="py-3 px-4 text-center">Quick Adjust</th>
                        <th className="py-3 px-4 text-right">Status Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1C2438]">
                      {products.map((p) => (
                        <tr key={p.id} className="hover:bg-[#12192B]/50 transition">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="relative w-9 h-11 bg-[#0A0D14] border border-[#1C2438] overflow-hidden shrink-0">
                                <Image src={p.image_url} alt={p.title} fill className="object-cover" />
                              </div>
                              <div>
                                <div className="font-bold text-white line-clamp-1">{p.title}</div>
                                <div className="text-[10px] text-neutral-400">{CATEGORY_LABELS[p.category]}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono text-neutral-300">
                            {p.sku || p.id}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`text-[10px] font-bold uppercase px-2 py-0.5 border ${
                                p.stock_status === "in_stock"
                                  ? "bg-emerald-950/60 text-emerald-400 border-emerald-800"
                                  : p.stock_status === "low_stock"
                                  ? "bg-amber-950/60 text-amber-300 border-amber-800"
                                  : "bg-red-950/60 text-red-400 border-red-800"
                              }`}
                            >
                              {p.stock_status.replace(/_/g, " ")}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center font-mono text-base font-bold text-white">
                            {p.stock_quantity ?? 0}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="inline-flex items-center gap-1 border border-[#1C2438] bg-[#0A0D14] p-0.5">
                              <button
                                onClick={() => handleStockDelta(p.id, -5)}
                                className="px-2 py-1 text-xs text-neutral-400 hover:text-white hover:bg-[#162035] transition"
                                title="Reduce 5 units"
                              >
                                -5
                              </button>
                              <button
                                onClick={() => handleStockDelta(p.id, -1)}
                                className="px-2 py-1 text-xs text-neutral-400 hover:text-white hover:bg-[#162035] transition font-bold"
                                title="Reduce 1 unit"
                              >
                                -1
                              </button>
                              <span className="w-px h-4 bg-[#1C2438]" />
                              <button
                                onClick={() => handleStockDelta(p.id, 1)}
                                className="px-2 py-1 text-xs text-neutral-400 hover:text-white hover:bg-[#162035] transition font-bold"
                                title="Add 1 unit"
                              >
                                +1
                              </button>
                              <button
                                onClick={() => handleStockDelta(p.id, 5)}
                                className="px-2 py-1 text-xs text-neutral-400 hover:text-white hover:bg-[#162035] transition"
                                title="Add 5 units"
                              >
                                +5
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {p.stock_status === "out_of_stock" ? (
                              <button
                                onClick={() => handleToggleStockStatus(p.id, "in_stock")}
                                className="text-[10px] font-bold uppercase px-2.5 py-1 bg-emerald-950/40 text-emerald-300 border border-emerald-800 hover:bg-emerald-900/60 transition"
                              >
                                Mark In Stock (+15)
                              </button>
                            ) : (
                              <button
                                onClick={() => handleToggleStockStatus(p.id, "out_of_stock")}
                                className="text-[10px] font-bold uppercase px-2.5 py-1 bg-red-950/40 text-red-300 border border-red-800 hover:bg-red-900/60 transition"
                              >
                                Mark Out of Stock
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===================== TAB 4: ORDERS ===================== */}
          {activeTab === "orders" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black uppercase text-white font-jersey tracking-tight">
                    Customer Orders ({filteredOrders.length})
                  </h1>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Manage incoming orders, update fulfillment statuses, and view printing details.
                  </p>
                </div>
              </div>

              {/* Status Tabs */}
              <div className="flex items-center gap-2 border-b border-[#1C2438] pb-3 overflow-x-auto scrollbar-none">
                {(["all", "processing", "shipped", "delivered", "cancelled"] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderStatusFilter(st)}
                    className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                      orderStatusFilter === st
                        ? "bg-[#C5A059] text-[#0A0D14] font-black"
                        : "bg-[#0E131F] text-neutral-400 hover:text-white border border-[#1C2438]"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Order Search Toolbar */}
              <div className="p-3 bg-[#0E131F] border border-[#1C2438]">
                <div className="relative">
                  <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search orders by customer name, phone, or order ID..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full bg-[#0A0D14] border border-[#1C2438] pl-9 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              {/* Orders Table */}
              <div className="bg-[#0E131F] border border-[#1C2438] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0A0D14] border-b border-[#1C2438] text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                      <tr>
                        <th className="py-3 px-4">Order ID</th>
                        <th className="py-3 px-4">Customer</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Total Amount</th>
                        <th className="py-3 px-4">Payment</th>
                        <th className="py-3 px-4">Fulfillment Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1C2438]">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-neutral-500">
                            No orders found in this view.
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((o) => (
                          <tr key={o.id} className="hover:bg-[#12192B]/50 transition">
                            <td className="py-3 px-4 font-mono font-bold text-white">
                              #{o.id}
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-bold text-white">{o.shipping_address?.fullName}</div>
                              <div className="text-[10px] text-neutral-400">{o.shipping_address?.phone}</div>
                            </td>
                            <td className="py-3 px-4 text-neutral-400 text-[11px]">
                              {new Date(o.created_at).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </td>
                            <td className="py-3 px-4 font-jersey text-sm text-[#DFB76C]">
                              ₹{o.total_amount}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`text-[10px] font-bold uppercase px-2 py-0.5 border ${
                                  o.payment_status === "paid"
                                    ? "bg-emerald-950/60 text-emerald-400 border-emerald-800"
                                    : "bg-amber-950/60 text-amber-300 border-amber-800"
                                }`}
                              >
                                {o.payment_method === "cod" ? "COD" : o.payment_status}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <select
                                value={o.status}
                                onChange={(e) => handleOrderStatusUpdate(o.id, e.target.value as OrderStatus)}
                                className="bg-[#0A0D14] border border-[#1C2438] px-2.5 py-1 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                              >
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => setSelectedOrderDetails(o)}
                                  className="px-2.5 py-1 bg-[#0A0D14] border border-[#1C2438] text-[10px] font-bold uppercase text-[#DFB76C] hover:bg-[#162035] transition"
                                >
                                  Details
                                </button>
                                {o.shipping_address?.phone && (
                                  <a
                                    href={`https://wa.me/91${o.shipping_address.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                                      `Hi ${o.shipping_address.fullName}, this is Kit Adda regarding your order #${o.id}. We are preparing your football kits!`
                                    )}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1 text-emerald-400 hover:text-emerald-300"
                                    title="WhatsApp Customer"
                                  >
                                    <MessageCircle className="w-4 h-4" />
                                  </a>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===================== TAB 5: HOSTINGER SETUP ===================== */}
          {activeTab === "hostinger" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h1 className="text-2xl font-black uppercase text-white font-jersey tracking-tight">
                  Hostinger Production Deployment Guide
                </h1>
                <p className="text-xs text-neutral-400 mt-0.5">
                  How this Next.js e-commerce backend runs natively on Hostinger VPS, Cloud Hosting, or Docker.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#0E131F] border border-[#1C2438] p-6 space-y-4">
                  <div className="flex items-center gap-2.5 text-[#DFB76C]">
                    <Server className="w-5 h-5" />
                    <h2 className="text-base font-black uppercase font-jersey">
                      Hostinger VPS / Node.js Setup
                    </h2>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    This project is built with Next.js App Router and runs as a high-performance standalone Node.js server.
                  </p>
                  <div className="space-y-3 text-xs">
                    <div className="bg-[#0A0D14] p-3 border border-[#1C2438]">
                      <div className="text-neutral-400 font-bold mb-1">Step 1: Install Dependencies</div>
                      <code className="text-[#DFB76C] font-mono">npm install</code>
                    </div>
                    <div className="bg-[#0A0D14] p-3 border border-[#1C2438]">
                      <div className="text-neutral-400 font-bold mb-1">Step 2: Build Application</div>
                      <code className="text-[#DFB76C] font-mono">npm run build</code>
                    </div>
                    <div className="bg-[#0A0D14] p-3 border border-[#1C2438]">
                      <div className="text-neutral-400 font-bold mb-1">Step 3: Run with PM2 Daemon</div>
                      <code className="text-[#DFB76C] font-mono">pm2 start npm --name &quot;kitadda&quot; -- start</code>
                    </div>
                  </div>
                </div>

                <div className="bg-[#0E131F] border border-[#1C2438] p-6 space-y-4">
                  <div className="flex items-center gap-2.5 text-[#DFB76C]">
                    <Layers className="w-5 h-5" />
                    <h2 className="text-base font-black uppercase font-jersey">
                      Database &amp; Inventory Persistence
                    </h2>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    The backend uses an active dual-engine storage model:
                  </p>
                  <ul className="space-y-2 text-xs text-neutral-300 list-disc list-inside">
                    <li>
                      <strong className="text-white">Local JSON Storage:</strong> Persists in <code className="text-[#DFB76C] font-mono">data/products.json</code> and <code className="text-[#DFB76C] font-mono">data/orders.json</code> on Hostinger server disk. Zero setup needed!
                    </li>
                    <li>
                      <strong className="text-white">Supabase PostgreSQL:</strong> If you add <code className="text-[#DFB76C] font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="text-[#DFB76C] font-mono">SUPABASE_SERVICE_ROLE_KEY</code> in Hostinger environment variables, it automatically dual-syncs!
                    </li>
                    <li>
                      <strong className="text-white">Razorpay Payments:</strong> Enter your Razorpay Live Key ID &amp; Secret in Hostinger&apos;s environment settings.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ===================== ADD / EDIT PRODUCT MODAL ===================== */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#0A0D14] border border-[#1C2438] text-white my-8 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#1C2438] bg-[#0E131F] flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-black uppercase font-jersey tracking-wider">
                  {editingProduct ? `Edit Kit: ${editingProduct.title}` : "Add New Kit to Store"}
                </h3>
                <p className="text-xs text-neutral-400">
                  Configure inventory levels, pricing, category, and images.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleProductSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Real Madrid 2024/25 Home Kit"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-[#0E131F] border border-[#1C2438] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1">
                    SKU (Stock Keeping Unit)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. KA-RM-001"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full bg-[#0E131F] border border-[#1C2438] px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Master Grade authentic details, fabric specs, crest embroidery..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-[#0E131F] border border-[#1C2438] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              {/* Pricing & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full bg-[#0E131F] border border-[#1C2438] px-3 py-2 text-xs text-white font-jersey text-sm focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1">
                    Compare Price (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.compare_at_price}
                    onChange={(e) => setFormData({ ...formData, compare_at_price: Number(e.target.value) })}
                    className="w-full bg-[#0E131F] border border-[#1C2438] px-3 py-2 text-xs text-white font-jersey text-sm focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ProductCategory })}
                    className="w-full bg-[#0E131F] border border-[#1C2438] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                  >
                    <option value="fan-version">Fan Version</option>
                    <option value="player-version">Player Version</option>
                    <option value="world-cup">World Cup</option>
                    <option value="accessories">Grip Socks &amp; Accessories</option>
                    <option value="club">Club Jerseys</option>
                    <option value="retro">Retro Vault</option>
                    <option value="jackets">Jackets &amp; Merch</option>
                  </select>
                </div>
              </div>

              {/* Inventory Management Section (WooCommerce Style) */}
              <div className="p-4 bg-[#0E131F] border border-[#1C2438] space-y-3">
                <div className="text-xs font-bold uppercase text-[#DFB76C] tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Inventory Control</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1">
                      Stock Quantity (Units)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formData.stock_quantity}
                      onChange={(e) => setFormData({ ...formData, stock_quantity: Number(e.target.value) })}
                      className="w-full bg-[#0A0D14] border border-[#1C2438] px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1">
                      Stock Status
                    </label>
                    <select
                      value={formData.stock_status}
                      onChange={(e) => setFormData({ ...formData, stock_status: e.target.value as StockStatus })}
                      className="w-full bg-[#0A0D14] border border-[#1C2438] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                    >
                      <option value="in_stock">In Stock</option>
                      <option value="low_stock">Low Stock (Show Warning Pill)</option>
                      <option value="out_of_stock">Out of Stock</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Attributes (Team, Version, Badge) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1">
                    Team Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Arsenal, Real Madrid"
                    value={formData.team}
                    onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                    className="w-full bg-[#0E131F] border border-[#1C2438] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1">
                    Version Spec
                  </label>
                  <select
                    value={formData.version_type}
                    onChange={(e) => setFormData({ ...formData, version_type: e.target.value as "Fan Version" | "Player Version" })}
                    className="w-full bg-[#0E131F] border border-[#1C2438] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                  >
                    <option value="Fan Version">Fan Version</option>
                    <option value="Player Version">Player Version</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1">
                    Badge Tag
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BESTSELLER, PLAYER GRADE"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    className="w-full bg-[#0E131F] border border-[#1C2438] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              {/* Images */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1">
                  Main Image URL *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full bg-[#0E131F] border border-[#1C2438] px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1">
                  Additional Gallery Image URLs (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="https://..., https://..."
                  value={formData.galleryInput}
                  onChange={(e) => setFormData({ ...formData, galleryInput: e.target.value })}
                  className="w-full bg-[#0E131F] border border-[#1C2438] px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              {/* Footer CTA */}
              <div className="pt-4 border-t border-[#1C2438] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 border border-[#1C2438] text-xs font-bold uppercase text-neutral-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#C5A059] hover:bg-[#DFB76C] text-[#0A0D14] text-xs font-black uppercase tracking-wider transition"
                >
                  {editingProduct ? "Save Changes" : "Publish Kit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== ORDER DETAILS MODAL ===================== */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-lg bg-[#0A0D14] border border-[#1C2438] text-white p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1C2438]">
              <div>
                <h3 className="text-base font-black uppercase font-jersey">
                  Order Details #{selectedOrderDetails.id}
                </h3>
                <div className="text-xs text-neutral-400">
                  Placed on {new Date(selectedOrderDetails.created_at).toLocaleString("en-IN")}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderDetails(null)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Shipping Info */}
            <div className="bg-[#0E131F] p-3.5 border border-[#1C2438] text-xs space-y-1">
              <div className="font-bold text-[#DFB76C] uppercase text-[10px] tracking-wider mb-1">
                Customer &amp; Dispatch Address
              </div>
              <div className="font-bold text-white">{selectedOrderDetails.shipping_address?.fullName}</div>
              <div className="text-neutral-300">{selectedOrderDetails.shipping_address?.phone}</div>
              <div className="text-neutral-400">
                {selectedOrderDetails.shipping_address?.addressLine}, {selectedOrderDetails.shipping_address?.city}, {selectedOrderDetails.shipping_address?.state} - {selectedOrderDetails.shipping_address?.pincode}
              </div>
            </div>

            {/* Items */}
            <div className="space-y-2">
              <div className="font-bold uppercase text-[10px] text-neutral-400 tracking-wider">
                Items In Order
              </div>
              {selectedOrderDetails.items && selectedOrderDetails.items.length > 0 ? (
                <div className="divide-y divide-[#1C2438] bg-[#0E131F] border border-[#1C2438] p-3 text-xs">
                  {selectedOrderDetails.items.map((it, i) => (
                    <div key={i} className="py-2 first:pt-0 last:pb-0 flex items-start justify-between">
                      <div>
                        <div className="font-bold text-white">{it.product?.title || "Jersey"}</div>
                        <div className="text-[10px] text-neutral-400">
                          Size: {it.size} • {it.version} • Qty: {it.quantity}
                        </div>
                        {it.custom_name && (
                          <div className="text-[10px] text-[#DFB76C]">
                            Print: {it.custom_name} #{it.custom_number}
                          </div>
                        )}
                        {it.patches && (
                          <div className="text-[10px] text-blue-400">
                            + Official UCL Badges
                          </div>
                        )}
                      </div>
                      <div className="text-right font-jersey text-sm text-[#DFB76C]">
                        ₹{it.unit_price * it.quantity}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-neutral-500 italic">No item breakdown available.</div>
              )}
            </div>

            <div className="pt-3 border-t border-[#1C2438] flex items-center justify-between">
              <div className="text-xs text-neutral-400">
                Payment: <strong className="text-white uppercase">{selectedOrderDetails.payment_method || "Online"}</strong> ({selectedOrderDetails.payment_status})
              </div>
              <div className="text-base font-black text-white font-jersey">
                Total: ₹{selectedOrderDetails.total_amount}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
