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
<<<<<<< HEAD
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-16">
      {suspicious && listing.seller && (
        <div className="mb-8 flex items-start gap-4 rounded-3xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive backdrop-blur-xl animate-pulse ring-1 ring-destructive/10">
          <AlertTriangle size={20} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-black uppercase tracking-widest">High Risk Directive</p>
            <p className="font-bold opacity-80">
              Low trust index detected ({listing.seller.trustScore}). Neural verification failed.
=======
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      {suspicious && listing.seller && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-trust-low/40 bg-trust-low/10 p-3 text-sm text-trust-low">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-bold">Suspicious user warning</p>
            <p className="text-trust-low/80">
              This seller has a low trust score ({listing.seller.trustScore}). Proceed with extra
              caution.
>>>>>>> 71507b528455b95acdf709c06a7c967fcb72628d
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-10 lg:grid-cols-12">
        {/* Left Column: Media + Info */}
        <div className="lg:col-span-8 space-y-8">
          <div className="card-3d overflow-hidden rounded-[3rem] glass ring-1 ring-primary/10 shadow-3d">
            <img
              src={listing.imageUrl || listing.images?.[0] || "/placeholder.svg"}
              alt={listing.title}
              className="aspect-[16/10] w-full object-cover"
            />
          </div>

<<<<<<< HEAD
          <div className="rounded-[2.5rem] glass p-8 shadow-2xl ring-1 ring-primary/10 sm:p-12 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-primary/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 ring-1 ring-primary/10">
                  {listing.category}
                </span>
                <span className="text-xs font-bold text-primary/40 uppercase tracking-widest">Added {new Date(listing.createdAt).toLocaleDateString()}</span>
=======
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
>>>>>>> 71507b528455b95acdf709c06a7c967fcb72628d
              </div>
              <h1 className="text-4xl font-black text-primary leading-tight sm:text-5xl lg:text-6xl tracking-tighter uppercase">{listing.title}</h1>
              <p className="text-5xl font-black text-primary/90 text-glow tracking-tighter">{formatPrice(listing.price)}</p>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2 border-y border-primary/5 py-8">
              <div className="flex items-center gap-4">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/5 text-primary">
                  <Flag size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary/40">Secure Location</p>
                  <p className="text-sm font-bold text-primary/80">{listing.sellerAddress}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-accent/20 text-primary">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary/40">Item Integrity</p>
                  <p className="text-sm font-bold text-primary/80">Neural Verified</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary/40">Transmission Details</h3>
              <div className="whitespace-pre-wrap text-lg font-medium leading-relaxed text-primary/80">{listing.description}</div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="rounded-[2.5rem] glass p-8 shadow-2xl ring-1 ring-primary/10 sm:p-12">
            <h2 className="text-2xl font-black text-primary uppercase tracking-tighter flex items-center gap-3">
              <MessageCircle size={28} className="text-accent" />
              Intelligence Feed ({comments.length})
            </h2>

            {user && (
              <form onSubmit={submitComment} className="mt-8 relative group">
                <Textarea
                  className="w-full rounded-[1.5rem] bg-primary/5 border-none p-6 font-bold placeholder:text-primary/20 text-primary min-h-[120px] ring-1 ring-primary/5 focus:ring-primary/20 transition-all"
                  placeholder="Ask a question..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  maxLength={500}
                />
                <Button type="submit" className="absolute bottom-4 right-4 h-12 w-12 rounded-2xl bg-primary text-accent shadow-xl hover:scale-105 active:scale-95" disabled={!newComment.trim()}>
                  <Send size={18} />
                </Button>
              </form>
            )}

<<<<<<< HEAD
            <div className="mt-10 space-y-4">
              {loadingComments ? (
                <div className="py-10 text-center"><Loader2 className="animate-spin mx-auto text-primary/20" /></div>
              ) : comments.length === 0 ? (
                <p className="text-center py-10 text-xs font-black uppercase tracking-widest text-primary/20">No active transmissions</p>
              ) : (
                <ul className="space-y-4">
                  {comments.map((c) => (
                    <li key={c._id} className="rounded-2xl bg-primary/5 p-6 ring-1 ring-primary/5 hover:bg-primary/[0.07] transition-all">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <span className="text-xs font-black uppercase tracking-widest text-primary/60">{c.user?.name ?? "Unknown Entity"}</span>
                          <p className="font-bold text-primary/80">{c.content}</p>
                        </div>
                        {user?.id === c.user?._id && (
                          <button onClick={() => deleteComment(c._id)} className="h-8 w-8 rounded-lg bg-destructive/10 text-destructive grid place-items-center hover:bg-destructive transition-colors hover:text-white">
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
        </div>

        {/* Right Column: Sidebar */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="sticky top-28 space-y-6">
            <div className="rounded-[2.5rem] glass p-8 shadow-3d ring-1 ring-primary/10 animate-float">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary/40 mb-6">Operator Credentials</h3>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-[1.25rem] bg-primary text-accent grid place-items-center text-2xl font-black shadow-xl ring-2 ring-accent/20">
                  {(listing.sellerName || listing.seller?.name || "U").charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 space-y-1">
                  <p className="text-xl font-black text-primary uppercase tracking-tighter truncate leading-none">
                    {listing.sellerName || listing.seller?.name}
                  </p>
                  {listing.seller && <TrustBadge score={listing.seller.trustScore} size="sm" />}
                </div>
              </div>

              {!isOwner && listing.status === "active" && (
                <div className="mt-10 space-y-4">
                  <Button
                    onClick={onCall}
                    className="w-full h-16 rounded-2xl bg-primary text-accent font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    <ShoppingCart size={20} className="mr-3" />
                    Direct Call
=======
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
>>>>>>> 71507b528455b95acdf709c06a7c967fcb72628d
                  </Button>
                  
                  <Button
                    onClick={onWhatsApp}
                    className="w-full h-16 rounded-2xl bg-whatsapp text-white font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all ring-1 ring-white/10"
                  >
                    <MessageCircle size={20} className="mr-3" />
                    Secure Chat
                  </Button>
                  
                  <div className="rounded-2xl bg-primary/5 p-4 text-[10px] font-black uppercase tracking-widest text-primary/30 text-center leading-relaxed">
                    Verified Trade Only. Always meet in Public Sectors.
                  </div>
                </div>
              )}

              {isOwner && (
                <div className="mt-8 grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => navigate({ to: "/edit/$id", params: { id: listing._id } })}
                    className="h-12 rounded-xl glass font-black uppercase tracking-widest text-xs text-primary/70 hover:text-primary"
                  >
                    <Pencil size={14} className="mr-2" /> Modify
                  </Button>
                  <Button onClick={deleteListing} variant="destructive" className="h-12 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg">
                    <Trash2 size={14} className="mr-2" /> Expunge
                  </Button>
                </div>
              )}

              {user && !isOwner && listing.seller && (
                <ReportDialog
                  reportedUserId={listing.seller._id}
                  listingId={listing._id}
                  trigger={
                    <Button variant="ghost" className="mt-4 w-full h-12 rounded-xl font-black uppercase tracking-widest text-[10px] text-destructive/40 hover:text-destructive hover:bg-destructive/5 transition-all">
                      <Flag size={14} className="mr-2" /> Report Violation
                    </Button>
                  }
                />
              )}
            </div>

            <div className="rounded-[2.5rem] bg-primary p-8 text-primary-foreground shadow-3d glow-effect overflow-hidden relative">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay" />
              <div className="relative z-10 space-y-4">
                <p className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-accent">
                  <CheckCircle2 size={18} /> Protocol Safety
                </p>
                <ul className="space-y-4 text-sm font-bold text-primary-foreground/60">
                  <li className="flex items-start gap-3">
                    <span className="text-accent">01.</span> Public Sector Meeting Only
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent">02.</span> Neural Item Verification
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent">03.</span> No Signal Interception
                  </li>
                </ul>
              </div>
            </div>
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
