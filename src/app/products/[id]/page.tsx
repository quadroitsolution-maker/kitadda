import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { PRODUCTS } from "@/data/products";
import { Header } from "@/components/Header";
import { ProductDetailsView } from "@/components/ProductDetailsView";
import { CartDrawer } from "@/components/CartDrawer";
import { CheckoutModal } from "@/components/CheckoutModal";
import { Footer } from "@/components/Footer";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = PRODUCTS.find((p) => p.id === id);

  if (!product) {
    return {
      title: "Product Not Found | Kit Adda",
    };
  }

  return {
    title: `${product.title} | Kit Adda (@kit.adda)`,
    description: product.description,
    openGraph: {
      title: `${product.title} - Kit Adda Official`,
      description: `Buy ${product.title} online in India. Master Grade player & fan edition with custom printing.`,
      images: [{ url: product.image_url }],
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  const product = PRODUCTS.find((p) => p.id === id);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col text-neutral-100">
      <Header />
      <main className="flex-1">
        <ProductDetailsView product={product} />
      </main>
      <Footer />
      <CartDrawer />
      <CheckoutModal />
    </div>
  );
}
