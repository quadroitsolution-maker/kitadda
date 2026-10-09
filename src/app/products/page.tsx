import React, { Suspense } from "react";
import { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { CheckoutModal } from "@/components/CheckoutModal";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { AllProductsView } from "@/components/AllProductsView";
import { getProducts } from "@/lib/db";
import { PRODUCTS } from "@/data/products";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kitadda.com";

export const metadata: Metadata = {
  title: "All Football Kits & Vault Drops | Kit Adda (@kit.adda)",
  description: "Browse our complete vault of master-grade football jerseys, player & fan versions, grip socks, and national team grails. Filter by category, league, and price.",
  alternates: {
    canonical: `${siteUrl}/products`,
  },
  openGraph: {
    type: "website",
    url: `${siteUrl}/products`,
    title: "All Football Kits - Kit Adda Official Vault",
    description: "Browse our complete catalog of Master Grade football jerseys and performance gear across India.",
    images: [{ url: "/logo.jpg", width: 800, height: 800, alt: "Kit Adda Vault" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "All Football Kits | Kit Adda Official Vault",
    description: "Browse Master Grade football jerseys, player and fan versions, and retro club drops.",
    images: ["/logo.jpg"],
  },
};

export default async function ProductsPage() {
  const dbProducts = await getProducts();
  const initialProducts = dbProducts && dbProducts.length > 0 ? dbProducts : PRODUCTS;

  return (
    <div className="min-h-screen bg-[#0A0D14] flex flex-col text-neutral-100 selection:bg-[#C5A059] selection:text-[#0A0D14]">
      {/* 1. Header */}
      <Header />

      {/* 2. Main Catalog View with Suspense for Search Params */}
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="max-w-7xl mx-auto px-4 py-20 text-center">
              <div className="w-8 h-8 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-xs uppercase font-mono tracking-widest text-neutral-400">
                Opening Kit Adda Vault...
              </p>
            </div>
          }
        >
          <AllProductsView initialProducts={initialProducts} />
        </Suspense>
      </main>

      {/* 3. Footer */}
      <Footer />

      {/* 4. Sliding Cart Drawer */}
      <CartDrawer />

      {/* 5. 1-Click Razorpay Prepaid Checkout Modal */}
      <CheckoutModal />

      {/* 6. Sticky Mobile Bottom Nav */}
      <MobileBottomNav />
    </div>
  );
}
