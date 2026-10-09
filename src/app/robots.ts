import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kitadda.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/*",
          "/api/admin/*",
          "/api/checkout/*",
          "/_not-found",
        ],
      },
      {
        // Friendly rules for AI Crawlers and Search Engines (ChatGPT, Claude, Perplexity, Google)
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "ClaudeBot",
          "Claude-Web",
          "PerplexityBot",
          "Google-Extended",
          "Applebot-Extended",
          "Amazonbot",
        ],
        allow: ["/", "/products", "/products/*", "/shipping-and-returns", "/terms-and-conditions", "/privacy-policy"],
        disallow: ["/admin", "/admin/*", "/api/*"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
