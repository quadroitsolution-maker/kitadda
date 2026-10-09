export const siteConfig = {
  name: "Kit Adda",
  tagline: "India's Ultimate Football Hub",
  handle: "@kit.adda",
  instagramUrl: "https://instagram.com/kit.adda",
  whatsappNumber: "919315963809",
  whatsappDisplay: "+91 93159 63809",
  whatsappUrl: (message?: string) => {
    const msg = message ? `?text=${encodeURIComponent(message)}` : "";
    return `https://wa.me/919315963809${msg}`;
  },
  supportEmail: "kitadda01@gmail.com",
  freeShippingThreshold: 999,
  defaultShippingFee: 99,
  patchFee: 150,
};
