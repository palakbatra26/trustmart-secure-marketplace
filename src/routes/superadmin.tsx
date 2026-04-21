import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { ShieldCheck, Crown } from "lucide-react";

export const Route = createFileRoute("/superadmin")({
  component: SuperAdminPage,
});

function SuperAdminPage() {
  const makeAdmin = async () => {
    try {
      const response = await fetch('/api/admin/make-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        toast.success("Admin setup complete! Default admin: admin@trustmarket.com / admin123");
      } else {
        toast.error("Admin already exists or setup failed");
      }
    } catch {
      toast.error("Backend not running. Start server first.");
    }
  };

  return (
    <div className="mx-auto grid max-w-md px-4 py-20">
      <div className="rounded-2xl bg-surface p-6 shadow-[var(--shadow-card)] ring-1 ring-border sm:p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary text-accent">
            <Crown size={24} />
          </span>
          <h1 className="mt-3 text-2xl font-extrabold text-primary">Admin Setup</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Initialize the default admin account
          </p>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg bg-amber-100 p-4 text-sm text-amber-800">
            <p className="font-semibold">Admin Credentials:</p>
            <p>Email: <span className="font-mono">admin@trustmarket.com</span></p>
            <p>Password: <span className="font-mono">admin123</span></p>
          </div>

          <button
            onClick={makeAdmin}
            className="w-full rounded-xl bg-primary p-3 font-bold text-primary-foreground hover:bg-primary/90"
          >
            Setup Admin Account
          </button>

          <p className="text-center text-xs text-muted-foreground">
            Run this after starting the backend server
          </p>
        </div>
      </div>
    </div>
  );
}