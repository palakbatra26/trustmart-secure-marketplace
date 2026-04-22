export function Footer() {
  return (
    <footer className="mt-20 relative overflow-hidden bg-primary text-primary-foreground py-20">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      
      <div className="mx-auto max-w-7xl px-4 relative z-10 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-4 sm:grid-cols-2">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-accent grid place-items-center text-primary shadow-lg">
                <span className="font-black text-xl">T</span>
              </div>
              <h4 className="text-2xl font-black uppercase tracking-tighter text-accent">TrustMart</h4>
            </div>
            <p className="text-sm font-medium text-primary-foreground/50 leading-relaxed">
              India's most secured second-hand marketplace. Engineered for safety, designed for traders.
            </p>
          </div>
          
          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-accent/50 mb-6">Operations</h4>
            <ul className="space-y-4 text-sm font-bold text-primary-foreground/70">
              <li className="hover:text-accent transition-colors cursor-pointer">Protocol: Verify</li>
              <li className="hover:text-accent transition-colors cursor-pointer">Encrypted Chat</li>
              <li className="hover:text-accent transition-colors cursor-pointer">Neural Trust Scoring</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-accent/50 mb-6">Trust Matrix</h4>
            <ul className="space-y-4 text-sm font-bold">
              <li className="flex items-center gap-2 text-success">
                <div className="h-1.5 w-1.5 rounded-full bg-success shadow-[0_0_8px_oklch(0.65_0.18_150)]" />
                70–100: Apex Tier
              </li>
              <li className="flex items-center gap-2 text-warning">
                <div className="h-1.5 w-1.5 rounded-full bg-warning shadow-[0_0_8px_oklch(0.8_0.15_85)]" />
                40–69: Neutral Tier
              </li>
              <li className="flex items-center gap-2 text-destructive">
                <div className="h-1.5 w-1.5 rounded-full bg-destructive shadow-[0_0_8px_oklch(0.55_0.2_25)]" />
                0–39: High Risk
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-accent/50 mb-6">Terminal</h4>
            <p className="text-xs font-mono text-primary-foreground/30 leading-loose">
              SYSTEM_STATUS: SECURE<br />
              UPTIME: 99.98%<br />
              ENCRYPTION: AES-256
            </p>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-foreground/20">
            © {new Date().getFullYear()} TrustMart Systems. All rights reserved.
          </p>
          <div className="flex gap-6">
            <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10" />
            <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10" />
            <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10" />
          </div>
        </div>
      </div>
    </footer>
  );
}
