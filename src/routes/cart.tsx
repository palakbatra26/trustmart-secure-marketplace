import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { TrustBadge } from "@/components/TrustBadge";
import { Button } from "@/components/ui/button";
import { formatPrice, whatsappLink } from "@/lib/trust";
import { toast } from "sonner";
import { Loader2, Trash2, MessageCircle, ShoppingCart } from "lucide-react";

type CartRow = {
  id: string;
  listing: {
    id: string;
    title: string;
    price: number;
    image_url: string;
    status: "active" | "sold" | "removed";
    seller: { id: string; name: string; trust_score: number } | null;
  } | null;
};

export const Route = createFileRoute("/cart")({
  component: CartPage,
});

function CartPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<CartRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("cart_items")
      .select(
        "id, listing:listings(id, title, price, image_url, status, seller:profiles!listings_seller_id_fkey(id, name, trust_score))",
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setItems((data ?? []) as unknown as CartRow[]);
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

  const remove = async (cartId: string) => {
    await supabase.from("cart_items").delete().eq("id", cartId);
    void load();
  };

  const buyOnWhatsApp = async (item: CartRow) => {
    if (!item.listing || !item.listing.seller || !user) return;
    await supabase.from("deals").upsert(
      {
        listing_id: item.listing.id,
        buyer_id: user.id,
        seller_id: item.listing.seller.id,
      },
      { onConflict: "listing_id,buyer_id" },
    );
    window.open(
      whatsappLink(item.listing.title, item.listing.price),
      "_blank",
      "noopener",
    );
    toast.success("Track your deal in your profile");
  };

  if (loading || authLoading) {
    return (
      <div className="grid place-items-center py-32 text-muted-foreground">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  const total = items.reduce(
    (s, i) => s + (i.listing && i.listing.status === "active" ? Number(i.listing.price) : 0),
    0,
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="flex items-center gap-2 text-2xl font-extrabold text-primary sm:text-3xl">
        <ShoppingCart /> Your cart
      </h1>

      {items.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border bg-surface py-16 text-center">
          <p>Your cart is empty.</p>
          <Link
            to="/"
            className="mt-3 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Browse listings
          </Link>
        </div>
      ) : (
        <>
          <ul className="mt-6 space-y-3">
            {items.map((item) => {
              if (!item.listing)
                return (
                  <li
                    key={item.id}
                    className="flex items-center justify-between rounded-xl bg-surface p-3 ring-1 ring-border"
                  >
                    <span className="text-muted-foreground">Listing no longer available</span>
                    <Button variant="ghost" size="sm" onClick={() => remove(item.id)}>
                      <Trash2 size={16} />
                    </Button>
                  </li>
                );

              return (
                <li
                  key={item.id}
                  className="flex flex-col gap-3 rounded-xl bg-surface p-3 ring-1 ring-border sm:flex-row sm:items-center"
                >
                  <Link
                    to="/product/$id"
                    params={{ id: item.listing.id }}
                    className="shrink-0"
                  >
                    <img
                      src={item.listing.image_url}
                      alt={item.listing.title}
                      loading="lazy"
                      className="h-24 w-32 rounded-lg object-cover"
                    />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link
                      to="/product/$id"
                      params={{ id: item.listing.id }}
                      className="line-clamp-2 font-semibold text-foreground hover:underline"
                    >
                      {item.listing.title}
                    </Link>
                    <p className="mt-0.5 text-lg font-bold">{formatPrice(item.listing.price)}</p>
                    {item.listing.seller && (
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{item.listing.seller.name}</span>
                        <TrustBadge score={item.listing.seller.trust_score} size="sm" showLabel={false} />
                      </div>
                    )}
                    {item.listing.status === "sold" && (
                      <p className="mt-1 text-xs font-semibold text-muted-foreground">SOLD</p>
                    )}
                  </div>
                  <div className="flex gap-2 sm:flex-col">
                    {item.listing.status === "active" && (
                      <Button
                        size="sm"
                        onClick={() => buyOnWhatsApp(item)}
                        className="bg-[var(--color-whatsapp)] text-white hover:bg-[var(--color-whatsapp)]/90"
                      >
                        <MessageCircle size={14} className="mr-1" /> Buy
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => remove(item.id)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-6 flex items-center justify-between rounded-xl bg-primary p-4 text-primary-foreground">
            <div>
              <p className="text-xs uppercase text-primary-foreground/70">Total</p>
              <p className="text-2xl font-extrabold">{formatPrice(total)}</p>
            </div>
            <p className="max-w-xs text-right text-xs text-primary-foreground/70">
              Checkout happens via WhatsApp on each item.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
