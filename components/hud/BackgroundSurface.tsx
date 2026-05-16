"use client";

import { useSettingsStore } from "@/lib/stores/settingsStore";
import { useInventoryStore } from "@/lib/stores/inventoryStore";
import { getBackground } from "@/lib/skins/backgrounds";

/**
 * Full-viewport fixed background that sits behind ALL content in the (game)
 * layout. The chosen background fills the screen so radar rings, moon disc,
 * topo peaks, etc. are visible at full scale even on mobile.
 *
 * Falls back to `void` if the user doesn't own the selected background.
 */
export function BackgroundSurface() {
  const bgId = useSettingsStore((s) => s.backgroundId);
  const ownsBg = useInventoryStore((s) => s.ownsBackground);
  const activeId = ownsBg(bgId) ? bgId : "void";
  const bg = getBackground(activeId);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 pointer-events-none"
      style={bg.style}
    />
  );
}
