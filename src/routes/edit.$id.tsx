import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
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
import { Loader2 } from "lucide-react";

const schema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(10).max(2000),
  price: z.coerce.number().min(0).max(100000000),
  category: z.string().min(1),
  image_url: z.string().url(),
});

export const Route = createFileRoute("/edit/$id")({
  component: EditPage,
});

function EditPage() {
  const { id } = Route.useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    image_url: "",
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      void navigate({ to: "/login" });
      return;
    }
    (async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("seller_id, title, description, price, category, image_url")
        .eq("id", id)
        .maybeSingle();
      if (error || !data) {
        toast.error("Listing not found");
        void navigate({ to: "/" });
        return;
      }
      if (data.seller_id !== user.id) {
        toast.error("You can only edit your own listings");
        void navigate({ to: "/product/$id", params: { id } });
        return;
      }
      setForm({
        title: data.title,
        description: data.description,
        price: String(data.price),
        category: data.category,
        image_url: data.image_url,
      });
      setLoading(false);
    })();
  }, [id, user, authLoading, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    const { error } = await supabase
      .from("listings")
      .update({
        title: parsed.data.title,
        description: parsed.data.description,
        price: parsed.data.price,
        category: parsed.data.category,
        image_url: parsed.data.image_url,
      })
      .eq("id", id);
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Listing updated");
      void navigate({ to: "/product/$id", params: { id } });
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
          <Label htmlFor="image_url">Image URL</Label>
          <Input
            id="image_url"
            type="url"
            required
            value={form.image_url}
            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
          />
          {form.image_url && (
            <img
              src={form.image_url}
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
