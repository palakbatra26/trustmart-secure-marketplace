import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { TrustBadge } from "@/components/TrustBadge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Loader2,
  Users,
  ShoppingBag,
  Flag,
  Check,
  X,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type ProfileAdmin = {
  id: string;
  name: string;
  email: string;
  trust_score: number;
  report_count: number;
  created_at: string;
  is_admin: boolean;
};

type ListingAdmin = {
  id: string;
  title: string;
  price: number;
  category: string;
  status: "active" | "sold" | "removed";
  created_at: string;
  seller: { id: string; name: string } | null;
};

type ReportDisplay = {
  id: string;
  reason: string;
  details: string | null;
  created_at: string;
  reporter: { name: string } | null;
  reported_user: { name: string } | null;
  listing_id: string | null;
};

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

function AdminPage() {
  const { profile } = useAuth();
  const [users, setUsers] = useState<ProfileAdmin[]>([]);
  const [listings, setListings] = useState<ListingAdmin[]>([]);
  const [reports, setReports] = useState<ReportDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"users" | "products" | "reports">("users");

  // Check if user is admin
  const isAdmin = profile?.trust_score === 100 && profile?.report_count === 0;

  const loadData = useCallback(async () => {
    setLoading(true);
    if (tab === "users") {
      const { data } = await supabase
        .from("profiles")
        .select("id, name, email, trust_score, report_count, created_at, is_admin")
        .order("created_at", { ascending: false });
      setUsers((data ?? []) as unknown as ProfileAdmin[]);
    } else if (tab === "products") {
      const { data } = await supabase
        .from("listings")
        .select("id, title, price, category, status, created_at, seller:profiles!listings_seller_id_fkey(id, name)")
        .order("created_at", { ascending: false })
        .limit(50);
      setListings((data ?? []) as unknown as ListingAdmin[]);
    } else if (tab === "reports") {
      const { data } = await supabase
        .from("reports")
        .select("id, reason, details, created_at, reporter:profiles!reports_reporter_id_fkey(name), reported_user:profiles!reports_reported_user_id_fkey(name), listing_id")
        .order("created_at", { ascending: false });
      setReports((data ?? []) as unknown as ReportDisplay[]);
    }
    setLoading(false);
  }, [tab]);

  useEffect(() => {
    if (!isAdmin) return;
    void loadData();
  }, [loadData, isAdmin]);

  const deleteUser = async (userId: string) => {
    if (!confirm("Delete this user and all their listings?")) return;
    const { error } = await supabase.from("profiles").delete().eq("id", userId);
    if (error) toast.error(error.message);
    else {
      toast.success("User deleted");
      void loadData();
    }
  };

  const deleteListing = async (listingId: string) => {
    if (!confirm("Delete this listing?")) return;
    const { error } = await supabase.from("listings").delete().eq("id", listingId);
    if (error) toast.error(error.message);
    else {
      toast.success("Listing deleted");
      void loadData();
    }
  };

  const resolveReport = async (reportId: string, approved: boolean) => {
    // Reports just exist - we'd need more columns to resolve them
    // For now we'll just show them
    toast.info(approved ? "Report approved" : "Report rejected");
  };

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <AlertTriangle size={48} className="mx-auto mb-4 text-amber-500" />
        <h1 className="text-2xl font-bold">Admin Access Only</h1>
        <p className="mt-2 text-muted-foreground">
          You need admin privileges to view this page.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">Admin Dashboard</h1>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-2 border-b border-border">
        <button
          onClick={() => setTab("users")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2 transition ${
            tab === "users"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users size={18} />
          Users ({users.length})
        </button>
        <button
          onClick={() => setTab("products")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2 transition ${
            tab === "products"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <ShoppingBag size={18} />
          Products
        </button>
        <button
          onClick={() => setTab("reports")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2 transition ${
            tab === "reports"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Flag size={18} />
          Reports
        </button>
      </div>

      {loading ? (
        <div className="grid place-items-center py-20 text-muted-foreground">
          <Loader2 className="animate-spin" />
        </div>
      ) : tab === "users" ? (
        <div className="rounded-xl border border-border bg-surface">
          <table className="w-full">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Trust</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Reports</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Joined</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-border">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {u.is_admin && (
                        <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs font-bold text-primary">
                          ADMIN
                        </span>
                      )}
                      <span className="font-medium">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {u.email}
                  </td>
                  <td className="px-4 py-3">
                    <TrustBadge score={u.trust_score} size="sm" />
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        u.report_count > 0
                          ? "font-semibold text-trust-low"
                          : "text-muted-foreground"
                      }
                    >
                      {u.report_count}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {!u.is_admin && (
                      <button
                        onClick={() => deleteUser(u.id)}
                        className="rounded p-1.5 text-trust-low hover:bg-trust-low/10"
                        title="Delete user"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              No users found
            </div>
          )}
        </div>
      ) : tab === "products" ? (
        <div className="rounded-xl border border-border bg-surface">
          <table className="w-full">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Title</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Seller</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Price</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Category</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((l) => (
                <tr key={l.id} className="border-b border-border">
                  <td className="px-4 py-3 font-medium">{l.title}</td>
                  <td className="px-4 py-3 text-sm">
                    {l.seller?.name ?? "Unknown"}
                  </td>
                  <td className="px-4 py-3">₹{l.price.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {l.category}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        l.status === "active"
                          ? "bg-green-100 text-green-700"
                          : l.status === "sold"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {l.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => deleteListing(l.id)}
                      className="rounded p-1.5 text-trust-low hover:bg-trust-low/10"
                      title="Delete listing"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {listings.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              No listings found
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="rounded-xl border border-border bg-surface py-12 text-center text-muted-foreground">
              No reports filed
            </div>
          ) : (
            reports.map((r) => (
              <div
                key={r.id}
                className="rounded-xl border border-border bg-surface p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold capitalize">{r.reason.replace("_", " ")}</span>
                      {r.listing_id && (
                        <span className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                          Has listing
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Reported by {r.reporter?.name ?? "Unknown"} on{" "}
                      {new Date(r.created_at).toLocaleDateString()}
                    </p>
                    {r.details && (
                      <p className="mt-2 text-sm">{r.details}</p>
                    )}
                    {r.reported_user && (
                      <p className="mt-2 text-sm text-trust-low">
                        Against: {r.reported_user.name}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => resolveReport(r.id, true)}
                      className="rounded bg-green-100 p-2 text-green-600 hover:bg-green-200"
                      title="Approve"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => resolveReport(r.id, false)}
                      className="rounded bg-red-100 p-2 text-red-600 hover:bg-red-200"
                      title="Reject"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}