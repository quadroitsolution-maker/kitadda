"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Coupon, CouponDiscountType } from "@/types";
import {
  Tag,
  Plus,
  Trash2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Percent,
  DollarSign,
  Truck,
  Copy,
  X,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

interface CouponManagerProps {
  onShowToast: (text: string, type?: "success" | "error") => void;
}

export const CouponManager: React.FC<CouponManagerProps> = ({ onShowToast }) => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    code: "",
    discount_type: "percentage" as CouponDiscountType,
    discount_value: 10,
    min_order_amount: 0,
    max_discount_amount: "",
    is_active: true,
    description: "",
  });

  const fetchCoupons = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/coupons");
      const data = await res.json();
      if (data.success && Array.isArray(data.coupons)) {
        setCoupons(data.coupons);
      }
    } catch (err) {
      console.error("Failed to fetch coupons:", err);
      onShowToast("Failed to load coupon list", "error");
    } finally {
      setLoading(false);
    }
  }, [onShowToast]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    onShowToast(`Coupon code ${code} copied to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleToggleActive = async (coupon: Coupon) => {
    try {
      const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !coupon.is_active }),
      });

      const data = await res.json();
      if (data.success) {
        setCoupons((prev) =>
          prev.map((c) => (c.id === coupon.id ? { ...c, is_active: !c.is_active } : c))
        );
        onShowToast(`Coupon ${coupon.code} ${!coupon.is_active ? "activated" : "deactivated"}`);
      } else {
        onShowToast(data.error || "Failed to update coupon status", "error");
      }
    } catch {
      onShowToast("Network error updating coupon status", "error");
    }
  };

  const handleDelete = async (coupon: Coupon) => {
    if (!confirm(`Are you sure you want to permanently delete coupon "${coupon.code}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (data.success) {
        setCoupons((prev) => prev.filter((c) => c.id !== coupon.id));
        onShowToast(`Coupon ${coupon.code} deleted successfully`);
      } else {
        onShowToast(data.error || "Failed to delete coupon", "error");
      }
    } catch {
      onShowToast("Network error deleting coupon", "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = formData.code.trim().toUpperCase();

    if (!cleanCode) {
      onShowToast("Please enter a coupon code", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        code: cleanCode,
        discount_type: formData.discount_type,
        discount_value: formData.discount_type === "free_shipping" ? 0 : Number(formData.discount_value),
        min_order_amount: Number(formData.min_order_amount) || 0,
        max_discount_amount: formData.max_discount_amount ? Number(formData.max_discount_amount) : undefined,
        is_active: formData.is_active,
        description: formData.description.trim() || undefined,
      };

      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success && data.coupon) {
        onShowToast(`Coupon "${cleanCode}" created successfully!`);
        setIsModalOpen(false);
        setFormData({
          code: "",
          discount_type: "percentage",
          discount_value: 10,
          min_order_amount: 0,
          max_discount_amount: "",
          is_active: true,
          description: "",
        });
        fetchCoupons();
      } else {
        onShowToast(data.error || "Failed to create coupon", "error");
      }
    } catch {
      onShowToast("Network error saving coupon", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const [isSqlModalOpen, setIsSqlModalOpen] = useState<boolean>(false);

  const SUPABASE_SQL_SNIPPET = `-- =========================================================
-- KIT ADDA SUPABASE POSTGRESQL SCHEMA: COUPONS
-- =========================================================
CREATE TABLE IF NOT EXISTS public.coupons (
    id TEXT PRIMARY KEY DEFAULT ('coup-' || substr(md5(random()::text), 1, 10)),
    code TEXT NOT NULL UNIQUE,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed', 'free_shipping')),
    discount_value NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (discount_value >= 0),
    min_order_amount NUMERIC(10, 2) DEFAULT 0 CHECK (min_order_amount >= 0),
    max_discount_amount NUMERIC(10, 2) CHECK (max_discount_amount IS NULL OR max_discount_amount > 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    description TEXT,
    usage_count INTEGER NOT NULL DEFAULT 0 CHECK (usage_count >= 0),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON public.coupons(is_active);

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active coupons" ON public.coupons;
CREATE POLICY "Public can view active coupons" ON public.coupons FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage coupons" ON public.coupons;
CREATE POLICY "Admins can manage coupons" ON public.coupons FOR ALL USING (true);

-- SEED DEFAULT COUPONS
INSERT INTO public.coupons (id, code, discount_type, discount_value, min_order_amount, max_discount_amount, is_active, description, usage_count)
VALUES
    ('coup-1', 'ADDA10', 'percentage', 10.00, 0.00, 500.00, TRUE, '10% off across all kits in store', 24),
    ('coup-2', 'KIT100', 'fixed', 100.00, 999.00, NULL, TRUE, 'Flat ₹100 instant discount on orders above ₹999', 18),
    ('coup-3', 'FREESHIP', 'free_shipping', 0.00, 0.00, NULL, TRUE, 'Free express shipping on your entire cart', 31),
    ('coup-4', 'WELCOME50', 'fixed', 50.00, 499.00, NULL, TRUE, 'Flat ₹50 off on your first jersey order', 42)
ON CONFLICT (code) DO UPDATE SET
    discount_type = EXCLUDED.discount_type,
    discount_value = EXCLUDED.discount_value,
    is_active = EXCLUDED.is_active;`;

  // Stats calculation
  const totalCoupons = coupons.length;
  const activeCoupons = coupons.filter((c) => c.is_active).length;
  const totalUsage = coupons.reduce((sum, c) => sum + (c.usage_count || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase text-white font-jersey tracking-tight">
            Coupons &amp; Promo Codes Hub
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Configure instant cart discounts, percentage off, and free express shipping codes with Supabase sync.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsSqlModalOpen(true)}
            className="inline-flex items-center gap-1.5 bg-[#0E131F] hover:bg-[#162035] border border-[#1C2438] hover:border-[#DFB76C]/60 text-xs font-bold uppercase tracking-wider text-neutral-200 hover:text-[#DFB76C] px-3 py-2.5 transition active:scale-95"
            title="View Supabase SQL Schema"
          >
            <Copy className="w-3.5 h-3.5 text-[#DFB76C]" />
            <span>Supabase SQL</span>
          </button>

          <button
            type="button"
            onClick={fetchCoupons}
            disabled={loading}
            className="p-2.5 bg-[#0E131F] hover:bg-[#162035] border border-[#1C2438] text-neutral-300 hover:text-white transition"
            title="Refresh Coupons"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#DFB76C]" : ""}`} />
          </button>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 bg-[#C5A059] hover:bg-[#DFB76C] text-[#0A0D14] px-4 py-2.5 text-xs font-black uppercase tracking-wider transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Coupon</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0E131F] border border-[#1C2438] p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase text-neutral-400 tracking-wider">
              Total Coupons
            </div>
            <div className="text-2xl font-black text-white font-jersey mt-1">
              {totalCoupons}
            </div>
          </div>
          <div className="w-10 h-10 bg-[#0B132B] border border-[#1C2438] flex items-center justify-center text-[#DFB76C]">
            <Tag className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#0E131F] border border-[#1C2438] p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase text-neutral-400 tracking-wider">
              Active Codes
            </div>
            <div className="text-2xl font-black text-emerald-400 font-jersey mt-1">
              {activeCoupons}
            </div>
          </div>
          <div className="w-10 h-10 bg-emerald-950/40 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#0E131F] border border-[#1C2438] p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase text-neutral-400 tracking-wider">
              Total Redemptions
            </div>
            <div className="text-2xl font-black text-[#DFB76C] font-jersey mt-1">
              {totalUsage}
            </div>
          </div>
          <div className="w-10 h-10 bg-[#0B132B] border border-[#1C2438] flex items-center justify-center text-[#DFB76C]">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-[#0A0D14] border border-[#1C2438] overflow-hidden">
        <div className="p-4 border-b border-[#1C2438] bg-[#0E131F] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#DFB76C]" />
            <h2 className="text-sm font-black uppercase text-white font-jersey">
              Active Store Coupons ({coupons.length})
            </h2>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-neutral-400 space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#DFB76C]" />
            <p className="text-xs uppercase font-mono">Loading Coupons...</p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="p-12 text-center text-neutral-400 space-y-3">
            <Tag className="w-10 h-10 mx-auto text-neutral-600" />
            <p className="text-sm font-bold text-white">No coupons created yet</p>
            <p className="text-xs text-neutral-500">
              Create your first promotional code to run store discounts and offers.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0E131F] border-b border-[#1C2438] text-[10px] font-black uppercase text-neutral-400 tracking-wider">
                <tr>
                  <th className="p-3 sm:p-4">Coupon Code</th>
                  <th className="p-3 sm:p-4">Benefit</th>
                  <th className="p-3 sm:p-4">Min. Spend</th>
                  <th className="p-3 sm:p-4">Redemptions</th>
                  <th className="p-3 sm:p-4">Status</th>
                  <th className="p-3 sm:p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1C2438]">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-[#0E131F]/50 transition">
                    <td className="p-3 sm:p-4 font-medium">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-[#DFB76C] bg-[#0B132B] px-2.5 py-1 border border-[#C5A059]/40 tracking-wider">
                          {c.code}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(c.code)}
                          className="p-1 text-neutral-500 hover:text-white transition"
                          title="Copy Code"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {c.description && (
                        <p className="text-[11px] text-neutral-400 mt-1 max-w-xs line-clamp-1">
                          {c.description}
                        </p>
                      )}
                    </td>

                    <td className="p-3 sm:p-4 font-semibold">
                      {c.discount_type === "percentage" && (
                        <div className="flex items-center gap-1 text-white">
                          <Percent className="w-3.5 h-3.5 text-[#DFB76C]" />
                          <span>{c.discount_value}% OFF</span>
                          {c.max_discount_amount && (
                            <span className="text-[10px] text-neutral-400 ml-1">
                              (Max ₹{c.max_discount_amount})
                            </span>
                          )}
                        </div>
                      )}
                      {c.discount_type === "fixed" && (
                        <div className="flex items-center gap-1 text-white">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Flat ₹{c.discount_value} OFF</span>
                        </div>
                      )}
                      {c.discount_type === "free_shipping" && (
                        <div className="flex items-center gap-1 text-[#DFB76C]">
                          <Truck className="w-3.5 h-3.5" />
                          <span>FREE Express Shipping</span>
                        </div>
                      )}
                    </td>

                    <td className="p-3 sm:p-4 text-neutral-300 font-mono">
                      {c.min_order_amount && c.min_order_amount > 0 ? (
                        <span>₹{c.min_order_amount}</span>
                      ) : (
                        <span className="text-neutral-500">No Minimum</span>
                      )}
                    </td>

                    <td className="p-3 sm:p-4 text-neutral-300 font-mono">
                      <span className="font-bold text-white">{c.usage_count || 0}</span> orders
                    </td>

                    <td className="p-3 sm:p-4">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(c)}
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-black uppercase border transition ${
                          c.is_active
                            ? "bg-emerald-950/60 text-emerald-400 border-emerald-800 hover:bg-emerald-900/60"
                            : "bg-red-950/60 text-red-400 border-red-800 hover:bg-red-900/60"
                        }`}
                      >
                        {c.is_active ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" />
                            <span>Disabled</span>
                          </>
                        )}
                      </button>
                    </td>

                    <td className="p-3 sm:p-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(c)}
                        className="p-1.5 text-neutral-500 hover:text-red-400 transition"
                        title="Delete Coupon"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Coupon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-md bg-[#0A0D14] border border-[#1C2438] text-white my-8 max-h-[90vh] flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#1C2438] bg-[#0E131F] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#DFB76C]" />
                <h3 className="text-base font-black uppercase font-jersey tracking-wider">
                  Create New Promo Code
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MATCHDAY15, ADDA200"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/\s+/g, "") })
                  }
                  className="w-full bg-[#0E131F] border border-[#1C2438] px-3 py-2 text-sm text-white font-mono uppercase focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1">
                  Discount Type *
                </label>
                <select
                  value={formData.discount_type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discount_type: e.target.value as CouponDiscountType,
                    })
                  }
                  className="w-full bg-[#0E131F] border border-[#1C2438] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                >
                  <option value="percentage">Percentage Discount (% Off)</option>
                  <option value="fixed">Fixed Amount Discount (₹ Flat Off)</option>
                  <option value="free_shipping">Free Express Shipping</option>
                </select>
              </div>

              {formData.discount_type !== "free_shipping" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1">
                      {formData.discount_type === "percentage" ? "Percentage (% Off) *" : "Discount Amount (₹) *"}
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={formData.discount_type === "percentage" ? 100 : 10000}
                      value={formData.discount_value}
                      onChange={(e) =>
                        setFormData({ ...formData, discount_value: Number(e.target.value) })
                      }
                      className="w-full bg-[#0E131F] border border-[#1C2438] px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>

                  {formData.discount_type === "percentage" && (
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1">
                        Max Discount Cap (₹)
                      </label>
                      <input
                        type="number"
                        min={0}
                        placeholder="e.g. 500 (Optional)"
                        value={formData.max_discount_amount}
                        onChange={(e) =>
                          setFormData({ ...formData, max_discount_amount: e.target.value })
                        }
                        className="w-full bg-[#0E131F] border border-[#1C2438] px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#C5A059]"
                      />
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1">
                  Minimum Order Spend (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  placeholder="0 (No Minimum)"
                  value={formData.min_order_amount}
                  onChange={(e) =>
                    setFormData({ ...formData, min_order_amount: Number(e.target.value) })
                  }
                  className="w-full bg-[#0E131F] border border-[#1C2438] px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1">
                  Description / Customer Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. 15% off on orders above ₹999"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-[#0E131F] border border-[#1C2438] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="coupon_active_check"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="accent-[#C5A059] w-4 h-4 cursor-pointer"
                />
                <label
                  htmlFor="coupon_active_check"
                  className="text-xs font-semibold text-neutral-300 cursor-pointer"
                >
                  Activate coupon immediately upon creation
                </label>
              </div>

              {/* Submit CTA */}
              <div className="pt-4 border-t border-[#1C2438] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[#1C2438] text-xs font-bold uppercase text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#C5A059] hover:bg-[#DFB76C] disabled:opacity-50 text-[#0A0D14] px-5 py-2 text-xs font-black uppercase tracking-wider transition"
                >
                  {isSubmitting ? "Creating..." : "Save Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Supabase SQL Schema Modal */}
      {isSqlModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-[#0A0D14] border border-[#1C2438] text-white my-8 max-h-[90vh] flex flex-col shadow-2xl">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-[#1C2438] bg-[#0E131F] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Copy className="w-5 h-5 text-[#DFB76C]" />
                <div>
                  <h3 className="text-base font-black uppercase font-jersey tracking-wider">
                    Supabase PostgreSQL Schema: Coupons
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Run this SQL script in your Supabase SQL Editor to initialize or reset the coupons table.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSqlModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Code Body */}
            <div className="p-5 space-y-4 overflow-y-auto">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-300 font-mono">
                  PostgreSQL 15+ • RLS Policies Included
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(SUPABASE_SQL_SNIPPET);
                    onShowToast("Supabase SQL copied to clipboard!");
                  }}
                  className="inline-flex items-center gap-1.5 bg-[#C5A059] hover:bg-[#DFB76C] text-[#0A0D14] px-3 py-1.5 text-xs font-black uppercase transition active:scale-95"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy SQL Code</span>
                </button>
              </div>

              <pre className="bg-[#05070B] border border-[#1C2438] p-4 text-[11px] font-mono text-[#DFB76C] overflow-x-auto rounded-none max-h-96 leading-relaxed selection:bg-[#C5A059] selection:text-[#0A0D14]">
                {SUPABASE_SQL_SNIPPET}
              </pre>

              <div className="p-3 bg-[#0B132B] border border-[#C5A059]/40 text-xs text-neutral-300 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Open directly in your Supabase Dashboard:</span>
                </div>
                <a
                  href="https://supabase.com/dashboard/project/olysnirvgrnshffneilv/sql/new"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-[#DFB76C] hover:underline uppercase shrink-0"
                >
                  Open SQL Editor &rarr;
                </a>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#1C2438] bg-[#0E131F] flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsSqlModalOpen(false)}
                className="px-4 py-2 bg-[#0A0D14] hover:bg-[#162035] border border-[#1C2438] text-xs font-bold uppercase text-neutral-300 hover:text-white"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
