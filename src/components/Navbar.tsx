import { useState } from "react";
import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { Search, Plus, User, ShoppingCart, LogOut, ShieldCheck, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TrustBadge } from "@/components/TrustBadge";

export function Navbar() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const router = useRouter();
  const [q, setQ] = useState("");

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    void navigate({ to: "/", search: { q: q.trim() || undefined, category: undefined } });
  };

  return (
    <header className="sticky top-0 z-50 w-full glass">
      <div className="mx-auto flex h-20 max-w-7xl items-center gap-6 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-3 shrink-0 group transition-transform active:scale-95">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-accent shadow-lg group-hover:rotate-6 transition-transform">
            <ShieldCheck size={28} strokeWidth={2.5} />
          </span>
          <div className="hidden sm:block leading-none">
            <span className="text-2xl font-black tracking-tighter text-primary uppercase block">
              TrustMart
            </span>
            <span className="text-[10px] font-black tracking-[0.2em] text-primary/40 uppercase">Secure Market</span>
          </div>
        </Link>

        <form onSubmit={onSearch} className="flex flex-1 items-center max-w-2xl mx-auto">
          <div className="relative w-full group">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors"
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products..."
              className="w-full h-12 rounded-2xl border border-primary/10 bg-white/50 dark:bg-black/20 pl-12 pr-4 text-sm font-semibold outline-none placeholder:text-primary/30 focus:bg-white dark:focus:bg-black focus:ring-4 focus:ring-primary/5 transition-all shadow-inner"
            />
          </div>
        </form>

        <div className="flex items-center gap-3">
          {user && (
            <Link
              to="/cart"
              className="relative grid h-12 w-12 place-items-center rounded-2xl text-primary/60 hover:text-primary hover:bg-primary/5 transition-all"
              aria-label="Cart"
            >
              <ShoppingCart size={22} />
              <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-accent ring-2 ring-white animate-pulse" />
            </Link>
          )}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-accent font-black shadow-lg hover:scale-105 active:scale-95 transition-transform">
                  {(profile?.name ?? user.email ?? "U").charAt(0).toUpperCase()}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 glass mt-2 p-2 rounded-2xl border-primary/10 shadow-2xl">
                <DropdownMenuLabel className="p-3">
                  <div className="font-black text-primary uppercase tracking-tight">{profile?.name ?? "Explorer"}</div>
                  <div className="text-[10px] text-primary/40 font-bold truncate mb-3">{user.email}</div>
                  {profile && <TrustBadge score={profile.trustScore ?? profile.trust_score} size="sm" />}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-primary/5" />
                <DropdownMenuItem onClick={() => navigate({ to: "/profile" })} className="rounded-xl p-3 font-bold text-primary/70 hover:text-primary">
                  <User size={18} className="mr-3 text-accent" /> My Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ to: "/cart" })} className="rounded-xl p-3 font-bold text-primary/70 hover:text-primary">
                  <ShoppingCart size={18} className="mr-3 text-accent" /> Shopping Cart
                </DropdownMenuItem>
                {profile?.isAdmin && (
                  <>
                    <DropdownMenuSeparator className="bg-primary/5" />
                    <DropdownMenuItem onClick={() => navigate({ to: "/admin" })} className="rounded-xl p-3 font-bold text-primary/70 hover:text-primary bg-primary/5">
                      <LayoutDashboard size={18} className="mr-3 text-primary" /> Admin Dashboard
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator className="bg-primary/5" />
                <DropdownMenuItem
                  className="rounded-xl p-3 font-bold text-destructive hover:bg-destructive/10"
                  onClick={async () => {
                    await signOut();
                    router.invalidate();
                    void navigate({ to: "/" });
                  }}
                >
                  <LogOut size={18} className="mr-3" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="ghost"
              onClick={() => navigate({ to: "/login" })}
              className="h-12 px-6 rounded-2xl font-black uppercase tracking-widest text-primary hover:bg-primary/5"
            >
              Login
            </Button>
          )}

          <Link
            to={user ? "/sell" : "/login"}
            className="hidden sm:inline-flex h-12 items-center gap-2 rounded-2xl bg-primary px-6 text-xs font-black uppercase tracking-[0.2em] text-accent shadow-xl hover:scale-105 active:scale-95 transition-all"
          >
            <Plus size={18} strokeWidth={3} />
            <span>Sell Product</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
