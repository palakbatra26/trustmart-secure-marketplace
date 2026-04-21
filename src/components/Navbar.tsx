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
    <header className="sticky top-0 z-40 w-full border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:gap-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-accent">
            <ShieldCheck size={20} strokeWidth={2.5} />
          </span>
          <span className="hidden text-xl font-extrabold tracking-tight text-primary sm:inline">
            TrustMart
          </span>
        </Link>

        <form onSubmit={onSearch} className="flex flex-1 items-center">
          <div className="relative w-full">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search cars, mobiles, furniture..."
              className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/30"
            />
          </div>
        </form>

        <div className="flex items-center gap-2">
          {user && (
            <Link
              to="/cart"
              className="relative grid h-10 w-10 place-items-center rounded-lg text-foreground hover:bg-muted"
              aria-label="Cart"
            >
              <ShoppingCart size={20} />
            </Link>
          )}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground font-semibold">
                  {(profile?.name ?? user.email ?? "U").charAt(0).toUpperCase()}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="space-y-1">
                  <div className="font-semibold">{profile?.name ?? "Account"}</div>
                  {profile && <TrustBadge score={profile.trust_score} size="sm" />}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate({ to: "/profile" })}>
                  <User size={16} className="mr-2" /> My Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ to: "/cart" })}>
                  <ShoppingCart size={16} className="mr-2" /> My Cart
                </DropdownMenuItem>
                {profile?.trust_score === 100 && profile.report_count === 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate({ to: "/admin" })}>
                      <LayoutDashboard size={16} className="mr-2" /> Admin Dashboard
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={async () => {
                    await signOut();
                    router.invalidate();
                    void navigate({ to: "/" });
                  }}
                >
                  <LogOut size={16} className="mr-2" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="outline"
              onClick={() => navigate({ to: "/login" })}
              className="border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground"
            >
              Login
            </Button>
          )}

          <Link
            to={user ? "/sell" : "/login"}
            className="inline-flex items-center gap-1.5 rounded-full border-2 border-primary bg-accent px-4 py-2 text-sm font-bold text-primary shadow-sm transition hover:shadow-md"
          >
            <Plus size={16} strokeWidth={3} />
            <span>SELL</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
