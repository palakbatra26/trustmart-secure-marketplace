import { Link } from "@tanstack/react-router";
import { TrustBadge } from "@/components/TrustBadge";
import { formatPrice } from "@/lib/trust";
import { ShoppingBag } from "lucide-react";

export interface ListingCardData {
  id?: string;
  _id?: string;
  title: string;
  price: number | string;
  category: string;
  image_url?: string;
  imageUrl?: string;
  images?: string[];
  status?: "active" | "sold" | "removed";
  seller: { id?: string; _id?: string; name: string; trustScore?: number; trust_score?: number } | null;
}

function getImageUrl(listing: ListingCardData): string {
  if (listing.imageUrl) return listing.imageUrl;
  if (listing.image_url) return listing.image_url;
  if (listing.images && listing.images.length > 0) return listing.images[0];
  return '';
}

export function ListingCard({ listing }: { listing: ListingCardData }) {
  const imageUrl = getImageUrl(listing);
  const listingId = listing._id || listing.id;
  
  return (
    <Link
      to="/product/$id"
      params={{ id: listingId || "" }}
      className="card-3d group block overflow-hidden rounded-[2rem] glass ring-1 ring-primary/5 hover:ring-primary/20 transition-all hover:shadow-[0_40px_80px_-20px_oklch(0.45_0.15_260_/_0.2)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-primary/5">
        {imageUrl ? (
        <img
          src={imageUrl}
          alt={listing.title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-700 group-hover:scale-125 group-hover:rotate-2"
        />
        ) : (
          <div className="flex h-full items-center justify-center text-primary/10">
            <ShoppingBag size={48} className="opacity-10" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {listing.status === "sold" && (
          <span className="absolute left-4 top-4 rounded-xl bg-destructive/90 backdrop-blur-xl px-3 py-1.5 text-[8px] font-black tracking-[0.2em] text-white shadow-2xl ring-1 ring-white/20">
            SOLD
          </span>
        )}
        {listing.seller && (
          <div className="absolute right-4 top-4 translate-z-30 group-hover:scale-110 transition-transform">
            <TrustBadge score={listing.seller.trustScore ?? listing.seller.trust_score} size="sm" showLabel={false} />
          </div>
        )}
      </div>
      <div className="relative space-y-3 p-6 translate-z-40">
        <div className="flex items-center justify-between">
          <p className="text-2xl font-black text-primary leading-none tracking-tighter">{formatPrice(listing.price)}</p>
          <span className="rounded-lg bg-primary/5 px-2.5 py-1 text-[8px] font-black text-primary/40 uppercase tracking-[0.2em] ring-1 ring-primary/5">
            {listing.category}
          </span>
        </div>
        <h3 className="line-clamp-2 text-sm font-bold text-primary/80 group-hover:text-primary transition-colors leading-relaxed uppercase tracking-tight">{listing.title}</h3>
        
        <div className="flex items-center justify-between pt-2 border-t border-primary/5">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            {listing.seller && <span className="text-[10px] font-black uppercase tracking-widest text-primary/40 truncate max-w-[100px]">{listing.seller.name}</span>}
          </div>
          <span className="text-[8px] font-black uppercase tracking-[0.1em] text-accent opacity-0 group-hover:opacity-100 transition-opacity">View Details →</span>
        </div>
      </div>
    </Link>
  );
}
