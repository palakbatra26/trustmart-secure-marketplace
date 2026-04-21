import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { productsAPI } from "@/lib/mongodb";
import { ListingCard, type ListingCardData } from "@/components/ListingCard";
import { CATEGORIES } from "@/lib/trust";
import { Loader2, ShieldCheck, Sparkles } from "lucide-react";

const searchSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
});

export const Route = createFileRoute("/")({
  validateSearch: searchSchema,
  component: HomePage,
});

function HomePage() {
  const { q, category } = Route.useSearch();
  const navigate = useNavigate();
  const [listings, setListings] = useState<ListingCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const params: any = {};
        if (category && category !== 'All') params.category = category;
        if (q) params.search = q;
        
        const res = await productsAPI.getProducts(params);
        if (cancelled) return;
        setListings(res.data.products || []);
      } catch (error) {
        console.error(error);
        setListings([]);
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [q, category]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      {/* Hero */}
      <section className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/85 p-6 text-primary-foreground sm:p-10">
        <div className="flex items-center gap-2 text-accent">
          <ShieldCheck size={20} />
          <span className="text-sm font-semibold uppercase tracking-wider">Trust-first marketplace</span>
        </div>
        <h1 className="mt-3 max-w-2xl text-3xl font-extrabold leading-tight sm:text-5xl">
          Buy and sell second-hand —{" "}
          <span className="text-accent">with people you can trust.</span>
        </h1>
        <p className="mt-3 max-w-xl text-primary-foreground/75">
          Every seller on TrustMart has a public trust score (0–100). Reviews boost it, reports lower
          it. No more guessing.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            to="/sell"
            className="inline-flex items-center gap-1.5 rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-primary shadow-md transition hover:shadow-lg"
          >
            <Sparkles size={16} /> Start Selling
          </Link>
          <a
            href="#listings"
            className="inline-flex items-center rounded-full border-2 border-primary-foreground/30 px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-foreground/10"
          >
            Browse listings
          </a>
        </div>
      </section>

      {/* Category filter */}
      <div className="mb-6 -mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
        <button
          onClick={() => navigate({ to: "/", search: { q, category: undefined } })}
          className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition ${
            !category
              ? "bg-primary text-primary-foreground"
              : "bg-surface text-foreground ring-1 ring-border hover:ring-accent/60"
          }`}
        >
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => navigate({ to: "/", search: { q, category: cat } })}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition ${
              category === cat
                ? "bg-primary text-primary-foreground"
                : "bg-surface text-foreground ring-1 ring-border hover:ring-accent/60"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <section id="listings">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-xl font-bold">
            {q ? `Results for "${q}"` : category ? category : "Fresh recommendations"}
          </h2>
          <span className="text-sm text-muted-foreground">
            {loading ? "Loading…" : `${listings.length} listings`}
          </span>
        </div>

        {loading ? (
          <div className="grid place-items-center py-20 text-muted-foreground">
            <Loader2 className="animate-spin" />
          </div>
        ) : listings.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-surface py-16 text-center">
            <p className="text-foreground">No listings found.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Be the first to{" "}
              <Link to="/sell" className="font-semibold text-primary underline">
                list something
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {listings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
