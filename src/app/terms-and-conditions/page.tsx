import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { CheckoutModal } from "@/components/CheckoutModal";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Terms & Conditions | Kit Adda",
  description: "Terms and conditions, shipping timelines, prepaid payment policy, and replacement guidelines for Kit Adda (@kit.adda).",
};

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-[#0A0D14] flex flex-col text-neutral-200 selection:bg-[#DFB76C] selection:text-[#0A0D14]">
      <Header />

      <main className="flex-1 py-12 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          {/* Page Title */}
          <div className="border-b border-[#1C2438] pb-8 mb-10 text-center sm:text-left">
            <div className="text-xs uppercase tracking-wider text-[#DFB76C] font-semibold mb-2">
              Kit Adda Official
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">
              Terms &amp; Conditions
            </h1>
            <p className="text-sm text-neutral-400">
              Last updated: October 2026
            </p>
          </div>

          {/* Simple Clean Document Body */}
          <div className="space-y-10 text-sm leading-relaxed text-neutral-300">
            {/* Quick Summary / Note */}
            <div className="p-5 bg-[#0E131F] border border-[#1C2438] rounded-none">
              <h2 className="text-base font-bold text-white uppercase tracking-wider mb-3">
                PLEASE NOTE (IMPORTANT STORE POLICIES)
              </h2>
              <ul className="space-y-2 list-disc list-inside text-neutral-300">
                <li><strong className="text-white">Prepaid orders only</strong> — We do not offer Cash on Delivery (COD).</li>
                <li><strong className="text-white">No returns or size exchanges</strong> once delivered.</li>
                <li><strong className="text-white">Exchange / Replacement</strong> is only provided if the product arrives damaged or if the wrong item is sent.</li>
                <li><strong className="text-white">Unboxing video is mandatory</strong> for any damage or wrong-product claim.</li>
              </ul>
            </div>

            {/* Section 1 */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white tracking-tight border-b border-[#1C2438] pb-2">
                1. General Overview
              </h2>
              <p>
                Welcome to <strong>Kit Adda</strong> (accessible via our official storefront and Instagram <Link href={siteConfig.instagramUrl} target="_blank" className="text-[#DFB76C] hover:underline font-semibold">@kit.adda</Link>). By browsing our website, placing an order, or making a payment, you agree to comply with and be bound by the following terms and conditions.
              </p>
              <p>
                Please read these terms carefully before placing an order. If you do not agree with any part of these terms, please do not proceed with purchasing.
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white tracking-tight border-b border-[#1C2438] pb-2">
                2. Shipping &amp; Delivery Timelines
              </h2>
              <p>
                We partner with premier logistics providers (including BlueDart, Delhivery, and DTDC) to ensure fast and secure pan-India delivery:
              </p>
              <ul className="space-y-2 list-disc list-inside ml-2">
                <li><strong>Delhi NCR:</strong> Delivered within <strong>2 to 3 business days</strong>.</li>
                <li><strong>Rest of India:</strong> Delivered within <strong>3 to 6 business days</strong>.</li>
                <li>Orders are usually processed and dispatched within <strong>24–48 hours</strong> after payment confirmation.</li>
                <li>Live tracking numbers are sent via SMS, WhatsApp, and email as soon as your parcel is dispatched.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white tracking-tight border-b border-[#1C2438] pb-2">
                3. Payment Policy
              </h2>
              <p>
                All orders placed on Kit Adda are <strong>100% prepaid</strong>. We support:
              </p>
              <ul className="space-y-1 list-disc list-inside ml-2">
                <li>UPI (Google Pay, PhonePe, Paytm, BHIM, etc.)</li>
                <li>Credit &amp; Debit Cards (Visa, Mastercard, RuPay)</li>
                <li>Net Banking &amp; Secure Wallets</li>
              </ul>
              <p className="text-xs text-neutral-400">
                All transactions are encrypted with 256-bit SSL security through certified payment gateways.
              </p>
            </section>

            {/* Section 4 */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white tracking-tight border-b border-[#1C2438] pb-2">
                4. Returns, Exchanges &amp; Replacement Policy
              </h2>
              <p>
                Due to the imported, limited-edition, and custom-printed nature of football jerseys and merchandise, <strong>we do not accept general returns, refunds, or size exchanges</strong>.
              </p>
              <div className="space-y-2 mt-3">
                <h3 className="font-semibold text-white">Eligible Cases for Replacement:</h3>
                <p>
                  A free replacement or correction will be issued <strong>only</strong> under the following conditions:
                </p>
                <ul className="space-y-1.5 list-disc list-inside ml-2">
                  <li>The product received is physically damaged or torn upon arrival.</li>
                  <li>The incorrect jersey, size, or player printing was shipped by mistake.</li>
                </ul>
              </div>
            </section>

            {/* Section 5 */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white tracking-tight border-b border-[#1C2438] pb-2">
                5. Mandatory Unboxing Video Requirement
              </h2>
              <p>
                To prevent fraud and process damage claims fairly with logistics carriers, <strong>an uncut unboxing video is strictly mandatory</strong>:
              </p>
              <ul className="space-y-2 list-disc list-inside ml-2">
                <li>The video must start with the unopened, sealed courier bag with the shipping label clearly visible.</li>
                <li>The package must be cut open and the product inspected on camera in a single continuous, unedited video clip.</li>
                <li>Claims must be reported to our WhatsApp support team within <strong>48 hours</strong> of delivery.</li>
                <li>Claims submitted without a valid unboxing video or after 48 hours of delivery cannot be accepted.</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white tracking-tight border-b border-[#1C2438] pb-2">
                6. Custom Jerseys &amp; Order Cancellations
              </h2>
              <p>
                Orders can be cancelled or edited only within <strong>2 hours</strong> of placement by reaching out to our WhatsApp support team.
              </p>
              <p>
                Once a custom name and number printing has been processed or the package has been dispatched, <strong>cancellations or modifications are strictly not possible</strong>.
              </p>
            </section>

            {/* Section 7 */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white tracking-tight border-b border-[#1C2438] pb-2">
                7. Sizing &amp; Fit Recommendations
              </h2>
              <p>
                Please refer to the detailed size chart on each product page before ordering:
              </p>
              <ul className="space-y-1.5 list-disc list-inside ml-2">
                <li><strong>Fan Version Kits:</strong> Standard regular fit. Order your normal t-shirt size.</li>
                <li><strong>Player Version Kits:</strong> Slim / athletic fit with heat-pressed badges. If you prefer a relaxed fit, we recommend ordering one size up.</li>
              </ul>
            </section>

            {/* Section 8: Cookies Policy */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white tracking-tight border-b border-[#1C2438] pb-2">
                8. Cookies &amp; Tracking Technologies
              </h2>
              <p>
                Our website uses cookies and similar storage technologies to provide an optimal shopping experience:
              </p>
              <ul className="space-y-1.5 list-disc list-inside ml-2">
                <li><strong>Essential Cookies:</strong> Required to keep your cart active, remember chosen sizes/customizations, and maintain secure session state.</li>
                <li><strong>Performance &amp; Analytics:</strong> Help us measure site traffic, popular jersey drops, and improve storefront speed and user experience.</li>
                <li><strong>Preferences:</strong> Remember your consent choices and previous shopping preferences.</li>
              </ul>
              <p className="text-xs text-neutral-400">
                You can choose to disable non-essential cookies via your browser settings; however, disabling essential cookies may impact your ability to checkout smoothly.
              </p>
            </section>

            {/* Section 9: Data Privacy & Customer Rights */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white tracking-tight border-b border-[#1C2438] pb-2">
                9. Data Privacy &amp; Protection
              </h2>
              <p>
                We take your personal data privacy seriously. When you place an order, we collect essential information including your name, shipping address, phone number, and email address.
              </p>
              <ul className="space-y-1.5 list-disc list-inside ml-2">
                <li><strong>Purpose of Data:</strong> Used strictly for order processing, billing, courier label generation, and automated tracking alerts via WhatsApp/SMS/email.</li>
                <li><strong>No Third-Party Sale:</strong> We <strong>never</strong> sell, rent, or trade your personal information to third parties or advertising brokers.</li>
                <li><strong>Payment Security:</strong> Payment information is processed directly by RBI-authorized payment gateways via 256-bit encryption. We never store credit/debit card numbers or UPI PINs on our servers.</li>
                <li><strong>Your Data Rights:</strong> You have the right to request a copy of your stored order data or request complete deletion of your records from our active database by emailing <a href={`mailto:${siteConfig.supportEmail}`} className="text-[#DFB76C] hover:underline font-semibold">{siteConfig.supportEmail}</a>.</li>
              </ul>
            </section>

            {/* Section 10: Contact & Support */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white tracking-tight border-b border-[#1C2438] pb-2">
                10. Contact &amp; Support
              </h2>
              <p>
                If you have any questions regarding your order, data privacy, or these terms, feel free to reach out to us:
              </p>
              <div className="p-4 bg-[#0E131F] border border-[#1C2438] space-y-1 text-xs">
                <div><strong>WhatsApp:</strong> <a href={siteConfig.whatsappUrl("Hi Kit Adda team! I have a question.")} target="_blank" className="text-[#DFB76C] hover:underline font-semibold">{siteConfig.whatsappDisplay}</a></div>
                <div><strong>Instagram:</strong> <a href={siteConfig.instagramUrl} target="_blank" className="text-[#DFB76C] hover:underline font-semibold">@kit.adda</a></div>
                <div><strong>Email:</strong> <a href={`mailto:${siteConfig.supportEmail}`} className="text-[#DFB76C] hover:underline font-semibold">{siteConfig.supportEmail}</a></div>
                <div><strong>Support Hours:</strong> Monday – Saturday, 10:00 AM – 8:00 PM IST</div>
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
