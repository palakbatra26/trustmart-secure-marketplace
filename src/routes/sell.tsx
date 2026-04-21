import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { productsAPI } from "@/lib/mongodb";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { CATEGORIES } from "@/lib/trust";
import { Loader2, ImageIcon } from "lucide-react";

const SUGGESTED_IMAGES = [
  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=900&q=80",
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&q=80",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&q=80",
  "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=900&q=80",
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&q=80",
  "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=900&q=80",
];

export const Route = createFileRoute("/sell")({
  component: SellPage,
});

function SellPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    imageUrl: "",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error("Please log in to sell");
      void navigate({ to: "/login" });
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!form.title || form.title.length < 3) {
      toast.error("Title too short");
      return;
    }
    if (!form.description || form.description.length < 10) {
      toast.error("Description too short");
      return;
    }
    const price = parseFloat(form.price);
    if (isNaN(price) || price < 0) {
      toast.error("Invalid price");
      return;
    }
    if (!form.category) {
      toast.error("Pick a category");
      return;
    }
    setSubmitting(true);
    try {
      const res = await productsAPI.createProduct({
        title: form.title,
        description: form.description,
        price: price,
        category: form.category,
        images: form.imageUrl ? [form.imageUrl] : []
      });
      toast.success("Listing published!");
      void navigate({ to: "/product/$id", params: { id: res.data._id } });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create listing");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-extrabold text-primary sm:text-3xl">Post your ad</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Be honest and add a clear photo. Your trust score depends on it.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-5 rounded-2xl bg-surface p-5 shadow-[var(--shadow-card)] ring-1 ring-border sm:p-7"
      >
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            required
            placeholder="iPhone 13, 128GB, mint condition"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            maxLength={120}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="price">Price (₹)</Label>
            <Input
              id="price"
              type="number"
              min="0"
              required
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            required
            rows={5}
            placeholder="Condition, age, reason for selling, included accessories…"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            maxLength={2000}
          />
        </div>

        <div>
          <Label htmlFor="imageUrl" className="flex items-center gap-1.5">
            <ImageIcon size={14} /> Image URL (paste any photo URL — try Unsplash)
          </Label>
          <Input
            id="imageUrl"
            type="url"
            placeholder="https://images.unsplash.com/..."
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
          />

          <p className="mt-3 text-xs font-medium text-muted-foreground">Or pick a sample:</p>
          <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {SUGGESTED_IMAGES.map((url) => (
              <button
                type="button"
                key={url}
                onClick={() => setForm({ ...form, imageUrl: url })}
                className={`overflow-hidden rounded-lg ring-2 transition ${
                  form.imageUrl === url ? "ring-accent" : "ring-transparent hover:ring-border"
                }`}
              >
                <img src={url} alt="" className="aspect-square w-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>

          {form.image_url && (
            <div className="mt-4 overflow-hidden rounded-lg border border-border">
              <img
                src={form.image_url}
                alt="Preview"
                className="max-h-64 w-full object-cover"
                loading="lazy"
              />
            </div>
          )}
        </div>

        <Button
          type="submit"
          disabled={submitting}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {submitting && <Loader2 size={16} className="mr-2 animate-spin" />}
          Publish listing
        </Button>
      </form>
    </div>
  );
}
