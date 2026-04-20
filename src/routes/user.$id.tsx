import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { TrustBadge } from "@/components/TrustBadge";
import { ListingCard, type ListingCardData } from "@/components/ListingCard";
import { Loader2, Star, AlertTriangle, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isSuspicious } from "@/lib/trust";
import { ReportDialog } from "./product.$id";

type PublicProfile = {
  id: string;
  name: string;
  trust_score: number;
  report_count: number;
  created_at: string;
};

type Review = {
  id: string;
  rating: number;
  feedback: string | null;
  created_at: string;
  reviewer: { name: string } | null;
};

export const Route = createFileRoute("/user/$id")({
  component: PublicProfilePage,
});

function PublicProfilePage() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [listings, setListings] = useState<ListingCardData[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: p }, { data: l }, { data: r }] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, name, trust_score, report_count, created_at")
        .eq("id", id)
        .maybeSingle(),
      supabase
        .from("listings")
        .select(
          "id, title, price, category, image_url, status, seller:profiles!listings_seller_id_fkey(id, name, trust_score)",
        )
        .eq("seller_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("reviews")
        .select("id, rating, feedback, created_at, reviewer:profiles!reviews_reviewer_id_fkey(name)")
        .eq("seller_id", id)
        .order("created_at", { ascending: false }),
    ]);
    setProfile((p as PublicProfile) ?? null);
    setListings((l ?? []) as unknown as ListingCardData[]);
    setReviews((r ?? []) as unknown as Review[]);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="grid place-items-center py-32 text-muted-foreground">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h2 className="text-xl font-bold">User not found</h2>
        <Link to="/" className="mt-3 inline-block text-primary underline">
          ← Back to home
        </Link>
      </div>
    );
  }

  const suspicious = isSuspicious(profile.trust_score);
  const isMe = user?.id === profile.id;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="rounded-2xl bg-surface p-6 ring-1 ring-border sm:p-8">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-primary text-2xl font-extrabold text-primary-foreground">
            {profile.name.charAt(0).toUpperCase()}
          </span>
          <div className="flex-1">
            <h1 className="text-2xl font-extrabold text-primary sm:text-3xl">{profile.name}</h1>
            <p className="text-sm text-muted-foreground">
              Member since {new Date(profile.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            <TrustBadge score={profile.trust_score} size="lg" />
            <p className="mt-1 text-xs text-muted-foreground">
              {profile.report_count} report{profile.report_count !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {suspicious && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-trust-low/10 p-3 text-sm text-trust-low">
            <AlertTriangle size={16} /> Suspicious user — proceed with caution.
          </div>
        )}

        {user && !isMe && (
          <div className="mt-4">
            <ReportDialog
              reportedUserId={profile.id}
              trigger={
                <Button variant="outline" size="sm" className="text-trust-low hover:text-trust-low">
                  <Flag size={14} className="mr-1.5" /> Report this user
                </Button>
              }
            />
          </div>
        )}
      </div>

      <section className="mt-8">
        <h2 className="text-xl font-bold text-primary">Listings ({listings.length})</h2>
        {listings.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No active listings.</p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {listings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-primary">Reviews ({reviews.length})</h2>
        {reviews.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No reviews yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {reviews.map((r) => (
              <li key={r.id} className="rounded-xl bg-surface p-4 ring-1 ring-border">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{r.reviewer?.name ?? "Anonymous"}</span>
                  <span className="flex items-center gap-0.5 text-trust-mid">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < r.rating ? "fill-current" : "opacity-30"}
                      />
                    ))}
                  </span>
                </div>
                {r.feedback && <p className="mt-1 text-sm text-foreground/85">{r.feedback}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
