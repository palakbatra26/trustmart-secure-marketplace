import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { useAuth } from "@/lib/auth";
import { productsAPI } from "@/lib/mongodb";
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
import { Loader2 } from "lucide-react";

const schema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(10).max(2000),
  price: z.coerce.number().min(0).max(100000000),
  category: z.string().min(1),
  images: z.array(z.string().url()).optional(),
  imageUrl: z.string().url().optional(),
});

export const Route = createFileRoute("/edit/$id")({
  component: EditPage,
});

function EditPage() {
  const { id } = Route.useParams();
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    imageUrl: "",
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      void navigate({ to: "/login" });
      return;
    }
    (async () => {
      try {
        const res = await productsAPI.getProduct(id);
        const data = res.data;
        
        // Allow if user is owner OR user is admin
        const isOwner = data.seller?._id === user.id;
        const isAdmin = profile?.isAdmin;

        if (!isOwner && !isAdmin) {
          toast.error("Unauthorized: Neural clearance insufficient");
          void navigate({ to: "/product/$id", params: { id } });
          return;
        }

        setForm({
          title: data.title,
          description: data.description,
          price: String(data.price),
          category: data.category,
          imageUrl: data.imageUrl || (data.images?.[0] ?? ""),
        });
        setLoading(false);
      } catch (error) {
        toast.error("Listing not found in database");
        void navigate({ to: "/" });
      }
    })();
  }, [id, user, profile, authLoading, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await productsAPI.updateProduct(id, {
        title: form.title,
        description: form.description,
        price: Number(form.price),
        category: form.category,
        imageUrl: form.imageUrl,
        images: [form.imageUrl]
      });
      toast.success("Archive updated successfully");
      void navigate({ to: "/product/$id", params: { id } });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Transmission failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="grid place-items-center py-32 text-muted-foreground">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-extrabold text-primary sm:text-3xl">Edit listing</h1>
      <form
        onSubmit={submit}
        className="mt-5 space-y-5 rounded-2xl bg-surface p-5 shadow-[var(--shadow-card)] ring-1 ring-border sm:p-7"
      >
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            required
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
                <SelectValue />
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
            rows={5}
            required
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            maxLength={2000}
          />
        </div>
        <div>
          <Label htmlFor="imageUrl">Image URL</Label>
          <Input
            id="imageUrl"
            type="url"
            required
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
          />
          {form.imageUrl && (
            <img
              src={form.imageUrl}
              alt=""
              loading="lazy"
              className="mt-3 max-h-64 w-full rounded-lg object-cover"
            />
          )}
        </div>
        <Button
          type="submit"
          disabled={submitting}
          className="w-full bg-primary hover:bg-primary/90"
        >
          {submitting && <Loader2 size={16} className="mr-2 animate-spin" />}
          Save changes
        </Button>
      </form>
    </div>
  );
}
