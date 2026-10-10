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
  Eye,
  X,
  MessageCircle,
  DollarSign,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  MapPin,
  CreditCard,
  Phone,
  User,
  Calendar,
  Sliders,
  Tag,
  Key,
} from "lucide-react";
import { ProductImageUploadSection } from "@/components/admin/ProductImageUploadSection";
import { SliderManager } from "@/components/admin/SliderManager";
import { CouponManager } from "@/components/admin/CouponManager";
import { StoreSettings } from "@/components/admin/StoreSettings";

type AdminTab = "dashboard" | "products" | "inventory" | "orders" | "sliders" | "coupons" | "settings" | "hostinger";

const CATEGORY_LABELS: Record<ProductCategory, string> = {
  "player-version": "Player Version (Current Season)",
  "fan-version": "Fan Version (Current Season)",
  "accessories": "Accessories (Grip Socks)",
  "world-cup": "World Cup",
  "club": "Club Jerseys",
  "retro": "Retro Vault",
  "international": "International",
  "jackets": "Jackets & Streetwear",
};

export default function AdminDashboardPage() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [adminEmail, setAdminEmail] = useState<string>("");
  const [adminPassword, setAdminPassword] = useState<string>("");
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>("");
  const [currentAdmin, setCurrentAdmin] = useState<{ email: string; id: string } | null>(null);

  // Tab navigation
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");

  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    processingOrdersCount: 0, // Pending
    shippedOrdersCount: 0,
    deliveredOrdersCount: 0,  // Fulfilled
    cancelledOrdersCount: 0,
    totalProducts: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
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

  // Check server-side admin session on mount
  useEffect(() => {
    let isCancelled = false;
    fetch("/api/admin/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (!isCancelled && data.authenticated && data.user) {
          setIsAuthenticated(true);
          setCurrentAdmin(data.user);
        }
      })
      .catch((err) => console.debug("Auth check failed:", err));

    return () => {
      isCancelled = true;
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail || !adminPassword) {
      setAuthError("Please provide both email and password.");
      return;
    }

    setIsLoggingIn(true);
    setAuthError("");

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: adminEmail, password: adminPassword }),
      });

      const data = await res.json();

      if (data.success && data.user) {
        setIsAuthenticated(true);
        setCurrentAdmin(data.user);
        showToast("Admin Authenticated Successfully");
      } else {
        setAuthError(data.error || "Authentication failed. Invalid email or password.");
      }
    } catch {
      setAuthError("Failed to connect to authentication service.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } catch {
      // Ignore
    }
    setIsAuthenticated(false);
    setCurrentAdmin(null);
    showToast("Logged out of Admin Portal");
  };

  // Fetch all data
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
      if (orderData.success) {
        setOrders(orderData.orders);
        // If modal is open, update selectedOrderDetails reference
        if (selectedOrderDetails) {
          const updatedSelected = orderData.orders.find((o: OrderRecord) => o.id === selectedOrderDetails.id);
          if (updatedSelected) setSelectedOrderDetails(updatedSelected);
        }
      }
      if (statData.success) setStats(statData.stats);
    } catch (err) {
      console.error("Failed to load admin data:", err);
      showToast("Error loading data from backend", "error");
    } finally {
      setIsRefreshing(false);
    }
  }, [selectedOrderDetails]);

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
      image_url: "",
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
    if (!formData.image_url) {
      showToast("Please upload or provide a main image for the product.", "error");
      return;
    }
    try {
      const gallery = formData.galleryInput
        ? formData.galleryInput.split(",").map((s) => s.trim()).filter(Boolean)
        : [formData.image_url];

      const payload = {
        ...formData,
        gallery,
      };

      if (editingProduct) {
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
        setProducts((prev) => prev.filter((item) => item.id !== p.id));
        fetchData();
      } else {
        showToast(data.error || "Failed to delete product", "error");
      }
    } catch {
      showToast("Error deleting product", "error");
    }
  };

  // Quick stock adjuster
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

  // Direct status toggle
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

  // Update order status (Processing / Shipped / Delivered / Cancelled)
  const handleOrderStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Order #${orderId} marked as ${newStatus.toUpperCase()}`);
        if (selectedOrderDetails && selectedOrderDetails.id === orderId) {
          setSelectedOrderDetails({ ...selectedOrderDetails, status: newStatus });
        }
        fetchData();
      } else {
        showToast(data.error || "Failed to update order status", "error");
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
      o.shipping_address?.fullName?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.shipping_address?.phone?.includes(orderSearch) ||
      o.shipping_address?.city?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.shipping_address?.pincode?.includes(orderSearch) ||
      (o.razorpay_order_id && o.razorpay_order_id.toLowerCase().includes(orderSearch.toLowerCase())) ||
      (o.razorpay_payment_id && o.razorpay_payment_id.toLowerCase().includes(orderSearch.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  // Helper for status badge styling
  const renderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "delivered":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 bg-emerald-950/60 text-emerald-300 border border-emerald-800">
            <CheckCircle2 className="w-3 h-3" />
            <span>Fulfilled</span>
          </span>
        );
      case "shipped":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 bg-blue-950/60 text-blue-300 border border-blue-800">
            <Truck className="w-3 h-3" />
            <span>Shipped</span>
          </span>
        );
      case "processing":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 bg-amber-950/60 text-amber-300 border border-amber-800">
            <Clock className="w-3 h-3" />
            <span>Pending</span>
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 bg-red-950/60 text-red-400 border border-red-800">
            <XCircle className="w-3 h-3" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return null;
    }
  };

  // --- UNLOCK SCREEN IF NOT AUTHENTICATED ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0A0D14] flex items-center justify-center p-4 text-white">
        <div className="w-full max-w-md bg-[#0E131F] border border-[#1C2438] p-8 space-y-6 shadow-2xl">
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
                Enter your administrative passkey to access orders, stock central &amp; catalog.
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@kitadda.in"
                  className="w-full bg-[#0A0D14] border border-[#1C2438] px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-[#C5A059]"
                  autoFocus
                />
                <User className="w-4 h-4 text-neutral-500 absolute right-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full bg-[#0A0D14] border border-[#1C2438] px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-[#C5A059]"
                />
                <Lock className="w-4 h-4 text-neutral-500 absolute right-3.5 top-3.5" />
              </div>
              {authError && (
                <div className="p-2.5 bg-red-950/40 border border-red-800 text-xs text-red-300 mt-2 font-medium">
                  {authError}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-[#C5A059] hover:bg-[#DFB76C] disabled:opacity-50 text-[#0A0D14] font-black uppercase tracking-wider text-xs py-3.5 transition flex items-center justify-center gap-2"
            >
              {isLoggingIn ? (
                <div className="w-4 h-4 border-2 border-[#0A0D14] border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>Sign In to Admin Portal</span>
              )}
            </button>
          </form>
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
                Store Manager • Supabase &amp; Razorpay Connected
              </div>
            </div>
          </Link>

          <span className="hidden md:inline-block w-px h-6 bg-[#1C2438]" />

          <div className="hidden md:flex items-center gap-2 text-xs text-neutral-400">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Supabase Cloud Engine Active</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {currentAdmin && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-neutral-300 bg-[#0E131F] px-2.5 py-1.5 border border-[#1C2438]">
              <User className="w-3.5 h-3.5 text-[#DFB76C]" />
              <span className="font-mono text-[11px] text-[#DFB76C]">{currentAdmin.email}</span>
            </div>
          )}

          <button
            onClick={fetchData}
            disabled={isRefreshing}
            className="p-2 bg-[#0E131F] hover:bg-[#162035] border border-[#1C2438] text-neutral-300 hover:text-white transition"
            title="Refresh Orders & Stats"
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
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0E131F] hover:bg-red-950/40 border border-[#1C2438] hover:border-red-800 text-xs font-bold uppercase text-neutral-300 hover:text-red-300 transition"
            title="Sign Out"
          >
            <Unlock className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden sm:inline">Sign Out</span>
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
                <span className="ml-auto bg-amber-500 text-[#0A0D14] text-[10px] px-1.5 py-0.2 font-black rounded-none">
                  {stats.processingOrdersCount} PENDING
                </span>
              )}
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
                  {stats.lowStockCount} LOW
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("sliders")}
              className={`flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold uppercase tracking-wider transition text-left whitespace-nowrap ${
                activeTab === "sliders"
                  ? "bg-[#C5A059] text-[#0A0D14] font-black"
                  : "text-neutral-400 hover:text-white hover:bg-[#0E131F]"
              }`}
            >
              <Sliders className="w-4 h-4 shrink-0" />
              <span>Hero Sliders</span>
            </button>

            <button
              onClick={() => setActiveTab("coupons")}
              className={`flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold uppercase tracking-wider transition text-left whitespace-nowrap ${
                activeTab === "coupons"
                  ? "bg-[#C5A059] text-[#0A0D14] font-black"
                  : "text-neutral-400 hover:text-white hover:bg-[#0E131F]"
              }`}
            >
              <Tag className="w-4 h-4 shrink-0" />
              <span>Coupons &amp; Offers</span>
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold uppercase tracking-wider transition text-left whitespace-nowrap ${
                activeTab === "settings"
                  ? "bg-[#C5A059] text-[#0A0D14] font-black"
                  : "text-neutral-400 hover:text-white hover:bg-[#0E131F]"
              }`}
            >
              <Key className="w-4 h-4 shrink-0" />
              <span>Settings &amp; Keys</span>
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
              <span>Deployment</span>
            </button>
          </div>

          <div className="hidden md:block pt-4 border-t border-[#1C2438] text-[11px] text-neutral-500">
            <div>Database: Supabase PostgreSQL</div>
            <div className="mt-1 text-neutral-600">Razorpay Payment Ready</div>
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
                    Store Performance &amp; Orders Overview
                  </h1>
                  <p className="text-xs text-neutral-400 mt-1">
                    Real-time status of pending orders, fulfilled packages, revenue, and stock levels.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveTab("orders")}
                    className="inline-flex items-center gap-2 bg-[#0B132B] hover:bg-[#162035] border border-[#1C2438] text-white px-4 py-2 text-xs font-bold uppercase tracking-wider transition"
                  >
                    <ShoppingBag className="w-4 h-4 text-[#DFB76C]" />
                    <span>Manage Orders</span>
                  </button>
                  <button
                    onClick={openAddModal}
                    className="inline-flex items-center gap-2 bg-[#C5A059] hover:bg-[#DFB76C] text-[#0A0D14] px-4 py-2 text-xs font-black uppercase tracking-wider transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Kit</span>
                  </button>
                </div>
              </div>

              {/* KPI Cards (Pending, Fulfilled, Sales, Stock) */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Sales */}
                <div className="p-5 bg-[#0E131F] border border-[#1C2438]">
                  <div className="flex items-center justify-between text-neutral-400 text-xs font-bold uppercase tracking-wider">
                    <span>Total Revenue</span>
                    <DollarSign className="w-4 h-4 text-[#DFB76C]" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white mt-2 font-jersey">
                    ₹{stats.totalRevenue.toLocaleString("en-IN")}
                  </div>
                  <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-semibold">
                    <span>✓ 100% Prepaid via Razorpay</span>
                  </div>
                </div>

                {/* Pending Orders (Awaiting Fulfillment) */}
                <div className={`p-5 border transition ${
                  stats.processingOrdersCount > 0 
                    ? "bg-amber-950/20 border-amber-500/50" 
                    : "bg-[#0E131F] border-[#1C2438]"
                }`}>
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                    <span className={stats.processingOrdersCount > 0 ? "text-amber-300" : "text-neutral-400"}>
                      Pending Orders
                    </span>
                    <Clock className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-amber-300 mt-2 font-jersey">
                    {stats.processingOrdersCount}
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-1">
                    Awaiting kit printing &amp; dispatch
                  </div>
                </div>

                {/* Fulfilled / Delivered Orders */}
                <div className="p-5 bg-[#0E131F] border border-[#1C2438]">
                  <div className="flex items-center justify-between text-neutral-400 text-xs font-bold uppercase tracking-wider">
                    <span>Fulfilled Orders</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-2 font-jersey">
                    {stats.deliveredOrdersCount}
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-1">
                    {stats.shippedOrdersCount} currently in transit
                  </div>
                </div>

                {/* Low Stock Warnings */}
                <div className="p-5 bg-[#0E131F] border border-[#1C2438]">
                  <div className="flex items-center justify-between text-neutral-400 text-xs font-bold uppercase tracking-wider">
                    <span>Stock Alerts</span>
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-2 font-jersey">
                    {stats.lowStockCount + stats.outOfStockCount}
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-1">
                    {stats.lowStockCount} low • {stats.outOfStockCount} out of stock
                  </div>
                </div>
              </div>

              {/* Recent Orders Table with 1-Click Status Controls */}
              <div className="bg-[#0E131F] border border-[#1C2438] p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#1C2438]">
                  <div>
                    <h2 className="text-sm font-black uppercase text-white font-jersey tracking-wider">
                      Recent Customer Orders
                    </h2>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      View customer details, ordered kits, and update fulfillment in real-time.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("orders")}
                    className="text-xs font-bold text-[#DFB76C] hover:underline flex items-center gap-1 self-start"
                  >
                    <span>View All ({orders.length})</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>

                {orders.length === 0 ? (
                  <div className="py-12 text-center text-xs text-neutral-500">
                    No orders placed yet. Orders made via online prepaid checkout will appear here instantly.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#0A0D14] border-b border-[#1C2438] text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                        <tr>
                          <th className="py-3 px-3">Order ID</th>
                          <th className="py-3 px-3">Customer Details</th>
                          <th className="py-3 px-3">Items</th>
                          <th className="py-3 px-3">Amount</th>
                          <th className="py-3 px-3">Status</th>
                          <th className="py-3 px-3 text-right">Quick Fulfillment</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1C2438]">
                        {orders.slice(0, 6).map((order) => (
                          <tr key={order.id} className="hover:bg-[#12192B]/50 transition">
                            <td className="py-3 px-3 font-mono font-bold text-white whitespace-nowrap">
                              <div>#{order.id}</div>
                              <div className="text-[10px] text-neutral-500 font-sans mt-0.5">
                                {new Date(order.created_at).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            </td>

                            <td className="py-3 px-3">
                              <div className="font-bold text-white flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-[#DFB76C]" />
                                <span>{order.shipping_address?.fullName || "Guest Customer"}</span>
                              </div>
                              <div className="text-[10px] text-neutral-400 mt-0.5 flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                <span>{order.shipping_address?.phone}</span>
                                {order.shipping_address?.city && (
                                  <span>• {order.shipping_address.city}</span>
                                )}
                              </div>
                            </td>

                            <td className="py-3 px-3">
                              <div className="text-neutral-200 line-clamp-1 max-w-[220px]">
                                {order.items && order.items.length > 0
                                  ? order.items.map((it) => `${it.product?.title || "Kit"} (${it.size})`).join(", ")
                                  : "Football Kit"}
                              </div>
                              <div className="text-[10px] text-neutral-400">
                                {order.items?.length || 1} item(s)
                              </div>
                            </td>

                            <td className="py-3 px-3 font-jersey text-sm text-[#DFB76C] whitespace-nowrap">
                              <div>₹{order.total_amount}</div>
                              <div className="text-[10px] font-sans uppercase font-bold text-emerald-400">
                                Razorpay
                              </div>
                            </td>

                            <td className="py-3 px-3 whitespace-nowrap">
                              {renderStatusBadge(order.status)}
                            </td>

                            <td className="py-3 px-3 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                {order.status === "processing" && (
                                  <button
                                    onClick={() => handleOrderStatusUpdate(order.id, "shipped")}
                                    className="px-2 py-1 bg-blue-950/40 hover:bg-blue-900/60 border border-blue-800 text-[10px] font-bold uppercase text-blue-300 transition"
                                    title="Mark as Shipped"
                                  >
                                    Mark Shipped
                                  </button>
                                )}
                                {order.status === "shipped" && (
                                  <button
                                    onClick={() => handleOrderStatusUpdate(order.id, "delivered")}
                                    className="px-2 py-1 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800 text-[10px] font-bold uppercase text-emerald-300 transition"
                                    title="Mark as Delivered / Fulfilled"
                                  >
                                    Mark Fulfilled
                                  </button>
                                )}
                                <button
                                  onClick={() => setSelectedOrderDetails(order)}
                                  className="px-2 py-1 bg-[#0A0D14] border border-[#1C2438] text-[10px] font-bold uppercase text-[#DFB76C] hover:bg-[#162035] transition"
                                >
                                  Details
                                </button>
                                {order.shipping_address?.phone && (
                                  <a
                                    href={`https://wa.me/91${order.shipping_address.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                                      `Hi ${order.shipping_address.fullName}, this is Kit Adda regarding your order #${order.id}.`
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
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===================== TAB 2: ORDERS (FULL MANAGEMENT) ===================== */}
          {activeTab === "orders" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black uppercase text-white font-jersey tracking-tight">
                    Customer Orders &amp; Fulfillment ({filteredOrders.length})
                  </h1>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Filter by pending or fulfilled, view customer phone &amp; addresses, and track Razorpay payments.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-400">Total Orders: <strong>{orders.length}</strong></span>
                </div>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-2 border-b border-[#1C2438] pb-3 overflow-x-auto scrollbar-none">
                <button
                  onClick={() => setOrderStatusFilter("all")}
                  className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                    orderStatusFilter === "all"
                      ? "bg-[#C5A059] text-[#0A0D14] font-black"
                      : "bg-[#0E131F] text-neutral-400 hover:text-white border border-[#1C2438]"
                  }`}
                >
                  All ({orders.length})
                </button>

                <button
                  onClick={() => setOrderStatusFilter("processing")}
                  className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 ${
                    orderStatusFilter === "processing"
                      ? "bg-amber-400 text-[#0A0D14] font-black"
                      : "bg-[#0E131F] text-amber-300 hover:text-white border border-amber-900/60"
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Pending / Processing ({stats.processingOrdersCount})</span>
                </button>

                <button
                  onClick={() => setOrderStatusFilter("shipped")}
                  className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 ${
                    orderStatusFilter === "shipped"
                      ? "bg-blue-400 text-[#0A0D14] font-black"
                      : "bg-[#0E131F] text-blue-300 hover:text-white border border-blue-900/60"
                  }`}
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Shipped ({stats.shippedOrdersCount})</span>
                </button>

                <button
                  onClick={() => setOrderStatusFilter("delivered")}
                  className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 ${
                    orderStatusFilter === "delivered"
                      ? "bg-emerald-400 text-[#0A0D14] font-black"
                      : "bg-[#0E131F] text-emerald-300 hover:text-white border border-emerald-900/60"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Fulfilled / Delivered ({stats.deliveredOrdersCount})</span>
                </button>

                <button
                  onClick={() => setOrderStatusFilter("cancelled")}
                  className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 ${
                    orderStatusFilter === "cancelled"
                      ? "bg-red-400 text-[#0A0D14] font-black"
                      : "bg-[#0E131F] text-red-400 hover:text-white border border-red-900/60"
                  }`}
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Cancelled ({stats.cancelledOrdersCount})</span>
                </button>
              </div>

              {/* Order Search Toolbar */}
              <div className="p-3 bg-[#0E131F] border border-[#1C2438]">
                <div className="relative">
                  <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search by customer name, phone, city, pincode, or order ID..."
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
                        <th className="py-3 px-4">Order ID &amp; Date</th>
                        <th className="py-3 px-4">Customer Info</th>
                        <th className="py-3 px-4">Delivery Location</th>
                        <th className="py-3 px-4">Items Summary</th>
                        <th className="py-3 px-4">Amount &amp; Payment</th>
                        <th className="py-3 px-4">Fulfillment Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1C2438]">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-neutral-500">
                            No orders found matching your filter or search.
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((o) => (
                          <tr key={o.id} className="hover:bg-[#12192B]/50 transition">
                            <td className="py-3 px-4 font-mono font-bold text-white whitespace-nowrap">
                              <div>#{o.id}</div>
                              <div className="text-[10px] text-neutral-500 font-sans mt-0.5">
                                {new Date(o.created_at).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                              {o.razorpay_order_id && (
                                <div className="text-[9px] text-[#DFB76C] font-mono mt-0.5 truncate max-w-[120px]">
                                  {o.razorpay_order_id}
                                </div>
                              )}
                            </td>

                            <td className="py-3 px-4">
                              <div className="font-bold text-white flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-[#DFB76C]" />
                                <span>{o.shipping_address?.fullName || "Anonymous"}</span>
                              </div>
                              <div className="text-[10px] text-neutral-400 mt-0.5 flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                <span>{o.shipping_address?.phone}</span>
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              <div className="text-neutral-200 font-medium">
                                {o.shipping_address?.city}, {o.shipping_address?.state}
                              </div>
                              <div className="text-[10px] text-neutral-400 mt-0.5">
                                PIN: {o.shipping_address?.pincode}
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              <div className="text-neutral-200 line-clamp-1 max-w-[180px]">
                                {o.items && o.items.length > 0
                                  ? o.items.map((it) => it.product?.title || "Kit").join(", ")
                                  : "Football Kit"}
                              </div>
                              <div className="text-[10px] text-[#DFB76C]">
                                {o.items?.length || 1} kit(s) ordered
                              </div>
                            </td>

                            <td className="py-3 px-4 font-jersey text-sm text-[#DFB76C] whitespace-nowrap">
                              <div>₹{o.total_amount}</div>
                              <div className="mt-0.5">
                                <span className="text-[9px] font-sans font-bold uppercase px-1.5 py-0.2 border bg-emerald-950/60 text-emerald-400 border-emerald-800">
                                  Razorpay Paid
                                </span>
                              </div>
                            </td>

                            <td className="py-3 px-4 whitespace-nowrap">
                              <div className="space-y-1.5">
                                <select
                                  value={o.status}
                                  onChange={(e) => handleOrderStatusUpdate(o.id, e.target.value as OrderStatus)}
                                  className={`bg-[#0A0D14] border px-2 py-1 text-xs font-bold focus:outline-none ${
                                    o.status === "delivered"
                                      ? "text-emerald-400 border-emerald-800"
                                      : o.status === "shipped"
                                      ? "text-blue-300 border-blue-800"
                                      : o.status === "processing"
                                      ? "text-amber-300 border-amber-800"
                                      : "text-red-400 border-red-800"
                                  }`}
                                >
                                  <option value="processing">Pending / Processing</option>
                                  <option value="shipped">Shipped</option>
                                  <option value="delivered">Fulfilled / Delivered</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
                              </div>
                            </td>

                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                {o.status === "processing" && (
                                  <button
                                    onClick={() => handleOrderStatusUpdate(o.id, "shipped")}
                                    className="px-2 py-1 bg-blue-950/40 hover:bg-blue-900/60 border border-blue-800 text-[10px] font-bold uppercase text-blue-300 transition"
                                    title="Mark as Shipped"
                                  >
                                    Ship
                                  </button>
                                )}
                                {o.status === "shipped" && (
                                  <button
                                    onClick={() => handleOrderStatusUpdate(o.id, "delivered")}
                                    className="px-2 py-1 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800 text-[10px] font-bold uppercase text-emerald-300 transition"
                                    title="Mark as Delivered"
                                  >
                                    Fulfill
                                  </button>
                                )}
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

          {/* ===================== TAB 3: PRODUCTS ===================== */}
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

              {/* Filters & Search Toolbar */}
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
                    <option value="club">Club Jerseys</option>
                    <option value="retro">Retro Vault</option>
                    <option value="international">International</option>
                    <option value="jackets">Jackets</option>
                    <option value="accessories">Accessories</option>
                    <option value="world-cup">World Cup</option>
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

              {/* Products Table */}
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

          {/* ===================== TAB 4: INVENTORY (STOCK CENTRAL) ===================== */}
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

          {/* ===================== TAB 5: HOSTINGER & SUPABASE SETUP ===================== */}
          {activeTab === "hostinger" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h1 className="text-2xl font-black uppercase text-white font-jersey tracking-tight">
                  Hostinger &amp; Supabase Production Setup
                </h1>
                <p className="text-xs text-neutral-400 mt-0.5">
                  How this Next.js e-commerce app connects to Supabase Cloud PostgreSQL and Razorpay on Hostinger.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#0E131F] border border-[#1C2438] p-6 space-y-4">
                  <div className="flex items-center gap-2.5 text-[#DFB76C]">
                    <Server className="w-5 h-5" />
                    <h2 className="text-base font-black uppercase font-jersey">
                      Hostinger Node.js Server Setup
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
                      Database &amp; Payment Environment Variables
                    </h2>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Set these environment variables in your Hostinger panel or <code className="text-[#DFB76C] font-mono">.env.local</code>:
                  </p>
                  <ul className="space-y-2 text-xs text-neutral-300 list-disc list-inside">
                    <li>
                      <strong className="text-white">NEXT_PUBLIC_SUPABASE_URL:</strong> Your Supabase endpoint URL
                    </li>
                    <li>
                      <strong className="text-white">SUPABASE_SERVICE_ROLE_KEY:</strong> For full admin order management
                    </li>
                    <li>
                      <strong className="text-white">RAZORPAY_KEY_ID &amp; SECRET:</strong> For live payments
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* ===================== TAB 6: HERO SLIDERS & BANNERS ===================== */}
          {activeTab === "sliders" && (
            <SliderManager onShowToast={showToast} />
          )}

          {/* ===================== TAB 7: COUPONS & PROMO CODES ===================== */}
          {activeTab === "coupons" && (
            <CouponManager onShowToast={showToast} />
          )}

          {/* ===================== TAB 8: STORE SETTINGS & API KEYS ===================== */}
          {activeTab === "settings" && (
            <StoreSettings onShowToast={showToast} />
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
                    <option value="player-version">Player Version (Current Season)</option>
                    <option value="fan-version">Fan Version (Current Season)</option>
                    <option value="club">Club Jerseys</option>
                    <option value="retro">Retro Vault</option>
                    <option value="international">International</option>
                    <option value="jackets">Jackets</option>
                    <option value="accessories">Accessories - Grip Socks</option>
                    <option value="world-cup">World Cup</option>
                  </select>
                </div>
              </div>

              {/* Inventory Management */}
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

              {/* Image Upload and Gallery Section */}
              <ProductImageUploadSection
                mainImageUrl={formData.image_url}
                onMainImageChange={(url) => setFormData({ ...formData, image_url: url })}
                galleryUrlsString={formData.galleryInput}
                onGalleryUrlsChange={(urls) => setFormData({ ...formData, galleryInput: urls })}
              />

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

      {/* ===================== ENHANCED ORDER DETAILS MODAL ===================== */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-xl bg-[#0A0D14] border border-[#1C2438] text-white p-6 space-y-4 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#1C2438]">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black uppercase font-jersey text-white">
                    Order #{selectedOrderDetails.id}
                  </h3>
                  {renderStatusBadge(selectedOrderDetails.status)}
                </div>
                <div className="text-xs text-neutral-400 mt-0.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#DFB76C]" />
                  <span>Placed on {new Date(selectedOrderDetails.created_at).toLocaleString("en-IN")}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderDetails(null)}
                className="text-neutral-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Status Updater */}
            <div className="p-3 bg-[#0E131F] border border-[#1C2438] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs font-bold uppercase text-neutral-300">
                Update Fulfillment:
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {(["processing", "shipped", "delivered", "cancelled"] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => handleOrderStatusUpdate(selectedOrderDetails.id, st)}
                    className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition ${
                      selectedOrderDetails.status === st
                        ? "bg-[#C5A059] text-[#0A0D14] font-black"
                        : "bg-[#0A0D14] text-neutral-400 hover:text-white border border-[#1C2438]"
                    }`}
                  >
                    {st === "processing" ? "Pending" : st === "delivered" ? "Fulfilled" : st}
                  </button>
                ))}
              </div>
            </div>

            {/* Customer & Shipping Information */}
            <div className="bg-[#0E131F] p-4 border border-[#1C2438] text-xs space-y-2">
              <div className="font-bold text-[#DFB76C] uppercase text-[10px] tracking-wider flex items-center gap-1.5 mb-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>Customer Profile &amp; Delivery Address</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-neutral-400 text-[10px]">Customer Name:</div>
                  <div className="font-bold text-white text-sm">{selectedOrderDetails.shipping_address?.fullName || "N/A"}</div>
                </div>
                <div>
                  <div className="text-neutral-400 text-[10px]">Mobile / WhatsApp:</div>
                  <div className="font-bold text-emerald-400 font-mono text-sm flex items-center gap-2">
                    <span>+91 {selectedOrderDetails.shipping_address?.phone || "N/A"}</span>
                    {selectedOrderDetails.shipping_address?.phone && (
                      <a
                        href={`https://wa.me/91${selectedOrderDetails.shipping_address.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                          `Hi ${selectedOrderDetails.shipping_address.fullName}, this is Kit Adda regarding your order #${selectedOrderDetails.id}.`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-950/60 border border-emerald-700 text-[10px] text-emerald-300 uppercase"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>Chat</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-[#1C2438]">
                <div className="text-neutral-400 text-[10px]">Address:</div>
                <div className="text-neutral-200 mt-0.5">
                  {selectedOrderDetails.shipping_address?.addressLine}
                </div>
                <div className="text-neutral-300 font-medium">
                  {selectedOrderDetails.shipping_address?.city}, {selectedOrderDetails.shipping_address?.state} - <strong className="text-white font-mono">{selectedOrderDetails.shipping_address?.pincode}</strong>
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-[#0E131F] p-4 border border-[#1C2438] text-xs space-y-1.5">
              <div className="font-bold text-[#DFB76C] uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" />
                <span>Payment &amp; Gateway Details</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div>
                  <span className="text-neutral-400 text-[10px]">Method: </span>
                  <strong className="text-emerald-400 uppercase font-jersey text-sm">
                    Razorpay Online (Prepaid)
                  </strong>
                </div>
                <div>
                  <span className="text-neutral-400 text-[10px]">Status: </span>
                  <span
                    className={`text-[10px] font-bold uppercase px-1.5 py-0.2 border ${
                      selectedOrderDetails.payment_status === "paid"
                        ? "bg-emerald-950/60 text-emerald-400 border-emerald-800"
                        : "bg-amber-950/60 text-amber-300 border-amber-800"
                    }`}
                  >
                    {selectedOrderDetails.payment_status}
                  </span>
                </div>
              </div>
              {selectedOrderDetails.razorpay_order_id && (
                <div className="text-[10px] text-neutral-400 font-mono pt-1">
                  Razorpay Order ID: <span className="text-neutral-200">{selectedOrderDetails.razorpay_order_id}</span>
                </div>
              )}
              {selectedOrderDetails.razorpay_payment_id && (
                <div className="text-[10px] text-neutral-400 font-mono">
                  Payment ID: <span className="text-emerald-300">{selectedOrderDetails.razorpay_payment_id}</span>
                </div>
              )}
            </div>

            {/* Items Breakdown with Customization Info */}
            <div className="space-y-2">
              <div className="font-bold uppercase text-[10px] text-neutral-400 tracking-wider">
                Ordered Items ({selectedOrderDetails.items?.length || 0})
              </div>
              {selectedOrderDetails.items && selectedOrderDetails.items.length > 0 ? (
                <div className="divide-y divide-[#1C2438] bg-[#0E131F] border border-[#1C2438] p-3 text-xs max-h-48 overflow-y-auto">
                  {selectedOrderDetails.items.map((it, i) => (
                    <div key={i} className="py-2.5 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
                      <div>
                        <div className="font-bold text-white text-sm">{it.product?.title || "Jersey"}</div>
                        <div className="text-[11px] text-neutral-300 mt-0.5">
                          Size: <strong className="text-white">{it.size}</strong> • Edition: <strong className="text-white">{it.version}</strong> • Qty: <strong className="text-white">{it.quantity}</strong>
                        </div>
                        {it.custom_name && (
                          <div className="text-xs text-[#DFB76C] font-bold mt-1 bg-[#0A0D14] px-2 py-0.5 border border-[#1C2438] inline-block">
                            🔥 Print: {it.custom_name.toUpperCase()} #{it.custom_number}
                          </div>
                        )}
                        {it.patches && (
                          <div className="text-[10px] text-blue-400 font-semibold mt-0.5">
                            + Official Tournament Badges / Patches
                          </div>
                        )}
                      </div>
                      <div className="text-right font-jersey text-base text-[#DFB76C] whitespace-nowrap">
                        ₹{it.unit_price * it.quantity}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-neutral-500 italic p-3 bg-[#0E131F] border border-[#1C2438]">
                  No item breakdown stored for this order.
                </div>
              )}
            </div>

            {/* Total Footer */}
            <div className="pt-3 border-t border-[#1C2438] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedOrderDetails(null)}
                className="px-4 py-2 border border-[#1C2438] text-xs font-bold uppercase text-neutral-300 hover:text-white"
              >
                Close
              </button>
              <div className="text-right">
                <span className="text-xs text-neutral-400 mr-2">Grand Total:</span>
                <span className="text-xl font-black text-[#DFB76C] font-jersey">
                  ₹{selectedOrderDetails.total_amount}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
