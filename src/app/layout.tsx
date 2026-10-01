import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kit Adda | India's Ultimate Football Hub (@kit.adda)",
  description: "Exclusive master-grade football jerseys, retro kits, international gear, and player version kits. Welcome to the Adda. Wear Your Passion.",
  keywords: ["football jerseys", "kit adda", "retro football kits", "india football store", "messi jersey", "ronaldo jersey", "bellingham kit"],
  openGraph: {
    title: "Kit Adda | India's Football Jersey Culture",
    description: "Welcome to the Adda. Official Fan & Player Version Football Kits with custom printing across India.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <head>
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#0A0D14] text-neutral-100 selection:bg-[#C5A059] selection:text-[#0A0D14]">
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
