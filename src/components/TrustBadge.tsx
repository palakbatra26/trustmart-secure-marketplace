import { ShieldCheck, Shield, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { trustClasses, trustLabel, trustLevel } from "@/lib/trust";

interface TrustBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function TrustBadge({ score, size = "sm", showLabel = true, className }: TrustBadgeProps) {
  const lvl = trustLevel(score);
  const c = trustClasses(score);
  const Icon = lvl === "high" ? ShieldCheck : lvl === "mid" ? Shield : ShieldAlert;

  const sizes = {
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-sm px-2.5 py-1 gap-1.5",
    lg: "text-base px-3 py-1.5 gap-2",
  };
  const iconSize = size === "lg" ? 16 : size === "md" ? 14 : 12;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-semibold ring-1",
        c.bg,
        c.text,
        c.ring,
        sizes[size],
        className,
      )}
    >
      <Icon size={iconSize} strokeWidth={2.4} />
      {showLabel ? `${trustLabel(score)} · ${score}` : score}
    </span>
  );
}
