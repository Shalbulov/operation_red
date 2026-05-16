"use client";

import Link from "next/link";
import { Crosshair, Radio, Trophy, Sparkles, User, Coins, GraduationCap } from "lucide-react";
import { usePathname } from "next/navigation";
import { useInventoryStore } from "@/lib/stores/inventoryStore";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageToggle } from "./LanguageToggle";
import { useT } from "@/lib/i18n/useT";
import { cn } from "@/lib/utils/cn";

const NAV = [
  { href: "/play", labelKey: "nav.play" as const, icon: Crosshair },
  { href: "/daily", labelKey: "nav.daily" as const, icon: Radio },
  { href: "/tutorial", labelKey: "nav.tutorial" as const, icon: GraduationCap },
  { href: "/leaderboard", labelKey: "nav.leaderboard" as const, icon: Trophy },
  { href: "/shop", labelKey: "nav.shop" as const, icon: Sparkles },
];

export function TopBar() {
  const pathname = usePathname();
  const coins = useInventoryStore((s) => s.coins);
  const isPro = useInventoryStore((s) => s.isPro);
  const t = useT();

  return (
    <header className="sticky top-0 z-40 border-b border-steel-700 bg-sunken/90 backdrop-blur safe-top">
      <div className="flex items-center justify-between px-3 sm:px-6 py-2.5 gap-2">
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <span className="block w-2 h-2 bg-red-alert group-hover:animate-pulse" />
          <span className="display text-sm sm:text-base tracking-tight">
            OPS<span className="text-red-alert">·</span>RED
          </span>
        </Link>

        <nav className="flex items-center gap-px bg-steel-700 border border-steel-700">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "mono text-[10px] sm:text-xs font-bold uppercase tracking-widest px-2.5 sm:px-3.5 py-2 transition-colors flex items-center gap-1.5",
                  active
                    ? "bg-red-alert text-void"
                    : "bg-panel text-bone-dim hover:bg-elevated hover:text-bone",
                )}
              >
                <Icon className="w-3 h-3" />
                <span className="hidden sm:inline">{t(item.labelKey)}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <div className="frame flex items-center gap-1 px-2 sm:px-3 py-1.5">
            <Coins className="w-3 h-3 text-red-alert" />
            <span className="mono text-xs tabular-nums font-bold">{coins}</span>
          </div>
          {isPro && (
            <span className="tag tag-red hidden sm:inline-flex">{t("nav.pro")}</span>
          )}
          <LanguageToggle />
          <ThemeToggle />
          <Link
            href="/profile"
            className="frame p-2 hover:border-bone transition-colors"
            aria-label="Profile"
          >
            <User className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
