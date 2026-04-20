import { Link } from "@tanstack/react-router";
import { TrustBadge } from "@/components/TrustBadge";
import { formatPrice } from "@/lib/trust";

export interface ListingCardData {
  id: string;
  title: string;
  price: number | string;
  category: string;
  image_url: string;
  status: "active" | "sold" | "removed";
  seller: { id: string; name: string; trust_score: number } | null;
}

export function ListingCard({ listing }: { listing: ListingCardData }) {
  return (
    <Link
      to="/product/$id"
      params={{ id: listing.id }}
      className="group block overflow-hidden rounded-xl bg-surface ring-1 ring-border transition hover:ring-accent/60 hover:shadow-[var(--shadow-elevated)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={listing.image_url}
          alt={listing.title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
        />
        {listing.status === "sold" && (
          <span className="absolute left-2 top-2 rounded-md bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">
            SOLD
          </span>
        )}
        {listing.seller && (
          <div className="absolute right-2 top-2">
            <TrustBadge score={listing.seller.trust_score} size="sm" showLabel={false} />
          </div>
        )}
      </div>
      <div className="space-y-1 p-3">
        <p className="text-lg font-bold text-foreground">{formatPrice(listing.price)}</p>
        <h3 className="line-clamp-2 text-sm text-foreground/90">{listing.title}</h3>
        <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground">
          <span>{listing.category}</span>
          {listing.seller && <span className="truncate">{listing.seller.name}</span>}
        </div>
      </div>
    </Link>
  );
}
