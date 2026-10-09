import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { PRODUCTS } from "@/data/products";
import { getProductById } from "@/lib/db";
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
  const product = (await getProductById(id)) || PRODUCTS.find((p) => p.id === id);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kitadda.com";

  if (!product) {
    return {
      title: "Product Not Found | Kit Adda",
    };
  }

  const productUrl = `${siteUrl}/products/${product.id}`;

  return {
    title: `${product.title} | Kit Adda Official Store`,
    description: product.description || `Buy ${product.title} in India. Master Grade player & fan editions with authentic crest embroidery and express delivery.`,
    alternates: {
      canonical: productUrl,
    },
    openGraph: {
      type: "website",
      url: productUrl,
      title: `${product.title} - Kit Adda Official`,
      description: product.description || `Buy ${product.title} in India. Master Grade football kit.`,
      images: [
        {
          url: product.image_url,
          width: 800,
          height: 1000,
          alt: product.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description: `Buy ${product.title} in India. Master Grade football jersey.`,
      images: [product.image_url],
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  const product = (await getProductById(id)) || PRODUCTS.find((p) => p.id === id);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kitadda.com";

  if (!product) {
    notFound();
  }

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    image: product.gallery && product.gallery.length > 0 ? product.gallery : [product.image_url],
    description: product.description || `Buy ${product.title} in India. Master Grade football kit.`,
    sku: product.sku || product.id,
    brand: {
      "@type": "Brand",
      name: "Kit Adda",
    },
    category: product.category,
    offers: {
      "@type": "Offer",
      url: `${siteUrl}/products/${product.id}`,
      priceCurrency: "INR",
      price: product.price,
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      itemCondition: "https://schema.org/NewCondition",
      availability:
        product.stock_status === "out_of_stock"
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "Kit Adda",
      },
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "All Products",
        item: `${siteUrl}/products`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.title,
        item: `${siteUrl}/products/${product.id}`,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#0A0D14] flex flex-col text-neutral-100 selection:bg-[#C5A059] selection:text-[#0A0D14]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
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
