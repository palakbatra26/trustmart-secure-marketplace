import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { productsAPI, dealsAPI } from "@/lib/mongodb";
import { useAuth } from "@/lib/auth";
import { TrustBadge } from "@/components/TrustBadge";
import { ListingCard, type ListingCardData } from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Mail, Phone, AlertTriangle, CheckCircle2, ShoppingBag, Box } from "lucide-react";
import { formatPrice, isSuspicious } from "@/lib/trust";

type Deal = {
  _id: string;
  status: "pending" | "completed";
  createdAt: string;
  productId: { _id: string; title: string; price: number; imageUrl: string } | null;
  sellerId: { _id: string; name: string } | null;
};

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [myListings, setMyListings] = useState<ListingCardData[]>([]);
  const [myDeals, setMyDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [listingsRes, dealsRes] = await Promise.all([
        productsAPI.getMyProducts(),
        dealsAPI.getMyPurchases()
      ]);
      setMyListings(listingsRes.data);
      setMyDeals(dealsRes.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      void navigate({ to: "/login" });
      return;
    }
    void load();
  }, [user, authLoading, navigate, load]);

  const completeDeal = async (dealId: string) => {
    try {
      await dealsAPI.updateDealStatus(dealId, "completed");
      toast.success("Deal completed — trust score recalibrated");
      void load();
      void refreshProfile();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  if (loading || authLoading || !profile) {
    return (
      <div className="grid place-items-center py-32 text-primary/20">
        <Loader2 className="animate-spin h-12 w-12" />
      </div>
    );
  }

  const suspicious = isSuspicious(profile.trustScore ?? profile.trust_score);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-20">
      {/* Header card */}
      <div className="card-3d relative overflow-hidden rounded-[3rem] bg-primary p-8 text-primary-foreground shadow-3d sm:p-12">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay" />
        <div className="relative z-10 flex flex-col items-start gap-8 sm:flex-row sm:items-center">
          <div className="relative group">
            <span className="grid h-24 w-24 place-items-center rounded-3xl bg-accent text-4xl font-black text-primary shadow-2xl animate-float">
              {(profile.name || "U").charAt(0).toUpperCase()}
            </span>
            <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-xl bg-success grid place-items-center border-4 border-primary">
              <CheckCircle2 size={16} className="text-white" />
            </div>
          </div>
          
          <div className="flex-1 space-y-2">
            <h1 className="text-4xl font-black uppercase tracking-tighter sm:text-5xl">{profile.name}</h1>
            <div className="flex flex-wrap gap-4 text-xs font-bold uppercase tracking-widest text-primary-foreground/50">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5">
                <Mail size={14} /> {profile.email}
              </span>
              {profile.phone && (
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5">
                  <Phone size={14} /> {profile.phone}
                </span>
              )}
            </div>
          </div>

          <div className="text-right space-y-2">
            <TrustBadge score={profile.trustScore ?? profile.trust_score} size="lg" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent opacity-50">
              {profile.reportCount ?? profile.report_count} Violations Logged
            </p>
          </div>
        </div>

        {suspicious && (
          <div className="relative z-10 mt-8 flex items-center gap-3 rounded-2xl bg-destructive/20 p-4 text-xs font-bold uppercase tracking-widest text-destructive-foreground ring-1 ring-destructive/30 animate-pulse">
            <AlertTriangle size={18} /> 
            Critical: Trust index compromised. Complete pending deal protocols to stabilize.
          </div>
        )}
      </div>

      <div className="mt-16 grid gap-16 lg:grid-cols-12">
        {/* My deals */}
        <section className="lg:col-span-7 space-y-8">
          <div className="flex items-center gap-3">
            <ShoppingBag className="text-accent" />
            <h2 className="text-2xl font-black text-primary uppercase tracking-tighter">Acquisition History</h2>
          </div>
          
          {myDeals.length === 0 ? (
            <div className="rounded-[2rem] glass p-12 text-center border-dashed border-primary/10">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-primary/30">No active acquisition logs</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {myDeals.map((d) => (
                <li
                  key={d._id}
                  className="group flex flex-col gap-6 rounded-[2rem] glass p-6 shadow-xl ring-1 ring-primary/5 sm:flex-row sm:items-center hover:bg-primary/[0.02] transition-all hover:scale-[1.01]"
                >
                  {d.productId && (
                    <Link to="/product/$id" params={{ id: d.productId._id }} className="shrink-0 overflow-hidden rounded-2xl shadow-lg group-hover:rotate-2 transition-transform">
                      <img
                        src={d.productId.imageUrl}
                        alt=""
                        className="h-24 w-32 object-cover"
                      />
                    </Link>
                  )}
                  <div className="flex-1 space-y-1">
                    <p className="text-lg font-black text-primary uppercase tracking-tight">{d.productId?.title ?? "Expunged Listing"}</p>
                    <p className="text-xs font-bold text-primary/40 uppercase tracking-widest">
                      Operator: {d.sellerId?.name ?? "Anonymous"}
                      {d.productId && (
                        <span className="ml-4 text-primary/80 font-black">
                          {formatPrice(d.productId.price)}
                        </span>
                      )}
                    </p>
                  </div>
                  {d.status === "pending" ? (
                    <Button
                      size="sm"
                      onClick={() => completeDeal(d._id)}
                      className="h-12 rounded-xl bg-success text-white font-black uppercase tracking-widest text-[10px] shadow-lg hover:scale-105 active:scale-95 transition-all px-6"
                    >
                      <CheckCircle2 size={14} className="mr-2" /> Confirm Receipt
                    </Button>
                  ) : (
                    <span className="inline-flex items-center gap-2 rounded-xl bg-success/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-success border border-success/20">
                      <CheckCircle2 size={14} /> Logged
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* My listings */}
        <section className="lg:col-span-5 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Box className="text-accent" />
              <h2 className="text-2xl font-black text-primary uppercase tracking-tighter">Active Assets</h2>
            </div>
            <Link
              to="/sell"
              className="h-10 px-6 flex items-center rounded-xl bg-primary text-accent text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              + New Asset
            </Link>
          </div>
          
          {myListings.length === 0 ? (
            <div className="rounded-[2rem] glass p-12 text-center border-dashed border-primary/10">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-primary/30">No assets deployed</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
              {myListings.map((l) => (
                <ListingCard key={l._id} listing={l} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
  );
}
