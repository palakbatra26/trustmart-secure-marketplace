import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { TrustBadge } from "@/components/TrustBadge";
import { Button } from "@/components/ui/button";
import { formatPrice, isSuspicious, whatsappLink } from "@/lib/trust";
import { toast } from "sonner";
import {
  Loader2,
  MessageCircle,
  ShoppingCart,
  Flag,
  Pencil,
  Trash2,
  AlertTriangle,
  Star,
  CheckCircle2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type Listing = {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  status: "active" | "sold" | "removed";
  created_at: string;
  seller: { id: string; name: string; phone: string | null; trust_score: number; report_count: number } | null;
};

type Review = {
  id: string;
  rating: number;
  feedback: string | null;
  created_at: string;
  reviewer: { name: string } | null;
};

export const Route = createFileRoute("/product/$id")({
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { id } = Route.useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [listing, setListing] = useState<Listing | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("listings")
      .select(
        "id, title, description, price, category, image_url, status, created_at, seller:profiles!listings_seller_id_fkey(id, name, phone, trust_score, report_count)",
      )
      .eq("id", id)
      .maybeSingle();
    if (error || !data) {
      setListing(null);
    } else {
      setListing(data as unknown as Listing);
      const sellerId = (data as unknown as Listing).seller?.id;
      if (sellerId) {
        const { data: rev } = await supabase
          .from("reviews")
          .select("id, rating, feedback, created_at, reviewer:profiles!reviews_reviewer_id_fkey(name)")
          .eq("seller_id", sellerId)
          .order("created_at", { ascending: false })
          .limit(10);
        setReviews((rev ?? []) as unknown as Review[]);
      }
    }
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

  if (!listing || !listing.seller) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h2 className="text-xl font-bold">Listing not found</h2>
        <Link to="/" className="mt-3 inline-block text-primary underline">
          ← Back to home
        </Link>
      </div>
    );
  }

  const isOwner = user?.id === listing.seller.id;
  const suspicious = isSuspicious(listing.seller.trust_score);

  const onWhatsApp = async () => {
    if (!user) {
      toast.info("Log in to contact the seller");
      void navigate({ to: "/login" });
      return;
    }
    if (isOwner) {
      toast.error("You can't buy your own listing");
      return;
    }
    // Create a pending deal so the buyer can mark it complete later
    await supabase
      .from("deals")
      .upsert(
        {
          listing_id: listing.id,
          buyer_id: user.id,
          seller_id: listing.seller!.id,
        },
        { onConflict: "listing_id,buyer_id" },
      );
    window.open(whatsappLink(listing.title, listing.price), "_blank", "noopener");
  };

  const addToCart = async () => {
    if (!user) {
      void navigate({ to: "/login" });
      return;
    }
    if (isOwner) {
      toast.error("You can't add your own listing to cart");
      return;
    }
    const { error } = await supabase.from("cart_items").insert({
      user_id: user.id,
      listing_id: listing.id,
    });
    if (error) {
      if (error.code === "23505") toast.info("Already in your cart");
      else toast.error(error.message);
    } else {
      toast.success("Added to cart");
    }
  };

  const deleteListing = async () => {
    if (!confirm("Delete this listing?")) return;
    const { error } = await supabase.from("listings").delete().eq("id", listing.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Listing deleted");
      void navigate({ to: "/" });
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      {suspicious && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-trust-low/40 bg-trust-low/10 p-3 text-sm text-trust-low">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-bold">Suspicious user warning</p>
            <p className="text-trust-low/80">
              This seller has a low trust score ({listing.seller.trust_score}). Proceed with extra
              caution.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Image + description */}
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-2xl bg-surface ring-1 ring-border">
            <img
              src={listing.image_url}
              alt={listing.title}
              className="aspect-[4/3] w-full object-cover"
            />
          </div>

          <div className="mt-5 rounded-2xl bg-surface p-5 ring-1 ring-border sm:p-6">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {listing.category}
            </span>
            <h1 className="mt-1 text-2xl font-extrabold text-primary sm:text-3xl">{listing.title}</h1>
            <p className="mt-2 text-3xl font-bold text-foreground">{formatPrice(listing.price)}</p>
            <div className="mt-4 whitespace-pre-wrap text-foreground/85">{listing.description}</div>
          </div>

          {/* Reviews */}
          <div className="mt-5 rounded-2xl bg-surface p-5 ring-1 ring-border sm:p-6">
            <h2 className="text-lg font-bold">Seller reviews</h2>
            {reviews.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">No reviews yet.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {reviews.map((r) => (
                  <li key={r.id} className="rounded-lg border border-border p-3">
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

            {user && !isOwner && profile && (
              <div className="mt-4">
                <ReviewForm sellerId={listing.seller.id} onDone={load} />
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="rounded-2xl bg-surface p-5 ring-1 ring-border">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Seller
            </h3>
            <Link
              to="/user/$id"
              params={{ id: listing.seller.id }}
              className="mt-2 flex items-center gap-3 group"
            >
              <span className="grid h-12 w-12 place-items-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                {listing.seller.name.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold text-foreground group-hover:underline">
                  {listing.seller.name}
                </p>
                <TrustBadge score={listing.seller.trust_score} size="sm" />
              </div>
            </Link>

            {!isOwner && listing.status === "active" && (
              <>
                <Button
                  onClick={onWhatsApp}
                  className="mt-4 w-full bg-[var(--color-whatsapp)] text-white hover:bg-[var(--color-whatsapp)]/90"
                >
                  <MessageCircle size={18} className="mr-2" />
                  Contact / Buy on WhatsApp
                </Button>
                <Button
                  onClick={addToCart}
                  variant="outline"
                  className="mt-2 w-full border-primary/20 text-primary hover:bg-muted"
                >
                  <ShoppingCart size={18} className="mr-2" /> Add to cart
                </Button>
              </>
            )}

            {listing.status === "sold" && (
              <div className="mt-4 rounded-lg bg-muted p-3 text-center text-sm font-semibold text-muted-foreground">
                This item has been sold
              </div>
            )}

            {isOwner && (
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button
                  onClick={() => navigate({ to: "/edit/$id", params: { id: listing.id } })}
                  variant="outline"
                >
                  <Pencil size={16} className="mr-1.5" /> Edit
                </Button>
                <Button onClick={deleteListing} variant="destructive">
                  <Trash2 size={16} className="mr-1.5" /> Delete
                </Button>
              </div>
            )}

            {user && !isOwner && (
              <ReportDialog
                reportedUserId={listing.seller.id}
                listingId={listing.id}
                trigger={
                  <Button variant="ghost" className="mt-2 w-full text-trust-low hover:text-trust-low">
                    <Flag size={16} className="mr-1.5" /> Report this listing
                  </Button>
                }
              />
            )}
          </div>

          <div className="rounded-2xl bg-primary p-5 text-primary-foreground">
            <p className="flex items-center gap-2 text-sm font-semibold text-accent">
              <CheckCircle2 size={16} /> TrustMart Safety
            </p>
            <ul className="mt-2 space-y-1 text-sm text-primary-foreground/80">
              <li>• Always meet in a public place</li>
              <li>• Inspect before paying</li>
              <li>• Never share OTP or bank details</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ReviewForm({ sellerId, onDone }: { sellerId: string; onDone: () => void }) {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    const { error } = await supabase.from("reviews").upsert(
      {
        seller_id: sellerId,
        reviewer_id: user.id,
        rating,
        feedback: feedback.trim() || null,
      },
      { onConflict: "seller_id,reviewer_id" },
    );
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Review submitted — trust score updated");
      setFeedback("");
      onDone();
    }
  };

  return (
    <form onSubmit={submit} className="rounded-lg border border-border bg-background p-3">
      <Label className="text-sm font-semibold">Rate this seller</Label>
      <div className="mt-2 flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            className={`text-trust-mid transition ${n <= rating ? "scale-110" : "opacity-40"}`}
            aria-label={`${n} stars`}
          >
            <Star size={22} className={n <= rating ? "fill-current" : ""} />
          </button>
        ))}
      </div>
      <Textarea
        className="mt-2"
        rows={2}
        placeholder="Optional feedback…"
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        maxLength={500}
      />
      <Button
        type="submit"
        disabled={submitting}
        size="sm"
        className="mt-2 bg-primary hover:bg-primary/90"
      >
        Submit review
      </Button>
    </form>
  );
}

export function ReportDialog({
  reportedUserId,
  listingId,
  trigger,
}: {
  reportedUserId: string;
  listingId?: string;
  trigger: React.ReactNode;
}) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<"fake_product" | "scam_attempt" | "other">("fake_product");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!user) return;
    setSubmitting(true);
    const { error } = await supabase.from("reports").insert({
      reported_user_id: reportedUserId,
      reporter_id: user.id,
      listing_id: listingId ?? null,
      reason,
      details: details.trim() || null,
    });
    setSubmitting(false);
    if (error) {
      if (error.code === "23505") toast.info("You already reported this");
      else toast.error(error.message);
    } else {
      toast.success("Report filed. Trust score updated.");
      setOpen(false);
      setDetails("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report this user</DialogTitle>
          <DialogDescription>
            Reports lower a seller's trust score by 15. Don't abuse this.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Reason</Label>
            <Select value={reason} onValueChange={(v) => setReason(v as typeof reason)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fake_product">Fake product</SelectItem>
                <SelectItem value="scam_attempt">Scam attempt</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Details (optional)</Label>
            <Textarea
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              maxLength={500}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={submit} disabled={submitting}>
            File report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
