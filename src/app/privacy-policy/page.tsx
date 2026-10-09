import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { CheckoutModal } from "@/components/CheckoutModal";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Privacy & Cookie Policy | Kit Adda",
  description: "Learn how Kit Adda protects customer privacy, handles cookies, and secures order data.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#0A0D14] flex flex-col text-neutral-200 selection:bg-[#DFB76C] selection:text-[#0A0D14]">
      <Header />

      <main className="flex-1 py-12 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="border-b border-[#1C2438] pb-8 mb-10 text-center sm:text-left">
            <div className="text-xs uppercase tracking-wider text-[#DFB76C] font-semibold mb-2">
              Privacy &amp; Security
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">
              Privacy &amp; Cookie Policy
            </h1>
            <p className="text-sm text-neutral-400">
              How we collect, protect, and handle your data and cookies on Kit Adda.
            </p>
          </div>

          {/* Simple Clean Body */}
          <div className="space-y-10 text-sm leading-relaxed text-neutral-300">
            {/* 1. Information We Collect */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white tracking-tight border-b border-[#1C2438] pb-2">
                1. Information We Collect
              </h2>
              <p>
                When you visit or place an order on Kit Adda, we collect information necessary to fulfill your order and enhance your shopping experience:
              </p>
              <ul className="space-y-1.5 list-disc list-inside ml-2">
                <li><strong>Customer Details:</strong> Name, delivery address, phone number, and email address.</li>
                <li><strong>Order Specifications:</strong> Jersey sizes, club/national team selections, player names and squad numbers.</li>
                <li><strong>Device &amp; Analytics Data:</strong> IP address, device type, browser information, and referral sources to diagnose performance issues.</li>
              </ul>
            </section>

            {/* 2. How We Use Your Data */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white tracking-tight border-b border-[#1C2438] pb-2">
                2. How We Use Your Data
              </h2>
              <ul className="space-y-1.5 list-disc list-inside ml-2">
                <li>To print, pack, and dispatch your jerseys via express couriers.</li>
                <li>To send automated order updates, invoices, and live tracking links via SMS, WhatsApp, and email.</li>
                <li>To respond to customer support inquiries and process replacement claims for damaged shipments.</li>
                <li>To safeguard against fraudulent chargebacks and unauthorized transactions.</li>
              </ul>
            </section>

            {/* 3. Cookies Policy */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white tracking-tight border-b border-[#1C2438] pb-2">
                3. Cookie Policy &amp; Storage
              </h2>
              <p>
                We use cookies and local storage tokens to make your shopping experience smooth and responsive:
              </p>
              <div className="space-y-2 mt-2">
                <p><strong>Types of Cookies Used:</strong></p>
                <ul className="space-y-1.5 list-disc list-inside ml-2">
                  <li><strong>Essential Shopping Cookies:</strong> Retain items in your cart between page reloads, maintain checkout state, and secure admin login sessions.</li>
                  <li><strong>Analytics Cookies:</strong> Help us measure site visitor counts and popular kit collections so we can restock the kits you love.</li>
                  <li><strong>Preference Cookies:</strong> Store UI preferences like dismissed banners and consent status.</li>
                </ul>
              </div>
              <p className="text-xs text-neutral-400">
                You can manage cookie settings directly in your browser. Disabling essential cookies may prevent cart and checkout features from functioning correctly.
              </p>
            </section>

            {/* 4. Payment Security */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white tracking-tight border-b border-[#1C2438] pb-2">
                4. Payment Security &amp; Encryption
              </h2>
              <p>
                All payments are processed securely through certified RBI-authorized payment gateways (Razorpay). <strong>Kit Adda never stores, handles, or has access to your full credit card numbers, CVVs, or UPI PINs</strong>. All traffic is protected with 256-bit SSL encryption.
              </p>
            </section>

            {/* 5. Your Data Rights & Deletion */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white tracking-tight border-b border-[#1C2438] pb-2">
                5. Your Data Rights &amp; Deletion
              </h2>
              <p>
                You maintain complete control over your personal data:
              </p>
              <ul className="space-y-1.5 list-disc list-inside ml-2">
                <li>You can request a copy of the personal information we hold about your past orders.</li>
                <li>You can request permanent deletion or anonymization of your contact details from our marketing and customer records.</li>
              </ul>
              <p>
                To exercise any of these rights, email us at <a href={`mailto:${siteConfig.supportEmail}`} className="text-[#DFB76C] hover:underline font-semibold">{siteConfig.supportEmail}</a> with your Order ID or phone number.
              </p>
            </section>

            {/* 6. Contact Support */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white tracking-tight border-b border-[#1C2438] pb-2">
                6. Contact Privacy Team
              </h2>
              <div className="p-4 bg-[#0E131F] border border-[#1C2438] space-y-1 text-xs">
                <div><strong>Email:</strong> <a href={`mailto:${siteConfig.supportEmail}`} className="text-[#DFB76C] hover:underline font-semibold">{siteConfig.supportEmail}</a></div>
                <div><strong>WhatsApp:</strong> <a href={siteConfig.whatsappUrl("Hi Kit Adda team! I have a question regarding privacy/data.")} target="_blank" className="text-[#DFB76C] hover:underline font-semibold">{siteConfig.whatsappDisplay}</a></div>
                <div><strong>Instagram:</strong> <a href={siteConfig.instagramUrl} target="_blank" className="text-[#DFB76C] hover:underline font-semibold">@kit.adda</a></div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
      <CartDrawer />
      <CheckoutModal />
    </div>
  );
}
