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
import { Loader2, ImageIcon, Plus } from "lucide-react";

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
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-20">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-black text-primary uppercase tracking-tighter sm:text-6xl lg:text-7xl">Launch your <span className="text-accent text-glow">Listing.</span></h1>
        <p className="mt-4 text-sm font-bold uppercase tracking-[0.2em] text-primary/40 leading-relaxed">
          Initialize global trade protocol. Add visual telemetry for maximum engagement.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-12"
      >
        {/* Product Details Section */}
        <div className="card-3d space-y-8 rounded-[2.5rem] glass p-8 shadow-2xl ring-1 ring-primary/10 sm:p-12">
          <div className="flex items-center gap-4 border-b border-primary/5 pb-6">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-accent text-lg font-black shadow-lg">1</span>
            <h2 className="text-xl font-black text-primary uppercase tracking-tight">Product Telemetry</h2>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="title" className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Asset Nomenclature *</Label>
            <Input
              id="title"
              required
              placeholder="e.g. iPhone 13 Pro, Neural Engine v2"
              className="h-14 rounded-2xl bg-primary/5 border-none font-bold placeholder:text-primary/20"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              maxLength={120}
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price" className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Valuation (₹) *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                required
                className="h-14 rounded-2xl bg-primary/5 border-none font-bold placeholder:text-primary/20"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category" className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Sector *</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger id="category" className="h-14 rounded-2xl bg-primary/5 border-none font-bold text-primary ring-0 focus:ring-0">
                  <SelectValue placeholder="Select Sector" />
                </SelectTrigger>
                <SelectContent className="glass rounded-2xl border-primary/10">
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c} className="font-bold text-primary/70 focus:bg-primary/5">
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Technical Briefing *</Label>
              <button
                type="button"
                onClick={async () => {
                  if (!form.title) {
                    toast.error("Enter a title first");
                    return;
                  }
                  toast.loading("Neural engine generating...");
                  // Simulate AI generation
                  setTimeout(() => {
                    toast.dismiss();
                    const aiDesc = `PREMIUM SPECIFICATION: This ${form.title} is in excellent condition. Verified performance metrics meet all standard protocols. Includes original neural peripherals and secure packaging. Minimal aesthetic wear, 100% operational integrity.`;
                    setForm(prev => ({ ...prev, description: aiDesc }));
                    toast.success("Description optimized");
                  }, 1500);
                }}
                className="text-[10px] font-black uppercase tracking-widest text-accent hover:text-primary transition-colors flex items-center gap-1.5"
              >
                <Loader2 size={10} className="animate-spin group-hover:block hidden" />
                ✨ AI Optimize
              </button>
            </div>
            <Textarea
              id="description"
              required
              rows={4}
              placeholder="Operational history, condition parameters, included peripherals..."
              className="rounded-2xl bg-primary/5 border-none font-bold placeholder:text-primary/20 p-6 min-h-[150px]"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              maxLength={2000}
            />
          </div>

          <div className="space-y-4">
            <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">
              <ImageIcon size={14} /> Visual Telemetry * (max 5)
            </Label>
            
            <div className="flex flex-wrap gap-4">
              {form.images.map((img, idx) => (
                <div key={idx} className="relative w-24 h-24 rounded-2xl overflow-hidden shadow-lg animate-float" style={{ animationDelay: `${idx * 0.2}s` }}>
                  <img src={img} className="w-full h-full object-cover" alt={`Upload ${idx}`} />
                  <button 
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))}
                    className="absolute top-1 right-1 bg-destructive/90 text-white w-6 h-6 flex items-center justify-center text-xs rounded-lg backdrop-blur-md"
                  >
                    ×
                  </button>
                </div>
              ))}
              {form.images.length < 5 && (
                <button
                  type="button"
                  onClick={() => document.getElementById("file-upload")?.click()}
                  className="w-24 h-24 rounded-2xl border-2 border-dashed border-primary/20 bg-primary/5 flex flex-col items-center justify-center text-primary/40 hover:border-accent hover:text-accent hover:bg-accent/5 transition-all"
                >
                  <Plus size={24} />
                  <span className="text-[8px] font-black uppercase tracking-widest mt-2">Initialize</span>
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
        <div className="card-3d space-y-8 rounded-[2.5rem] glass p-8 shadow-2xl ring-1 ring-primary/10 sm:p-12">
          <div className="flex items-center gap-4 border-b border-primary/5 pb-6">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-accent text-lg font-black shadow-lg">2</span>
            <h2 className="text-xl font-black text-primary uppercase tracking-tight">Operator Authentication</h2>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sellerName" className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Operator Signature *</Label>
            <Input
              id="sellerName"
              required
              placeholder="Your full legal nomenclature"
              className="h-14 rounded-2xl bg-primary/5 border-none font-bold placeholder:text-primary/20"
              value={form.sellerName}
              onChange={(e) => setForm({ ...form, sellerName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sellerAddress" className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Geospatial Coordinates *</Label>
            <Textarea
              id="sellerAddress"
              required
              rows={2}
              placeholder="Sector, City, Grid ID, Postal Code"
              className="rounded-2xl bg-primary/5 border-none font-bold placeholder:text-primary/20 p-6"
              value={form.sellerAddress}
              onChange={(e) => setForm({ ...form, sellerAddress: e.target.value })}
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sellerContact" className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Primary Frequency *</Label>
              <Input
                id="sellerContact"
                required
                placeholder="+91 00000 00000"
                className="h-14 rounded-2xl bg-primary/5 border-none font-bold placeholder:text-primary/20"
                value={form.sellerContact}
                onChange={(e) => setForm({ ...form, sellerContact: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sellerWhatsApp" className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">WhatsApp Uplink</Label>
              <Input
                id="sellerWhatsApp"
                placeholder="Same as primary"
                className="h-14 rounded-2xl bg-primary/5 border-none font-bold placeholder:text-primary/20"
                value={form.sellerWhatsApp}
                onChange={(e) => setForm({ ...form, sellerWhatsApp: e.target.value })}
              />
            </div>
          </div>
        </div>

        <Button
          type="submit"
          disabled={submitting}
          className="w-full h-20 rounded-[2rem] bg-primary text-accent text-xl font-black uppercase tracking-[0.2em] shadow-[0_20px_40px_-10px_oklch(0.45_0.15_260)] hover:scale-[1.02] active:scale-95 transition-all glow-effect"
        >
          {submitting ? (
            <div className="flex items-center gap-3">
              <Loader2 size={24} className="animate-spin" />
              <span>Transmitting...</span>
            </div>
          ) : (
            "Broadcast Listing"
          )}
        </Button>
      </form>
    </div>
  );
}
