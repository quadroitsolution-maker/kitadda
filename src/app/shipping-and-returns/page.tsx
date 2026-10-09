import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { CheckoutModal } from "@/components/CheckoutModal";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Shipping & Return Policy | Kit Adda",
  description: "Official Kit Adda Shipping Timelines (Delhi NCR 2-3 days, India 3-6 days), Prepaid Orders, and Damage Replacement Guidelines.",
};

export default function ShippingAndReturnsPage() {
  return (
    <div className="min-h-screen bg-[#0A0D14] flex flex-col text-neutral-200 selection:bg-[#DFB76C] selection:text-[#0A0D14]">
      <Header />

      <main className="flex-1 py-12 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          {/* Page Title */}
          <div className="border-b border-[#1C2438] pb-8 mb-10 text-center sm:text-left">
            <div className="text-xs uppercase tracking-wider text-[#DFB76C] font-semibold mb-2">
              Kit Adda Official Policy
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">
              Shipping &amp; Return Policy
            </h1>
            <p className="text-sm text-neutral-400">
              Clear guidelines for delivery timelines, prepaid orders, and damaged item replacements.
            </p>
          </div>

          {/* Clean Simple Content */}
          <div className="space-y-10 text-sm leading-relaxed text-neutral-300">
            {/* Quick Mandate Box */}
            <div className="p-5 bg-[#0E131F] border border-[#1C2438] rounded-none">
              <h2 className="text-base font-bold text-white uppercase tracking-wider mb-3">
                PLEASE NOTE
              </h2>
              <ul className="space-y-2 list-disc list-inside text-neutral-300">
                <li><strong className="text-white">Prepaid orders only</strong></li>
                <li><strong className="text-white">No returns or exchanges</strong></li>
                <li><strong className="text-white">Exchange / replacement only if the product arrives damaged or wrong</strong></li>
                <li><strong className="text-white">Unboxing video is mandatory for any damage / wrong-product claim</strong></li>
              </ul>
            </div>

            {/* Section 1: Delivery Timelines */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white tracking-tight border-b border-[#1C2438] pb-2">
                1. Delivery Timelines &amp; Dispatch
              </h2>
              <p>
                We ship orders across India through trusted courier partners (BlueDart, Delhivery, DTDC, XpressBees).
              </p>
              <ul className="space-y-2 list-disc list-inside ml-2">
                <li><strong>Delhi NCR:</strong> Delivery within <strong>2–3 days</strong></li>
                <li><strong>Pan-India:</strong> Delivery within <strong>3–6 days</strong></li>
                <li><strong>Order Processing:</strong> 24–48 hours for standard orders (custom player printing may take an additional 24 hours).</li>
                <li><strong>Live Tracking:</strong> Tracking link and AWB number are automatically shared via SMS, WhatsApp, and email upon dispatch.</li>
              </ul>
            </section>

            {/* Section 2: Returns & Sizing */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white tracking-tight border-b border-[#1C2438] pb-2">
                2. No Returns &amp; Sizing Policy
              </h2>
              <p>
                We strictly do not accept general returns, refunds, or size exchanges once an order is delivered.
              </p>
              <p>
                Please ensure you double-check our <strong>Size Guide</strong> on the product page before placing your order. If you need sizing guidance between Fan version (regular fit) and Player version (slim fit), feel free to message our support team on WhatsApp before ordering.
              </p>
            </section>

            {/* Section 3: Damaged or Wrong Item Claims */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white tracking-tight border-b border-[#1C2438] pb-2">
                3. Damaged or Wrong Product Replacement
              </h2>
              <p>
                We only provide replacements if:
              </p>
              <ul className="space-y-1.5 list-disc list-inside ml-2">
                <li>The product received has physical manufacturing defects or tears.</li>
                <li>You received the incorrect jersey model, size, or player name/number printing compared to what was ordered.</li>
              </ul>
            </section>

            {/* Section 4: Mandatory Unboxing Video */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white tracking-tight border-b border-[#1C2438] pb-2">
                4. Mandatory Unboxing Video Guidelines
              </h2>
              <p>
                An unboxing video is <strong>mandatory</strong> to process any replacement or damage claim:
              </p>
              <ul className="space-y-2 list-disc list-inside ml-2">
                <li>The video must start from the unopened, sealed courier bag with the shipping label clearly visible.</li>
                <li>The parcel must be cut open and product checked in one uncut, continuous video clip.</li>
                <li>You must notify us via WhatsApp at <a href={siteConfig.whatsappUrl("Hi Kit Adda team! I have an issue with my delivered parcel.")} target="_blank" className="text-[#DFB76C] hover:underline font-semibold">{siteConfig.whatsappDisplay}</a> within <strong>48 hours</strong> of delivery.</li>
                <li>Claims without a complete unboxing video cannot be entertained.</li>
              </ul>
            </section>

            {/* Section 5: Need Help */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white tracking-tight border-b border-[#1C2438] pb-2">
                5. Need Help With Your Order?
              </h2>
              <p>
                Have a question about tracking or an upcoming drop? Contact us anytime:
              </p>
              <div className="p-4 bg-[#0E131F] border border-[#1C2438] space-y-1 text-xs">
                <div><strong>WhatsApp:</strong> <a href={siteConfig.whatsappUrl("Hi Kit Adda team!")} target="_blank" className="text-[#DFB76C] hover:underline font-semibold">{siteConfig.whatsappDisplay}</a></div>
                <div><strong>Instagram:</strong> <a href={siteConfig.instagramUrl} target="_blank" className="text-[#DFB76C] hover:underline font-semibold">@kit.adda</a></div>
                <div><strong>Email:</strong> <a href={`mailto:${siteConfig.supportEmail}`} className="text-[#DFB76C] hover:underline font-semibold">{siteConfig.supportEmail}</a></div>
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
