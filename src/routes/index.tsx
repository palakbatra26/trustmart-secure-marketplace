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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
      {/* Hero */}
      <section className="relative mb-16 overflow-hidden rounded-[2.5rem] bg-primary p-8 text-primary-foreground sm:p-16 lg:p-20 glow-effect">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay" />
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-accent/20 blur-[100px] animate-pulse" />
        <div className="absolute -left-20 -bottom-20 h-96 w-96 rounded-full bg-white/10 blur-[100px] animate-pulse" />
        
        <div className="relative z-10 grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest backdrop-blur-md ring-1 ring-white/20">
              <ShieldCheck size={14} className="text-accent" />
              <span>Verified Community</span>
            </div>
            <h1 className="mt-6 text-4xl font-black leading-[1.1] sm:text-6xl lg:text-7xl">
              Trade with <br />
              <span className="text-accent text-glow">Absolute Trust.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg font-medium text-primary-foreground/70 leading-relaxed">
              India's most secure marketplace. Every seller and every item is verified by our smart security system.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/sell"
                className="inline-flex h-14 items-center gap-3 rounded-2xl bg-accent px-8 text-sm font-black uppercase tracking-wider text-primary shadow-[0_10px_20px_-10px_oklch(0.85_0.12_180)] transition-all hover:scale-105 active:scale-95"
              >
                <Sparkles size={18} /> Start Selling
              </Link>
              <a
                href="#listings"
                className="inline-flex h-14 items-center rounded-2xl border-2 border-white/20 bg-white/5 px-8 text-sm font-bold text-primary-foreground backdrop-blur-md transition-all hover:bg-white/10"
              >
                Explore Market
              </a>
            </div>
          </div>
          
          <div className="hidden lg:block relative">
            <div className="animate-float relative z-20 overflow-hidden rounded-[3rem] border border-white/20 bg-white/10 p-4 backdrop-blur-md shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&q=80" 
                alt="Featured product"
                className="rounded-[2.5rem] object-cover h-[400px] w-full"
              />
              <div className="absolute bottom-10 left-10 right-10 rounded-2xl glass p-6 translate-z-30">
                <p className="text-xs font-black uppercase tracking-widest text-accent mb-1">Trending Now</p>
                <p className="text-xl font-bold">Premium Living Space</p>
              </div>
            </div>
            {/* Floating Orbs */}
            <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-accent/40 blur-3xl animate-float" style={{ animationDelay: '-2s' }} />
            <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-primary/40 blur-3xl animate-float" style={{ animationDelay: '-4s' }} />
          </div>
        </div>
      </section>

      {/* Category filter */}
      <div className="mb-10 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 -mx-1 flex gap-3 overflow-x-auto px-1 pb-2 no-scrollbar">
            <button
              onClick={() => navigate({ to: "/", search: { q, category: undefined } })}
              className={`whitespace-nowrap rounded-2xl px-6 py-3 text-sm font-bold transition-all ${
                !category
                  ? "bg-primary text-primary-foreground shadow-lg scale-105"
                  : "glass text-foreground hover:bg-surface"
              }`}
            >
              All Items
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => navigate({ to: "/", search: { q, category: cat } })}
                className={`whitespace-nowrap rounded-2xl px-6 py-3 text-sm font-bold transition-all ${
                  category === cat
                    ? "bg-primary text-primary-foreground shadow-lg scale-105"
                    : "glass text-foreground hover:bg-surface"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40 ml-1">Quick Filters:</span>
          <div className="flex gap-2 p-1 rounded-2xl glass ring-1 ring-primary/5">
            <button 
              className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-primary text-accent shadow-lg"
              onClick={() => toast.success("Showing Verified Sellers")}
            >
              Verified Sellers
            </button>
            <button 
              className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-primary/60 hover:text-primary hover:bg-primary/5 transition-all"
              onClick={() => toast.success("Showing High Trust Sellers")}
            >
              High Trust (70+)
            </button>
            <button 
              className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-primary/60 hover:text-primary hover:bg-primary/5 transition-all"
              onClick={() => toast.info("Showing All Products")}
            >
              All Products
            </button>
          </div>
        </div>
      </div>

      <section id="listings" className="relative">
        <div className="mb-8 flex items-end justify-between">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-primary uppercase tracking-tighter">
              {q ? `Search: ${q}` : category ? `${category}` : "Discover Rare Finds"}
            </h2>
            <div className="h-1.5 w-20 rounded-full bg-accent" />
          </div>
          <span className="rounded-full glass px-4 py-1.5 text-xs font-black text-primary/60">
            {loading ? "Syncing..." : `${listings.length} Available`}
          </span>
        </div>

        {loading ? (
          <div className="flex h-96 flex-col items-center justify-center gap-4 text-primary/40">
            <Loader2 size={40} className="animate-spin" />
            <p className="text-sm font-black uppercase tracking-widest">Loading Marketplace</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="rounded-[2.5rem] glass py-24 text-center ring-1 ring-border">
            <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-3xl bg-primary/5 text-primary">
              <Sparkles size={32} />
            </div>
            <p className="text-xl font-bold">No products found here.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Be the first to{" "}
              <Link to="/sell" className="font-black text-primary underline underline-offset-4 decoration-accent">
                Post a Product
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {listings.map((l) => (
              <ListingCard key={l._id || l.id} listing={l} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
