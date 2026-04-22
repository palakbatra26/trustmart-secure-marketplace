import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ShieldCheck, Loader2, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });

  useEffect(() => {
    if (user) {
      void navigate({ to: "/" });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        if (!form.name || form.name.length < 2) {
          toast.error("Name is too short");
          return;
        }
        if (!form.email || !form.email.includes("@")) {
          toast.error("Invalid email");
          return;
        }
        if (!form.password || form.password.length < 6) {
          toast.error("Password must be at least 6 characters");
          return;
        }
        await register(form.name, form.email, form.password);
        toast.success("Welcome to TrustMart!");
        void navigate({ to: "/" });
      } else {
        if (!form.email || !form.password) {
          toast.error("Email and password required");
          return;
        }
        await login(form.email, form.password);
        toast.success("Welcome back!");
        void navigate({ to: "/" });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-md px-4 py-20">
      <div className="card-3d rounded-[2.5rem] glass p-8 shadow-2xl ring-1 ring-primary/10 sm:p-12">
        <div className="mb-10 flex flex-col items-center text-center">
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-primary text-accent shadow-lg animate-float">
            <ShieldCheck size={32} />
          </span>
          <h1 className="mt-6 text-3xl font-black text-primary uppercase tracking-tighter">
            {mode === "login" ? "Welcome back" : "Join the Elite"}
          </h1>
          <p className="mt-2 text-sm font-bold text-primary/40 uppercase tracking-widest">
            {mode === "login" ? "Terminal Authentication Required" : "Initialize New Neural Account"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === "signup" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Full Operator Name</Label>
                <Input
                  id="name"
                  required
                  className="h-12 rounded-xl bg-primary/5 border-none font-bold placeholder:text-primary/20"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  maxLength={80}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Contact Protocol (optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  className="h-12 rounded-xl bg-primary/5 border-none font-bold placeholder:text-primary/20"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  maxLength={20}
                  placeholder="+91 00000 00000"
                />
              </div>
            </>
          )}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Secure Email Address</Label>
            <Input
              id="email"
              type="email"
              required
              className="h-12 rounded-xl bg-primary/5 border-none font-bold placeholder:text-primary/20"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Access Cipher</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                className="h-12 rounded-xl bg-primary/5 border-none font-bold placeholder:text-primary/20 pr-12"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/40 hover:text-primary transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full h-14 rounded-2xl bg-primary text-accent font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : mode === "login" ? "Authorize" : "Initialize"}
          </Button>
        </form>

        <div className="mt-10 text-center text-xs font-bold uppercase tracking-widest text-primary/40">
          <span>
            {mode === "login" ? "Unauthorized?" : "Already Authorized?"}
          </span>{" "}
          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="text-primary hover:text-accent transition-colors underline underline-offset-4 decoration-primary/20"
          >
            {mode === "login" ? "Request Access" : "Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}