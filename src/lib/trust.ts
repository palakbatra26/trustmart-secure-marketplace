// Trust score helpers
export type TrustLevel = "high" | "mid" | "low";

export function trustLevel(score: number): TrustLevel {
  if (score >= 70) return "high";
  if (score >= 40) return "mid";
  return "low";
}

export function trustLabel(score: number): string {
  const lvl = trustLevel(score);
  if (lvl === "high") return "High Trust";
  if (lvl === "mid") return "Medium Trust";
  return "Low Trust";
}

export function isSuspicious(score: number): boolean {
  return score < 30;
}

export function trustClasses(score: number): { bg: string; text: string; ring: string } {
  const lvl = trustLevel(score);
  if (lvl === "high")
    return {
      bg: "bg-trust-high/15",
      text: "text-trust-high",
      ring: "ring-trust-high/30",
    };
  if (lvl === "mid")
    return {
      bg: "bg-trust-mid/20",
      text: "text-trust-mid",
      ring: "ring-trust-mid/30",
    };
  return {
    bg: "bg-trust-low/15",
    text: "text-trust-low",
    ring: "ring-trust-low/30",
  };
}

export const CATEGORIES = [
  "Electronics",
  "Mobiles",
  "Vehicles",
  "Furniture",
  "Fashion",
  "Books",
  "Home & Garden",
  "Sports",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export function formatPrice(value: number | string): string {
  const n = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export const SELLER_PHONE = "917986904164";

export function whatsappLink(productName: string, price: number | string): string {
  const formattedPrice =
    typeof price === "string" ? price : new Intl.NumberFormat("en-IN").format(price);
  const text = `I'm interested in your product: ${productName} priced at ₹${formattedPrice}`;
  return `https://wa.me/${SELLER_PHONE}?text=${encodeURIComponent(text)}`;
}
