export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-3">
          <div>
            <h4 className="font-bold text-accent">TrustMart</h4>
            <p className="mt-2 text-sm text-primary-foreground/70">
              A second-hand marketplace built on trust. Buy and sell with confidence.
            </p>
          </div>
          <div>
            <h4 className="font-semibold">How it works</h4>
            <ul className="mt-2 space-y-1 text-sm text-primary-foreground/70">
              <li>1. Browse listings & check seller trust</li>
              <li>2. Contact via WhatsApp</li>
              <li>3. Mark deal complete to boost trust</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold">Trust Score</h4>
            <ul className="mt-2 space-y-1 text-sm text-primary-foreground/70">
              <li>70–100: High Trust 🟢</li>
              <li>40–69: Medium Trust 🟡</li>
              <li>0–39: Low / Suspicious 🔴</li>
            </ul>
          </div>
        </div>
        <p className="mt-8 text-center text-xs text-primary-foreground/50">
          © {new Date().getFullYear()} TrustMart. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
