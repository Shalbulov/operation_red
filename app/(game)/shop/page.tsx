"use client";

import { useEffect, useState } from "react";
import {
  Sparkles,
  Lock,
  Check,
  Coins,
  CreditCard,
  Crown,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { SKIN_LIST } from "@/lib/skins/registry";
import { BACKGROUND_LIST, getBackground } from "@/lib/skins/backgrounds";
import { getSlugForSkin, getSlugForBackground } from "@/lib/polar/products";
import { useT } from "@/lib/i18n/useT";
import { useSettingsStore } from "@/lib/stores/settingsStore";
import { useInventoryStore } from "@/lib/stores/inventoryStore";
import { SkinPreview } from "@/components/shop/SkinPreview";
import { formatPrice } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Tab = "skins" | "backgrounds" | "pro";

export default function ShopPage() {
  const t = useT();
  const [tab, setTab] = useState<Tab>("skins");
  const skinId = useSettingsStore((s) => s.skinId);
  const bgId = useSettingsStore((s) => s.backgroundId);
  const setSkin = useSettingsStore((s) => s.setSkin);
  const setBg = useSettingsStore((s) => s.setBackground);
  const coins = useInventoryStore((s) => s.coins);
  const isPro = useInventoryStore((s) => s.isPro);
  const ownedSkins = useInventoryStore((s) => s.ownedSkins);
  const ownedBgs = useInventoryStore((s) => s.ownedBackgrounds);
  const spend = useInventoryStore((s) => s.spendCoins);
  const grantSkin = useInventoryStore((s) => s.grantSkin);
  const grantBg = useInventoryStore((s) => s.grantBackground);

  const [busy, setBusy] = useState<string | null>(null);

  // Best-effort: sync server-side coins/inventory on mount
  useEffect(() => {
    (async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;
        const { data: profile } = await supabase
          .from("profiles")
          .select("coins, is_pro")
          .eq("id", user.id)
          .single();
        if (profile) {
          useInventoryStore.setState({
            coins: profile.coins,
            isPro: profile.is_pro,
          });
        }
        const { data: ownedRows } = await supabase
          .from("user_skins")
          .select("skin_id")
          .eq("user_id", user.id);
        if (ownedRows) {
          const ids = ownedRows.map((r) => r.skin_id);
          useInventoryStore.setState((s) => ({
            ownedSkins: Array.from(new Set([...s.ownedSkins, ...ids])),
            ownedBackgrounds: Array.from(
              new Set([...s.ownedBackgrounds, ...ids]),
            ),
          }));
        }
      } catch {
        /* not logged in or supabase missing — keep local */
      }
    })();
  }, []);

  const buyWithCoins = async (skinId: string, priceCoins: number) => {
    setBusy(skinId);
    try {
      // Try server purchase if logged in
      const res = await fetch("/api/skins/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skinId }),
      });
      if (res.ok) {
        const j = await res.json();
        useInventoryStore.setState({ coins: j.coinsLeft });
        grantSkin(skinId);
        grantBg(skinId);
        toast.success(t("shop.toast.bought"));
      } else if (res.status === 401) {
        // Anonymous mode — try local
        if (spend(priceCoins)) {
          grantSkin(skinId);
          grantBg(skinId);
          toast.success(t("shop.toast.boughtLocal"));
        } else {
          toast.error(t("shop.toast.notEnough"));
        }
      } else {
        const j = await res.json().catch(() => ({}));
        toast.error(j.error ?? t("common.error"));
      }
    } finally {
      setBusy(null);
    }
  };

  /** Buy via Polar — slug is resolved to product id server-side. */
  const buyWithPolarSlug = (slug: string | undefined) => {
    if (!slug) {
      toast.error(t("shop.toast.notAvail"));
      return;
    }
    window.location.href = `/api/polar/buy?slug=${encodeURIComponent(slug)}`;
  };

  return (
    <main className="flex-1 px-3 sm:px-6 py-6 sm:py-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <Sparkles className="w-5 h-5 text-red-alert" />
          <span className="tag tag-red">{t("shop.tag")}</span>
          <span className="h-px flex-1 bg-steel-700" />
          <div className="frame flex items-center gap-2 px-3 py-1.5">
            <Coins className="w-3.5 h-3.5 text-red-alert" />
            <span className="mono text-sm tabular-nums font-bold">{coins}</span>
          </div>
          {isPro && <span className="tag tag-red">PRO</span>}
        </div>

        <h1 className="display text-4xl sm:text-5xl mb-6">
          {t("shop.title.1")} <span className="text-red-alert">{t("shop.title.2")}</span>
        </h1>

        {/* Tabs */}
        <div className="flex gap-px bg-steel-700 border border-steel-700 mb-6">
          {(
            [
              { id: "skins" as const, label: t("shop.tab.skins") },
              { id: "backgrounds" as const, label: t("shop.tab.backgrounds") },
              { id: "pro" as const, label: t("shop.tab.pro") },
            ]
          ).map((tabDef) => (
            <button
              key={tabDef.id}
              onClick={() => setTab(tabDef.id)}
              className={cn(
                "mono text-xs font-bold uppercase tracking-widest px-4 py-3 transition-colors flex-1",
                tab === tabDef.id
                  ? "bg-red-alert text-void"
                  : "bg-panel text-bone-dim hover:bg-elevated hover:text-bone",
              )}
            >
              {tabDef.label}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        {tab === "skins" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SKIN_LIST.map((skin) => {
              const owned = isPro || ownedSkins.includes(skin.id);
              const equipped = owned && skin.id === skinId;
              const locked = skin.proOnly && !isPro;
              return (
                <div key={skin.id} className="frame-elevated p-4 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="stencil text-sm">{skin.name}</h3>
                      <span className="mono text-[10px] uppercase tracking-widest text-steel-500">
                        {skin.rarity}
                      </span>
                    </div>
                    {equipped ? (
                      <span className="tag tag-red flex items-center gap-1">
                        <Check className="w-3 h-3" /> {t("shop.equipped")}
                      </span>
                    ) : owned ? (
                      <span className="tag">OWNED</span>
                    ) : locked ? (
                      <span className="tag flex items-center gap-1">
                        <Lock className="w-3 h-3" /> PRO
                      </span>
                    ) : null}
                  </div>

                  <div className="flex justify-center py-3 bg-sunken border border-steel-700">
                    <SkinPreview skin={skin} size={26} />
                  </div>

                  <p className="text-bone-dim text-xs leading-relaxed min-h-[2.5rem]">
                    {skin.description}
                  </p>

                  <div className="flex gap-2 mt-auto">
                    {owned ? (
                      <button
                        onClick={() => setSkin(skin.id)}
                        disabled={equipped}
                        className={cn(
                          "btn-ghost flex-1 !py-2 !px-3 text-xs",
                          equipped && "opacity-40 cursor-not-allowed",
                        )}
                      >
                        {equipped ? "Активен" : "Применить"}
                      </button>
                    ) : locked ? (
                      <button
                        onClick={() => setTab("pro")}
                        className="btn-primary flex-1 !py-2 !px-3 text-xs flex items-center justify-center gap-1"
                      >
                        <Crown className="w-3 h-3" />
                        Pro
                      </button>
                    ) : (
                      <>
                        {skin.priceCoins > 0 && (
                          <button
                            onClick={() => buyWithCoins(skin.id, skin.priceCoins)}
                            disabled={busy === skin.id || coins < skin.priceCoins}
                            className="btn-ghost flex-1 !py-2 !px-2 text-xs flex items-center justify-center gap-1 disabled:opacity-40"
                          >
                            {busy === skin.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Coins className="w-3 h-3" />
                            )}
                            {skin.priceCoins}
                          </button>
                        )}
                        {skin.priceCents > 0 && (
                          <button
                            onClick={() => buyWithPolarSlug(getSlugForSkin(skin.id))}
                            className="btn-primary flex-1 !py-2 !px-2 text-xs flex items-center justify-center gap-1"
                          >
                            <CreditCard className="w-3 h-3" />
                            {formatPrice(skin.priceCents)}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === "backgrounds" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BACKGROUND_LIST.map((bg) => {
              const owned = isPro || ownedBgs.includes(bg.id);
              const equipped = owned && bg.id === bgId;
              return (
                <div key={bg.id} className="frame-elevated p-4 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="stencil text-sm">{bg.name}</h3>
                      <span className="mono text-[10px] uppercase tracking-widest text-steel-500">
                        {bg.rarity}
                      </span>
                    </div>
                    {equipped ? (
                      <span className="tag tag-red flex items-center gap-1">
                        <Check className="w-3 h-3" /> {t("shop.equipped")}
                      </span>
                    ) : owned ? (
                      <span className="tag">OWNED</span>
                    ) : null}
                  </div>

                  <div
                    className="h-32 border border-steel-700 relative overflow-hidden"
                    style={getBackground(bg.id).style}
                  >
                    <div className="absolute bottom-1 right-1 mono text-[8px] uppercase tracking-widest text-bone/60 bg-black/40 px-1.5 py-0.5">
                      PREVIEW
                    </div>
                  </div>

                  <p className="text-bone-dim text-xs leading-relaxed min-h-[2.5rem]">
                    {bg.description}
                  </p>

                  <div className="flex gap-2 mt-auto">
                    {owned ? (
                      <button
                        onClick={() => setBg(bg.id)}
                        disabled={equipped}
                        className={cn(
                          "btn-ghost flex-1 !py-2 !px-3 text-xs",
                          equipped && "opacity-40 cursor-not-allowed",
                        )}
                      >
                        {equipped ? "Активен" : "Применить"}
                      </button>
                    ) : (
                      <>
                        {bg.priceCoins > 0 && (
                          <button
                            onClick={() => buyWithCoins(bg.id, bg.priceCoins)}
                            disabled={busy === bg.id || coins < bg.priceCoins}
                            className="btn-ghost flex-1 !py-2 !px-2 text-xs flex items-center justify-center gap-1 disabled:opacity-40"
                          >
                            {busy === bg.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Coins className="w-3 h-3" />
                            )}
                            {bg.priceCoins}
                          </button>
                        )}
                        {bg.priceCents > 0 && (
                          <button
                            onClick={() =>
                              buyWithPolarSlug(getSlugForBackground(bg.id))
                            }
                            className="btn-primary flex-1 !py-2 !px-2 text-xs flex items-center justify-center gap-1"
                          >
                            <CreditCard className="w-3 h-3" />
                            {formatPrice(bg.priceCents)}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === "pro" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="frame-elevated p-6 lg:p-8 relative overflow-hidden">
              <div
                className="absolute inset-0 opacity-50 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse at top right, rgba(230,57,70,0.2), transparent 60%)",
                }}
              />
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <Crown className="w-6 h-6 text-red-alert" />
                  <span className="tag tag-red">PRO MONTHLY</span>
                </div>
                <h2 className="display text-4xl mb-2">
                  $4.99<span className="text-steel-400 text-lg mono">/мес</span>
                </h2>
                <ul className="space-y-2 mb-6 text-sm">
                  <ProFeature>Все скины и фоны</ProFeature>
                  <ProFeature>Безлимитные AI-подсказки</ProFeature>
                  <ProFeature>PRO-бейдж в лидербордах</ProFeature>
                  <ProFeature>Эксклюзивный Glass-скин</ProFeature>
                  <ProFeature>Поддержка независимого разработчика</ProFeature>
                </ul>
                <button
                  onClick={() => buyWithPolarSlug("pro_monthly")}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  Оформить подписку
                </button>
                <p className="mono text-[10px] text-steel-500 uppercase tracking-widest mt-3 text-center">
                  Через Polar.sh — Merchant of Record
                </p>
              </div>
            </div>

            <div className="frame-elevated p-6 lg:p-8">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-6 h-6 text-bone" />
                <span className="tag">MEGA BUNDLE</span>
              </div>
              <h2 className="display text-4xl mb-2">
                $9.99<span className="text-steel-400 text-lg mono"> / once</span>
              </h2>
              <p className="text-bone-dim text-sm mb-4">
                Все скины и фоны навсегда. Без подписки.
              </p>
              <ul className="space-y-2 mb-6 text-sm">
                <ProFeature>Carbon + Blueprint + Neon Tokyo + Vintage</ProFeature>
                <ProFeature>Concrete + Topographic + Blood Moon</ProFeature>
                <ProFeature>Доступ навсегда</ProFeature>
              </ul>
              <button
                onClick={() => buyWithPolarSlug("bundle_mega")}
                className="btn-ghost w-full flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                Купить Bundle
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function ProFeature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-bone-dim">
      <Check className="w-3.5 h-3.5 text-red-alert mt-0.5 shrink-0" />
      <span>{children}</span>
    </li>
  );
}
