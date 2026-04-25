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
<<<<<<< HEAD
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
=======
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
>>>>>>> 71507b528455b95acdf709c06a7c967fcb72628d
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              maxLength={120}
            />
          </div>

<<<<<<< HEAD
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price" className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Valuation (₹) *</Label>
=======
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="price">Price (₹) *</Label>
>>>>>>> 71507b528455b95acdf709c06a7c967fcb72628d
              <Input
                id="price"
                type="number"
                min="0"
                required
<<<<<<< HEAD
                className="h-14 rounded-2xl bg-primary/5 border-none font-bold placeholder:text-primary/20"
=======
>>>>>>> 71507b528455b95acdf709c06a7c967fcb72628d
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>
<<<<<<< HEAD
            <div className="space-y-2">
              <Label htmlFor="category" className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Sector *</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger id="category" className="h-14 rounded-2xl bg-primary/5 border-none font-bold text-primary ring-0 focus:ring-0">
                  <SelectValue placeholder="Select Sector" />
                </SelectTrigger>
                <SelectContent className="glass rounded-2xl border-primary/10">
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c} className="font-bold text-primary/70 focus:bg-primary/5">
=======
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
>>>>>>> 71507b528455b95acdf709c06a7c967fcb72628d
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

<<<<<<< HEAD
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
=======
          <div>
            <Label htmlFor="description">Description *</Label>
>>>>>>> 71507b528455b95acdf709c06a7c967fcb72628d
            <Textarea
              id="description"
              required
              rows={4}
<<<<<<< HEAD
              placeholder="Operational history, condition parameters, included peripherals..."
              className="rounded-2xl bg-primary/5 border-none font-bold placeholder:text-primary/20 p-6 min-h-[150px]"
=======
              placeholder="Condition, age, reason for selling, included accessories…"
>>>>>>> 71507b528455b95acdf709c06a7c967fcb72628d
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              maxLength={2000}
            />
          </div>

<<<<<<< HEAD
          <div className="space-y-4">
            <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">
              <ImageIcon size={14} /> Visual Telemetry * (max 5)
            </Label>
            
            <div className="flex flex-wrap gap-4">
              {form.images.map((img, idx) => (
                <div key={idx} className="relative w-24 h-24 rounded-2xl overflow-hidden shadow-lg animate-float" style={{ animationDelay: `${idx * 0.2}s` }}>
=======
          <div>
            <Label className="flex items-center gap-1.5 mb-2">
              <ImageIcon size={14} /> Product Images * (up to 5)
            </Label>
            
            <div className="flex flex-wrap gap-3 mb-4">
              {form.images.map((img, idx) => (
                <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border">
>>>>>>> 71507b528455b95acdf709c06a7c967fcb72628d
                  <img src={img} className="w-full h-full object-cover" alt={`Upload ${idx}`} />
                  <button 
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))}
<<<<<<< HEAD
                    className="absolute top-1 right-1 bg-destructive/90 text-white w-6 h-6 flex items-center justify-center text-xs rounded-lg backdrop-blur-md"
=======
                    className="absolute top-0 right-0 bg-red-500 text-white w-5 h-5 flex items-center justify-center text-xs rounded-bl-lg"
>>>>>>> 71507b528455b95acdf709c06a7c967fcb72628d
                  >
                    ×
                  </button>
                </div>
              ))}
              {form.images.length < 5 && (
                <button
                  type="button"
                  onClick={() => document.getElementById("file-upload")?.click()}
<<<<<<< HEAD
                  className="w-24 h-24 rounded-2xl border-2 border-dashed border-primary/20 bg-primary/5 flex flex-col items-center justify-center text-primary/40 hover:border-accent hover:text-accent hover:bg-accent/5 transition-all"
                >
                  <Plus size={24} />
                  <span className="text-[8px] font-black uppercase tracking-widest mt-2">Initialize</span>
=======
                  className="w-20 h-20 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition"
                >
                  <ImageIcon size={20} />
                  <span className="text-[10px] mt-1">Add</span>
>>>>>>> 71507b528455b95acdf709c06a7c967fcb72628d
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
<<<<<<< HEAD
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
=======
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
>>>>>>> 71507b528455b95acdf709c06a7c967fcb72628d
              value={form.sellerName}
              onChange={(e) => setForm({ ...form, sellerName: e.target.value })}
            />
          </div>

<<<<<<< HEAD
          <div className="space-y-2">
            <Label htmlFor="sellerAddress" className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Geospatial Coordinates *</Label>
=======
          <div>
            <Label htmlFor="sellerAddress">Selling Address *</Label>
>>>>>>> 71507b528455b95acdf709c06a7c967fcb72628d
            <Textarea
              id="sellerAddress"
              required
              rows={2}
<<<<<<< HEAD
              placeholder="Sector, City, Grid ID, Postal Code"
              className="rounded-2xl bg-primary/5 border-none font-bold placeholder:text-primary/20 p-6"
=======
              placeholder="House No, Street, City, State, Pincode"
>>>>>>> 71507b528455b95acdf709c06a7c967fcb72628d
              value={form.sellerAddress}
              onChange={(e) => setForm({ ...form, sellerAddress: e.target.value })}
            />
          </div>

<<<<<<< HEAD
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sellerContact" className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Primary Frequency *</Label>
              <Input
                id="sellerContact"
                required
                placeholder="+91 00000 00000"
                className="h-14 rounded-2xl bg-primary/5 border-none font-bold placeholder:text-primary/20"
=======
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="sellerContact">Contact Number *</Label>
              <Input
                id="sellerContact"
                required
                placeholder="+91 9876543210"
>>>>>>> 71507b528455b95acdf709c06a7c967fcb72628d
                value={form.sellerContact}
                onChange={(e) => setForm({ ...form, sellerContact: e.target.value })}
              />
            </div>
<<<<<<< HEAD
            <div className="space-y-2">
              <Label htmlFor="sellerWhatsApp" className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">WhatsApp Uplink</Label>
              <Input
                id="sellerWhatsApp"
                placeholder="Same as primary"
                className="h-14 rounded-2xl bg-primary/5 border-none font-bold placeholder:text-primary/20"
=======
            <div>
              <Label htmlFor="sellerWhatsApp">WhatsApp Number (Optional)</Label>
              <Input
                id="sellerWhatsApp"
                placeholder="Same as contact"
>>>>>>> 71507b528455b95acdf709c06a7c967fcb72628d
                value={form.sellerWhatsApp}
                onChange={(e) => setForm({ ...form, sellerWhatsApp: e.target.value })}
              />
            </div>
          </div>
        </div>

        <Button
          type="submit"
          disabled={submitting}
<<<<<<< HEAD
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
=======
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-lg font-bold shadow-lg"
        >
          {submitting && <Loader2 size={18} className="mr-2 animate-spin" />}
          Publish Listing
>>>>>>> 71507b528455b95acdf709c06a7c967fcb72628d
        </Button>
      </form>
    </div>
  );
}
