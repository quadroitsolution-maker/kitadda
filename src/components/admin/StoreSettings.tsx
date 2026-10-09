"use client";

import React, { useState, useEffect } from "react";
import {
  Database,
  CreditCard,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Save,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Zap,
} from "lucide-react";

interface StoreSettingsProps {
  onShowToast: (text: string, type?: "success" | "error") => void;
}

export const StoreSettings: React.FC<StoreSettingsProps> = ({ onShowToast }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  // Form Fields
  const [supabaseUrl, setSupabaseUrl] = useState<string>("");
  const [supabaseAnonKey, setSupabaseAnonKey] = useState<string>("");
  const [supabaseServiceKey, setSupabaseServiceKey] = useState<string>("");

  const [razorpayKeyId, setRazorpayKeyId] = useState<string>("");
  const [razorpayKeySecret, setRazorpayKeySecret] = useState<string>("");

  const [whatsappNumber, setWhatsappNumber] = useState<string>("919315963809");
  const [adminEmail, setAdminEmail] = useState<string>("kitadda01@gmail.com");

  // Show/Hide Secret Toggles
  const [showAnonKey, setShowAnonKey] = useState<boolean>(false);
  const [showServiceKey, setShowServiceKey] = useState<boolean>(false);
  const [showRzpSecret, setShowRzpSecret] = useState<boolean>(false);

  // Live status feedback
  const [supabaseStatus, setSupabaseStatus] = useState<string>("");
  const [razorpayStatus, setRazorpayStatus] = useState<string>("");

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (data.success && data.settings) {
        setSupabaseUrl(data.settings.supabaseUrl || "");
        setSupabaseAnonKey(data.settings.supabaseAnonKey || "");
        setSupabaseServiceKey(data.settings.supabaseServiceKey || "");
        setRazorpayKeyId(data.settings.razorpayKeyId || "");
        setRazorpayKeySecret(data.settings.razorpayKeySecret || "");
        setWhatsappNumber(data.settings.whatsappNumber || "919315963809");
        setAdminEmail(data.settings.adminEmail || "kitadda01@gmail.com");
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
      onShowToast("Failed to load store credentials", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSupabaseStatus("");
    setRazorpayStatus("");

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supabaseUrl: supabaseUrl.trim(),
          supabaseAnonKey: supabaseAnonKey.trim(),
          supabaseServiceKey: supabaseServiceKey.trim(),
          razorpayKeyId: razorpayKeyId.trim(),
          razorpayKeySecret: razorpayKeySecret.trim(),
          whatsappNumber: whatsappNumber.trim(),
          adminEmail: adminEmail.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        onShowToast("Settings & API keys saved successfully!");
        if (data.supabaseStatus) setSupabaseStatus(data.supabaseStatus);
        if (data.razorpayStatus) setRazorpayStatus(data.razorpayStatus);
      } else {
        onShowToast(data.error || "Failed to save settings", "error");
      }
    } catch {
      onShowToast("Network error saving settings", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase text-white font-jersey tracking-tight">
            Store Credentials &amp; API Keys
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Configure live Supabase PostgreSQL database, Razorpay payment gateway, and store contact info.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchSettings}
          disabled={loading}
          className="p-2.5 bg-[#0E131F] hover:bg-[#162035] border border-[#1C2438] text-neutral-300 hover:text-white transition self-start sm:self-auto"
          title="Reload Settings"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#DFB76C]" : ""}`} />
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-neutral-400 space-y-2 bg-[#0E131F] border border-[#1C2438]">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#DFB76C]" />
          <p className="text-xs uppercase font-mono">Loading Environment Keys...</p>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* ================= SECTION 1: SUPABASE CONFIG ================= */}
          <div className="bg-[#0A0D14] border border-[#1C2438] overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-[#1C2438] bg-[#0E131F] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Database className="w-5 h-5 text-[#DFB76C]" />
                <div>
                  <h2 className="text-sm font-black uppercase text-white font-jersey tracking-wider">
                    Supabase Cloud Database (PostgreSQL)
                  </h2>
                  <p className="text-[11px] text-neutral-400">
                    Powers products catalog, inventory, orders, and promo codes storage.
                  </p>
                </div>
              </div>

              <a
                href="https://supabase.com/dashboard/project/olysnirvgrnshffneilv/settings/api"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#DFB76C] hover:underline font-bold uppercase tracking-wider"
              >
                <span>Supabase API Keys</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              {supabaseStatus && (
                <div
                  className={`p-3 border text-xs font-semibold flex items-center gap-2 ${
                    supabaseStatus.includes("connected_successfully")
                      ? "bg-emerald-950/40 border-emerald-800 text-emerald-300"
                      : "bg-amber-950/40 border-amber-800 text-amber-300"
                  }`}
                >
                  {supabaseStatus.includes("connected_successfully") ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  )}
                  <span>Status: {supabaseStatus}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Project URL (<code className="text-[#DFB76C] font-mono">NEXT_PUBLIC_SUPABASE_URL</code>)
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://your-project.supabase.co"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  className="w-full bg-[#0E131F] border border-[#1C2438] focus:border-[#C5A059] px-3.5 py-2.5 text-xs text-white font-mono placeholder-neutral-600 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                    Anon Public Key (<code className="text-[#DFB76C] font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAnonKey(!showAnonKey)}
                    className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1"
                  >
                    {showAnonKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showAnonKey ? "Hide" : "Reveal"}</span>
                  </button>
                </div>
                <input
                  type={showAnonKey ? "text" : "password"}
                  placeholder="eyJhbGciOi... or sb_publishable_..."
                  value={supabaseAnonKey}
                  onChange={(e) => setSupabaseAnonKey(e.target.value)}
                  className="w-full bg-[#0E131F] border border-[#1C2438] focus:border-[#C5A059] px-3.5 py-2.5 text-xs text-white font-mono placeholder-neutral-600 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                    Service Role Secret Key (<code className="text-[#DFB76C] font-mono">SUPABASE_SERVICE_ROLE_KEY</code>)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowServiceKey(!showServiceKey)}
                    className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1"
                  >
                    {showServiceKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showServiceKey ? "Hide" : "Reveal"}</span>
                  </button>
                </div>
                <input
                  type={showServiceKey ? "text" : "password"}
                  placeholder="eyJhbGciOi... or sb_secret_..."
                  value={supabaseServiceKey}
                  onChange={(e) => setSupabaseServiceKey(e.target.value)}
                  className="w-full bg-[#0E131F] border border-[#1C2438] focus:border-[#C5A059] px-3.5 py-2.5 text-xs text-white font-mono placeholder-neutral-600 focus:outline-none"
                />
                <p className="text-[10px] text-neutral-500 mt-1">
                  Required for server-side order write operations and inventory updates. Never exposed to customers.
                </p>
              </div>
            </div>
          </div>

          {/* ================= SECTION 2: RAZORPAY CONFIG ================= */}
          <div className="bg-[#0A0D14] border border-[#1C2438] overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-[#1C2438] bg-[#0E131F] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-5 h-5 text-[#DFB76C]" />
                <div>
                  <h2 className="text-sm font-black uppercase text-white font-jersey tracking-wider">
                    Razorpay Online Payments Gateway
                  </h2>
                  <p className="text-[11px] text-neutral-400">
                    Enables 100% prepaid payments via UPI (GPay, PhonePe, Paytm), Cards &amp; NetBanking.
                  </p>
                </div>
              </div>

              <a
                href="https://dashboard.razorpay.com/app/keys"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#DFB76C] hover:underline font-bold uppercase tracking-wider"
              >
                <span>Razorpay API Keys</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              {razorpayStatus && (
                <div
                  className={`p-3 border text-xs font-semibold flex items-center gap-2 ${
                    razorpayStatus.includes("connected_successfully")
                      ? "bg-emerald-950/40 border-emerald-800 text-emerald-300"
                      : "bg-amber-950/40 border-amber-800 text-amber-300"
                  }`}
                >
                  {razorpayStatus.includes("connected_successfully") ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  )}
                  <span>Status: {razorpayStatus}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                    Razorpay Key ID (<code className="text-[#DFB76C] font-mono">NEXT_PUBLIC_RAZORPAY_KEY_ID</code>)
                  </label>
                  <input
                    type="text"
                    placeholder="rzp_live_... or rzp_test_..."
                    value={razorpayKeyId}
                    onChange={(e) => setRazorpayKeyId(e.target.value)}
                    className="w-full bg-[#0E131F] border border-[#1C2438] focus:border-[#C5A059] px-3.5 py-2.5 text-xs text-white font-mono placeholder-neutral-600 focus:outline-none"
                  />
                  {razorpayKeyId.startsWith("rzp_test") && (
                    <span className="text-[10px] text-amber-400 mt-1 inline-block">
                      ⚠️ Test Mode Key Active (Simulated Transactions)
                    </span>
                  )}
                  {razorpayKeyId.startsWith("rzp_live") && (
                    <span className="text-[10px] text-emerald-400 mt-1 inline-block">
                      ✓ Live Production Key Active (Real Payments)
                    </span>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                      Razorpay Key Secret (<code className="text-[#DFB76C] font-mono">RAZORPAY_KEY_SECRET</code>)
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowRzpSecret(!showRzpSecret)}
                      className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1"
                    >
                      {showRzpSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showRzpSecret ? "Hide" : "Reveal"}</span>
                    </button>
                  </div>
                  <input
                    type={showRzpSecret ? "text" : "password"}
                    placeholder="Enter Secret Key from Razorpay"
                    value={razorpayKeySecret}
                    onChange={(e) => setRazorpayKeySecret(e.target.value)}
                    className="w-full bg-[#0E131F] border border-[#1C2438] focus:border-[#C5A059] px-3.5 py-2.5 text-xs text-white font-mono placeholder-neutral-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ================= SECTION 3: STORE & CONTACT INFO ================= */}
          <div className="bg-[#0A0D14] border border-[#1C2438] overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-[#1C2438] bg-[#0E131F]">
              <h2 className="text-sm font-black uppercase text-white font-jersey tracking-wider">
                Store Communication &amp; Admin Info
              </h2>
            </div>

            <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Official WhatsApp Number (Orders &amp; Support)
                </label>
                <div className="flex">
                  <span className="bg-[#0E131F] border border-r-0 border-[#1C2438] px-3 py-2.5 text-xs text-neutral-400 font-mono flex items-center">
                    +
                  </span>
                  <input
                    type="tel"
                    required
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, ""))}
                    className="flex-1 bg-[#0E131F] border border-[#1C2438] focus:border-[#C5A059] px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none"
                  />
                </div>
                <p className="text-[10px] text-neutral-500 mt-1">Currently: +91 93159 63809</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Official Store Email
                </label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full bg-[#0E131F] border border-[#1C2438] focus:border-[#C5A059] px-3.5 py-2.5 text-xs text-white focus:outline-none"
                />
                <p className="text-[10px] text-neutral-500 mt-1">Currently: kitadda01@gmail.com</p>
              </div>
            </div>
          </div>

          {/* Save Action Banner */}
          <div className="p-4 bg-[#0E131F] border border-[#1C2438] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-neutral-300">
              Changes will be safely updated in your server <code className="text-[#DFB76C] font-mono">.env.local</code>.
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#C5A059] hover:bg-[#DFB76C] disabled:opacity-50 text-[#0A0D14] px-6 py-3 text-xs font-black uppercase tracking-wider transition active:scale-95"
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{saving ? "Saving Credentials..." : "Save All Credentials"}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
