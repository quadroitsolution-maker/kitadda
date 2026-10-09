import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { CookieBanner } from "@/components/CookieBanner";
import { Preloader } from "@/components/Preloader";
import { FootballCursor } from "@/components/FootballCursor";
import Script from "next/script";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0A0D14",
};

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kitadda.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Kit Adda | India's Ultimate Football Hub (@kit.adda)",
    template: "%s | Kit Adda",
  },
  description: "Exclusive master-grade football jerseys, player and fan versions, retro club vault, and matchday grip gear across India. 100% Secure Prepaid orders with express pan-India dispatch.",
  keywords: [
    "football jerseys india",
    "kit adda",
    "buy football kits online",
    "real madrid jersey india",
    "barcelona jersey",
    "arsenal jersey",
    "retro football kits",
    "player version jerseys",
    "fan version football shirts",
    "grip socks football",
    "messi jersey",
    "ronaldo jersey",
    "bellingham kit",
  ],
  authors: [{ name: "Kit Adda Team", url: siteUrl }],
  creator: "Kit Adda",
  publisher: "Kit Adda",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/logo.jpg" },
      { url: "/logo.jpg", sizes: "32x32", type: "image/jpeg" },
      { url: "/logo.jpg", sizes: "192x192", type: "image/jpeg" },
    ],
    shortcut: "/logo.jpg",
    apple: [
      { url: "/logo.jpg", sizes: "180x180", type: "image/jpeg" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: "Kit Adda",
    title: "Kit Adda | India's Premier Football Jersey Culture",
    description: "Welcome to the Adda. Official Player & Fan Version Football Kits, Retro Editions, and Grip Gear across India.",
    images: [
      {
        url: "/logo.jpg",
        width: 800,
        height: 800,
        alt: "Kit Adda Official Emblem",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kit Adda | India's Ultimate Football Jersey Store",
    description: "Master Grade football kits, player and fan versions, and retro club drops. Wear The Game.",
    images: ["/logo.jpg"],
    creator: "@kitadda",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      "name": "Kit Adda",
      "url": siteUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${siteUrl}/logo.jpg`,
        "width": "800",
        "height": "800",
      },
      "sameAs": [
        "https://instagram.com/kit.adda",
      ],
      "contactPoint": [
        {
          "@type": "ContactPoint",
          "telephone": "+91-93159-63809",
          "contactType": "customer support",
          "email": "kitadda01@gmail.com",
          "areaServed": "IN",
          "availableLanguage": ["English", "Hindi"],
        },
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      "url": siteUrl,
      "name": "Kit Adda",
      "description": "India's Ultimate Football Jersey Hub",
      "publisher": {
        "@id": `${siteUrl}/#organization`,
      },
      "potentialAction": [
        {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": `${siteUrl}/products?search={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <head>
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#0A0D14] text-neutral-100 selection:bg-[#C5A059] selection:text-[#0A0D14]">
        <Preloader />
        <FootballCursor />
        <CartProvider>
          {children}
          <CookieBanner />
        </CartProvider>
      </body>
    </html>
  );
}
