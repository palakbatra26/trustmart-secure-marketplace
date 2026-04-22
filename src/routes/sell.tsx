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
    images: [] as string[],
    sellerName: "",
    sellerAddress: "",
    sellerContact: "",
    sellerWhatsApp: "",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error("Please log in to sell");
      void navigate({ to: "/login" });
    } else if (user) {
      setForm(prev => ({ ...prev, sellerName: user.name || "" }));
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    // Validations
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
    if (form.images.length === 0) {
      toast.error("At least one image is required");
      return;
    }
    if (!form.sellerName || !form.sellerAddress || !form.sellerContact) {
      toast.error("Please fill all mandatory seller details");
      return;
    }

    // Phone validation
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(form.sellerContact.replace(/\+/g, ''))) {
      toast.error("Invalid contact number (10-15 digits)");
      return;
    }

    setSubmitting(true);
    try {
      const res = await productsAPI.createProduct({
        ...form,
        price: price,
        images: form.images
      });
      toast.success("Listing published!");
      void navigate({ to: "/product/$id", params: { id: res.data._id } });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create listing");
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (form.images.length + files.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    Array.from(files).forEach(file => {
      if (file.size > 2 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 2MB)`);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(prev => ({ ...prev, images: [...prev.images, reader.result as string] }));
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-extrabold text-primary sm:text-3xl">Post your ad</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Be honest and add clear photos. Direct contact details help buyers reach you faster.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-8"
      >
        {/* Product Details Section */}
        <div className="space-y-5 rounded-2xl bg-surface p-5 shadow-[var(--shadow-card)] ring-1 ring-border sm:p-7">
          <h2 className="text-lg font-bold flex items-center gap-2 border-b pb-2 mb-4">
            <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
            Product Information
          </h2>
          
          <div>
            <Label htmlFor="title">Product Name *</Label>
            <Input
              id="title"
              required
              placeholder="e.g. iPhone 13, 128GB, mint condition"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              maxLength={120}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="price">Price (₹) *</Label>
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
              <Label htmlFor="category">Category *</Label>
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
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              required
              rows={4}
              placeholder="Condition, age, reason for selling, included accessories…"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              maxLength={2000}
            />
          </div>

          <div>
            <Label className="flex items-center gap-1.5 mb-2">
              <ImageIcon size={14} /> Product Images * (up to 5)
            </Label>
            
            <div className="flex flex-wrap gap-3 mb-4">
              {form.images.map((img, idx) => (
                <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border">
                  <img src={img} className="w-full h-full object-cover" alt={`Upload ${idx}`} />
                  <button 
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))}
                    className="absolute top-0 right-0 bg-red-500 text-white w-5 h-5 flex items-center justify-center text-xs rounded-bl-lg"
                  >
                    ×
                  </button>
                </div>
              ))}
              {form.images.length < 5 && (
                <button
                  type="button"
                  onClick={() => document.getElementById("file-upload")?.click()}
                  className="w-20 h-20 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition"
                >
                  <ImageIcon size={20} />
                  <span className="text-[10px] mt-1">Add</span>
                </button>
              )}
            </div>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>
        </div>

        {/* Seller Details Section */}
        <div className="space-y-5 rounded-2xl bg-surface p-5 shadow-[var(--shadow-card)] ring-1 ring-border sm:p-7">
          <h2 className="text-lg font-bold flex items-center gap-2 border-b pb-2 mb-4">
            <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
            Seller Information
          </h2>

          <div>
            <Label htmlFor="sellerName">Seller Full Name *</Label>
            <Input
              id="sellerName"
              required
              placeholder="Your full name"
              value={form.sellerName}
              onChange={(e) => setForm({ ...form, sellerName: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="sellerAddress">Selling Address *</Label>
            <Textarea
              id="sellerAddress"
              required
              rows={2}
              placeholder="House No, Street, City, State, Pincode"
              value={form.sellerAddress}
              onChange={(e) => setForm({ ...form, sellerAddress: e.target.value })}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="sellerContact">Contact Number *</Label>
              <Input
                id="sellerContact"
                required
                placeholder="+91 9876543210"
                value={form.sellerContact}
                onChange={(e) => setForm({ ...form, sellerContact: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="sellerWhatsApp">WhatsApp Number (Optional)</Label>
              <Input
                id="sellerWhatsApp"
                placeholder="Same as contact"
                value={form.sellerWhatsApp}
                onChange={(e) => setForm({ ...form, sellerWhatsApp: e.target.value })}
              />
            </div>
          </div>
        </div>

        <Button
          type="submit"
          disabled={submitting}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-lg font-bold shadow-lg"
        >
          {submitting && <Loader2 size={18} className="mr-2 animate-spin" />}
          Publish Listing
        </Button>
      </form>
    </div>
  );
}
