import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { productsAPI, commentsAPI, reviewsAPI, reportsAPI } from "@/lib/mongodb";
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
  Send,
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
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  imageUrl: string;
  sellerName: string;
  sellerAddress: string;
  sellerContact: string;
  sellerWhatsApp: string;
  status: "active" | "sold" | "removed";
  createdAt: string;
  seller: { _id: string; name: string; phone: string | null; trustScore: number; reportCount: number; email: string } | null;
};

type Review = {
  _id: string;
  rating: number;
  feedback: string | null;
  createdAt: string;
  reviewer: { name: string } | null;
};

type Comment = {
  _id: string;
  content: string;
  createdAt: string;
  user: { _id: string; name: string } | null;
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
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productsAPI.getProduct(id);
      const data = res.data;
      setListing(data as unknown as Listing);
      
      if (data.seller?._id) {
        const revRes = await reviewsAPI.getReviews(data.seller._id);
        setReviews(revRes.data);
      }
    } catch (error) {
      console.error(error);
      setListing(null);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    void load();
    void loadComments();
  }, [load]);

  const loadComments = async () => {
    setLoadingComments(true);
    try {
      const res = await commentsAPI.getComments(id);
      setComments(res.data);
    } catch (error) {
      console.error(error);
    }
    setLoadingComments(false);
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;
    try {
      await commentsAPI.createComment({
        productId: id,
        content: newComment.trim()
      });
      toast.success("Comment added");
      setNewComment("");
      void loadComments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add comment");
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!confirm("Delete this comment?")) return;
    try {
      await commentsAPI.deleteComment(commentId);
      toast.success("Comment deleted");
      void loadComments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete comment");
    }
  };

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

  const isOwner = user?.id === listing.seller?._id;
  const suspicious = listing.seller ? isSuspicious(listing.seller.trustScore) : false;

  const onWhatsApp = () => {
    if (!listing) return;
    window.open(whatsappLink(listing.title, listing.sellerWhatsApp || listing.sellerContact), "_blank", "noopener");
  };

  const onCall = () => {
    if (!listing) return;
    window.location.href = `tel:${listing.sellerContact}`;
  };

  const deleteListing = async () => {
    if (!confirm("Delete this listing?")) return;
    try {
      await productsAPI.deleteProduct(listing._id);
      toast.success("Listing deleted");
      void navigate({ to: "/" });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete listing");
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      {suspicious && listing.seller && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-trust-low/40 bg-trust-low/10 p-3 text-sm text-trust-low">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-bold">Suspicious user warning</p>
            <p className="text-trust-low/80">
              This seller has a low trust score ({listing.seller.trustScore}). Proceed with extra
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
              src={listing.imageUrl || listing.images?.[0] || "/placeholder.svg"}
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
            
            <div className="mt-6 flex flex-col gap-4 border-y py-4">
              <div className="flex items-start gap-2">
                <div className="mt-1 rounded-full bg-primary/10 p-1 text-primary">
                  <Flag size={14} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Selling Location</p>
                  <p className="text-sm font-medium">{listing.sellerAddress}</p>
                </div>
              </div>
            </div>

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
                  <li key={r._id} className="rounded-lg border border-border p-3">
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

            {user && !isOwner && listing.seller && (
              <div className="mt-4">
                <ReviewForm sellerId={listing.seller._id} onDone={load} />
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="mt-5 rounded-2xl bg-surface p-5 ring-1 ring-border sm:p-6">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <MessageCircle size={20} />
              Comments ({comments.length})
            </h2>

            {/* Add comment form */}
            {user && (
              <form onSubmit={submitComment} className="mt-4 flex gap-2">
                <Textarea
                  className="flex-1"
                  rows={2}
                  placeholder="Ask a question or leave a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  maxLength={500}
                />
                <Button type="submit" className="self-end" disabled={!newComment.trim()}>
                  <Send size={16} />
                </Button>
              </form>
            )}

            {/* Comments list */}
            {loadingComments ? (
              <div className="mt-4 text-center text-muted-foreground">
                <Loader2 className="animate-spin" />
              </div>
            ) : comments.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                No comments yet. Be the first to ask!
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {comments.map((c) => (
                  <li key={c._id} className="rounded-lg border border-border p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-semibold text-sm">
                          {c.user?.name ?? "Anonymous"}
                        </span>
                        <p className="mt-1 text-foreground/85">{c.content}</p>
                        <span className="mt-1 block text-xs text-muted-foreground">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {user?.id === c.user?._id && (
                        <button
                          onClick={() => deleteComment(c._id)}
                          className="rounded p-1 text-trust-low hover:bg-trust-low/10"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="rounded-2xl bg-surface p-5 ring-1 ring-border">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Seller Information
            </h3>
            <div className="mt-3 flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                {(listing.sellerName || listing.seller?.name || "U").charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold text-foreground">
                  {listing.sellerName || listing.seller?.name}
                </p>
                {listing.seller && <TrustBadge score={listing.seller.trustScore} size="sm" />}
              </div>
            </div>

            {!isOwner && listing.status === "active" && (
              <div className="mt-6 space-y-3">
                <Button
                  onClick={onCall}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-6"
                >
                  <ShoppingCart size={20} className="mr-2" />
                  Call Seller ({listing.sellerContact})
                </Button>
                
                <Button
                  onClick={onWhatsApp}
                  className="w-full bg-[var(--color-whatsapp)] text-white hover:bg-[var(--color-whatsapp)]/90 py-6"
                >
                  <MessageCircle size={20} className="mr-2" />
                  Chat on WhatsApp
                </Button>
                
                <p className="text-[10px] text-center text-muted-foreground">
                  Always meet in a public place. Inspect item before paying.
                </p>
              </div>
            )}

            {listing.status === "sold" && (
              <div className="mt-4 rounded-lg bg-muted p-3 text-center text-sm font-semibold text-muted-foreground">
                This item has been sold
              </div>
            )}

            {isOwner && (
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button
                  onClick={() => navigate({ to: "/edit/$id", params: { id: listing._id } })}
                  variant="outline"
                >
                  <Pencil size={16} className="mr-1.5" /> Edit
                </Button>
                <Button onClick={deleteListing} variant="destructive">
                  <Trash2 size={16} className="mr-1.5" /> Delete
                </Button>
              </div>
            )}

            {user && !isOwner && listing.seller && (
              <ReportDialog
                reportedUserId={listing.seller._id}
                listingId={listing._id}
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
    try {
      await reviewsAPI.createReview({
        sellerId,
        rating,
        feedback: feedback.trim() || undefined
      });
      toast.success("Review submitted — trust score updated");
      setFeedback("");
      onDone();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
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
    try {
      await reportsAPI.createReport({
        reportedUserId,
        reporterId: user.id,
        listingId: listingId ?? null,
        reason,
        details: details.trim() || undefined,
      });
      toast.success("Report filed. Trust score updated.");
      setOpen(false);
      setDetails("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to file report");
    } finally {
      setSubmitting(false);
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
