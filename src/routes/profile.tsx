import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { TrustBadge } from "@/components/TrustBadge";
import { ListingCard, type ListingCardData } from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Mail, Phone, AlertTriangle, CheckCircle2 } from "lucide-react";
import { formatPrice, isSuspicious } from "@/lib/trust";

type Deal = {
  id: string;
  status: "pending" | "completed";
  created_at: string;
  listing: { id: string; title: string; price: number; image_url: string } | null;
  seller: { id: string; name: string } | null;
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
    const [{ data: listings }, { data: deals }] = await Promise.all([
      supabase
        .from("listings")
        .select(
          "id, title, price, category, image_url, status, seller:profiles!listings_seller_id_fkey(id, name, trust_score)",
        )
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("deals")
        .select(
          "id, status, created_at, listing:listings(id, title, price, image_url), seller:profiles!deals_seller_id_fkey(id, name)",
        )
        .eq("buyer_id", user.id)
        .order("created_at", { ascending: false }),
    ]);
    setMyListings((listings ?? []) as unknown as ListingCardData[]);
    setMyDeals((deals ?? []) as unknown as Deal[]);
    setLoading(false);
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
    const { error } = await supabase
      .from("deals")
      .update({ status: "completed" })
      .eq("id", dealId);
    if (error) toast.error(error.message);
    else {
      toast.success("Deal completed — seller +10 trust");
      void load();
      void refreshProfile();
    }
  };

  if (loading || authLoading || !profile) {
    return (
      <div className="grid place-items-center py-32 text-muted-foreground">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  const suspicious = isSuspicious(profile.trust_score);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Header card */}
      <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/85 p-6 text-primary-foreground shadow-[var(--shadow-elevated)] sm:p-8">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-accent text-2xl font-extrabold text-primary">
            {profile.name.charAt(0).toUpperCase()}
          </span>
          <div className="flex-1">
            <h1 className="text-2xl font-extrabold sm:text-3xl">{profile.name}</h1>
            <div className="mt-1 flex flex-wrap gap-3 text-sm text-primary-foreground/80">
              <span className="inline-flex items-center gap-1">
                <Mail size={14} /> {profile.email}
              </span>
              {profile.phone && (
                <span className="inline-flex items-center gap-1">
                  <Phone size={14} /> {profile.phone}
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <TrustBadge score={profile.trust_score} size="lg" />
            <p className="mt-1 text-xs text-primary-foreground/70">
              {profile.report_count} report{profile.report_count !== 1 ? "s" : ""} received
            </p>
          </div>
        </div>

        {suspicious && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-trust-low/20 p-3 text-sm">
            <AlertTriangle size={16} /> Your account is flagged as suspicious. Build trust by
            completing deals and earning positive reviews.
          </div>
        )}
      </div>

      {/* My deals */}
      <section className="mt-8">
        <h2 className="text-xl font-bold text-primary">My purchases</h2>
        {myDeals.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            When you contact a seller, your deal appears here so you can confirm completion.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {myDeals.map((d) => (
              <li
                key={d.id}
                className="flex flex-col gap-3 rounded-xl bg-surface p-3 ring-1 ring-border sm:flex-row sm:items-center"
              >
                {d.listing && (
                  <Link to="/product/$id" params={{ id: d.listing.id }} className="shrink-0">
                    <img
                      src={d.listing.image_url}
                      alt=""
                      className="h-20 w-28 rounded-lg object-cover"
                      loading="lazy"
                    />
                  </Link>
                )}
                <div className="flex-1">
                  <p className="font-semibold">{d.listing?.title ?? "Removed listing"}</p>
                  <p className="text-sm text-muted-foreground">
                    Seller: {d.seller?.name ?? "—"}
                    {d.listing && (
                      <span className="ml-2 font-bold text-foreground">
                        {formatPrice(d.listing.price)}
                      </span>
                    )}
                  </p>
                </div>
                {d.status === "pending" ? (
                  <Button
                    size="sm"
                    onClick={() => completeDeal(d.id)}
                    className="bg-success text-success-foreground hover:bg-success/90"
                  >
                    <CheckCircle2 size={14} className="mr-1" /> Mark deal completed
                  </Button>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success">
                    <CheckCircle2 size={14} /> Completed
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* My listings */}
      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-primary">My listings</h2>
          <Link
            to="/sell"
            className="rounded-full bg-accent px-4 py-1.5 text-sm font-bold text-primary"
          >
            + New
          </Link>
        </div>
        {myListings.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">You haven't listed anything yet.</p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {myListings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
