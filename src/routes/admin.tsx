import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { adminAPI } from "@/lib/mongodb";
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
  Database,
  Terminal
} from "lucide-react";

type ProfileAdmin = {
  _id: string;
  name: string;
  email: string;
  trustScore: number;
  reportCount: number;
  createdAt: string;
  isAdmin: boolean;
};

type ListingAdmin = {
  _id: string;
  title: string;
  price: number;
  category: string;
  status: "active" | "sold" | "removed";
  createdAt: string;
  seller: { _id: string; name: string } | null;
};

type ReportDisplay = {
  _id: string;
  reason: string;
  details: string | null;
  createdAt: string;
  reporterId: { name: string } | null;
  reportedUserId: { name: string } | null;
  listingId: string | null;
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

  const isAdmin = profile?.isAdmin || (profile?.trustScore === 100 && profile?.reportCount === 0);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === "users") {
        const res = await adminAPI.getUsers();
        setUsers(res.data);
      } else if (tab === "products") {
        const res = await adminAPI.getProducts();
        setListings(res.data);
      } else if (tab === "reports") {
        const res = await adminAPI.getReports();
        setReports(res.data);
      }
    } catch (error) {
      console.error(error);
      toast.error("Telemetry failed to sync");
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    if (!isAdmin) return;
    void loadData();
  }, [loadData, isAdmin]);

  const deleteUser = async (userId: string) => {
    if (!confirm("EXPUNGE USER: This action is irreversible. Proceed?")) return;
    try {
      await adminAPI.deleteUser(userId);
      toast.success("User expunged from neural network");
      void loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const deleteListing = async (listingId: string) => {
    if (!confirm("DELETE ASSET: Proceed?")) return;
    try {
      await adminAPI.deleteProduct(listingId);
      toast.success("Product deleted successfully");
      void loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md px-4 py-32 text-center">
        <div className="card-3d rounded-[2.5rem] glass p-12 shadow-2xl">
          <AlertTriangle size={64} className="mx-auto mb-6 text-destructive animate-pulse" />
          <h1 className="text-3xl font-black uppercase tracking-tighter text-primary">Access Denied</h1>
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-primary/40 leading-relaxed">
            Unauthorized attempt logged. Admin clearance required for Neural Command Center.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-20">
      <div className="mb-12 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <h1 className="text-4xl font-black text-primary uppercase tracking-tighter sm:text-5xl lg:text-6xl">Admin <span className="text-accent text-glow">Dashboard.</span></h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/30">Master Control Terminal v4.0.2</p>
        </div>
        <div className="flex gap-4">
          <div className="glass rounded-2xl p-4 flex items-center gap-4 ring-1 ring-primary/5">
            <Database className="text-accent" size={24} />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-primary/40">Network Status</p>
              <p className="text-sm font-black text-success">SYNCHRONIZED</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-10 flex flex-wrap gap-2 p-1.5 rounded-[2rem] glass ring-1 ring-primary/5 w-fit mx-auto sm:mx-0">
        <button
          onClick={() => setTab("users")}
          className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
            tab === "users" ? "bg-primary text-accent shadow-xl scale-105" : "text-primary/40 hover:text-primary hover:bg-primary/5"
          }`}
        >
          <Users size={18} />
          Users ({users.length})
        </button>
        <button
          onClick={() => setTab("products")}
          className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
            tab === "products" ? "bg-primary text-accent shadow-xl scale-105" : "text-primary/40 hover:text-primary hover:bg-primary/5"
          }`}
        >
          <ShoppingBag size={18} />
          Products
        </button>
        <button
          onClick={() => setTab("reports")}
          className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
            tab === "reports" ? "bg-primary text-accent shadow-xl scale-105" : "text-primary/40 hover:text-primary hover:bg-primary/5"
          }`}
        >
          <Flag size={18} />
          Reports
        </button>
      </div>

      {loading ? (
        <div className="grid place-items-center py-32 text-primary/10">
          <Loader2 className="animate-spin h-16 w-16" />
        </div>
      ) : tab === "users" ? (
        <div className="rounded-[2.5rem] glass overflow-hidden shadow-2xl ring-1 ring-primary/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-primary/5 text-[10px] font-black uppercase tracking-widest text-primary/40">
                  <th className="px-8 py-6">Operator Signature</th>
                  <th className="px-8 py-6">Neural Frequency</th>
                  <th className="px-8 py-6">Trust Index</th>
                  <th className="px-8 py-6">Violations</th>
                  <th className="px-8 py-6">Commissioned</th>
                  <th className="px-8 py-6">Terminal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-primary/[0.02] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        {u.isAdmin && (
                          <span className="rounded-lg bg-accent/20 px-2 py-1 text-[8px] font-black text-primary border border-accent/20">
                            CORE
                          </span>
                        )}
                        <span className="font-bold text-primary">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-xs font-bold text-primary/40">{u.email}</td>
                    <td className="px-8 py-6"><TrustBadge score={u.trustScore} size="sm" /></td>
                    <td className="px-8 py-6">
                      <span className={`text-xs font-black ${u.reportCount > 0 ? "text-destructive" : "text-primary/20"}`}>
                        {u.reportCount}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-xs font-bold text-primary/40">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-6">
                      {!u.isAdmin && (
                        <button
                          onClick={() => deleteUser(u._id)}
                          className="h-10 w-10 rounded-xl bg-destructive/10 text-destructive grid place-items-center hover:bg-destructive hover:text-white transition-all scale-0 group-hover:scale-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : tab === "products" ? (
        <div className="rounded-[2.5rem] glass overflow-hidden shadow-2xl ring-1 ring-primary/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-primary/5 text-[10px] font-black uppercase tracking-widest text-primary/40">
                  <th className="px-8 py-6">Asset Title</th>
                  <th className="px-8 py-6">Source Operator</th>
                  <th className="px-8 py-6">Valuation</th>
                  <th className="px-8 py-6">Sector</th>
                  <th className="px-8 py-6">Status</th>
                  <th className="px-8 py-6">Terminal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                {listings.map((l) => (
                  <tr key={l._id} className="hover:bg-primary/[0.02] transition-colors group">
                    <td className="px-8 py-6 font-bold text-primary">{l.title}</td>
                    <td className="px-8 py-6 text-xs font-bold text-primary/40">{l.seller?.name ?? "Expunged"}</td>
                    <td className="px-8 py-6 font-black text-primary">₹{l.price.toLocaleString()}</td>
                    <td className="px-8 py-6 text-xs font-black uppercase tracking-widest text-primary/40">{l.category}</td>
                    <td className="px-8 py-6">
                      <span className={`rounded-xl px-3 py-1 text-[8px] font-black uppercase tracking-widest border ${
                        l.status === "active" ? "bg-success/10 text-success border-success/20" : "bg-primary/10 text-primary/40 border-primary/10"
                      }`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <button
                        onClick={() => deleteListing(l._id)}
                        className="h-10 w-10 rounded-xl bg-destructive/10 text-destructive grid place-items-center hover:bg-destructive hover:text-white transition-all scale-0 group-hover:scale-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid gap-6">
          {reports.length === 0 ? (
            <div className="rounded-[2.5rem] glass py-24 text-center ring-1 ring-primary/5">
              <Terminal size={48} className="mx-auto mb-6 text-primary/10" />
              <p className="text-xs font-black uppercase tracking-widest text-primary/30">Zero Violation Logs Recorded</p>
            </div>
          ) : (
            reports.map((r) => (
              <div key={r._id} className="card-3d rounded-[2.5rem] glass p-8 shadow-xl ring-1 ring-primary/5">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-xl bg-destructive/10 text-destructive text-[10px] font-black uppercase tracking-widest border border-destructive/10">
                        Violation: {r.reason.replace("_", " ")}
                      </span>
                      {r.listingId && (
                        <span className="px-3 py-1 rounded-xl bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/10">
                          Asset Linked
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-1">Telemetry Data</p>
                      <p className="font-bold text-primary/80 leading-relaxed">{r.details || "No supplementary briefing provided."}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-8 pt-4 border-t border-primary/5">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-1">Reported By</p>
                        <p className="text-xs font-black text-primary">{r.reporterId?.name ?? "Unknown"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-1">Target Operator</p>
                        <p className="text-xs font-black text-destructive">{r.reportedUserId?.name ?? "Unknown"}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="h-14 w-14 rounded-2xl bg-success/10 text-success grid place-items-center hover:bg-success hover:text-white transition-all shadow-lg shadow-success/10">
                      <Check size={24} />
                    </button>
                    <button className="h-14 w-14 rounded-2xl bg-destructive/10 text-destructive grid place-items-center hover:bg-destructive hover:text-white transition-all shadow-lg shadow-destructive/10">
                      <X size={24} />
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