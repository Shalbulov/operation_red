"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Cell } from "./Cell";
import { useGameStore } from "@/lib/stores/gameStore";
import { useSettingsStore } from "@/lib/stores/settingsStore";
import { useInventoryStore } from "@/lib/stores/inventoryStore";
import { getSkin } from "@/lib/skins/registry";
import { getBackground } from "@/lib/skins/backgrounds";

export function Board() {
  const board = useGameStore((s) => s.board);
  const width = useGameStore((s) => s.width);
  const height = useGameStore((s) => s.height);
  const lastHint = useGameStore((s) => s.lastHint);
  const reveal = useGameStore((s) => s.reveal);
  const flag = useGameStore((s) => s.flag);
  const chordAt = useGameStore((s) => s.chordAt);

  const skinId = useSettingsStore((s) => s.skinId);
  const backgroundId = useSettingsStore((s) => s.backgroundId);
  const ownsSkin = useInventoryStore((s) => s.ownsSkin);
  const ownsBg = useInventoryStore((s) => s.ownsBackground);

  const activeSkinId = ownsSkin(skinId) ? skinId : "ops";
  const activeBgId = ownsBg(backgroundId) ? backgroundId : "void";
  const skin = getSkin(activeSkinId);
  const background = getBackground(activeBgId);

  const [exploded, setExploded] = useState<{ x: number; y: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Responsive cell size — recompute on resize.
  const [cellSize, setCellSize] = useState(32);
  useEffect(() => {
    const compute = () => {
      const node = containerRef.current;
      if (!node) return;
      const maxW = node.clientWidth;
      const maxH = Math.min(window.innerHeight - 240, window.innerWidth - 32);
      const byW = Math.floor(maxW / width) - 1;
      const byH = Math.floor(maxH / height) - 1;
      const s = Math.max(18, Math.min(40, Math.min(byW, byH)));
      setCellSize(s);
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, [width, height]);

  const handleReveal = (x: number, y: number) => {
    const result = reveal(x, y);
    if (result.exploded) {
      setExploded(result.exploded);
      if (navigator.vibrate) navigator.vibrate([60, 30, 60]);
      window.setTimeout(() => setExploded(null), 600);
    }
  };

  const handleChord = (x: number, y: number) => {
    const result = chordAt(x, y);
    if (result.exploded) {
      setExploded(result.exploded);
      if (navigator.vibrate) navigator.vibrate([60, 30, 60]);
      window.setTimeout(() => setExploded(null), 600);
    }
  };

  const cssVars = useMemo(() => skin.tokens as React.CSSProperties, [skin]);

  return (
    <div
      ref={containerRef}
      className="relative flex justify-center w-full overflow-auto p-4 sm:p-6 border border-steel-700"
      style={background.style}
    >
      <div
        className="inline-block frame-elevated p-1"
        style={cssVars}
        data-skin={skin.id}
      >
        <div
          className="grid gap-0"
          style={{
            gridTemplateColumns: `repeat(${width}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${height}, ${cellSize}px)`,
          }}
          onContextMenu={(e) => e.preventDefault()}
        >
          {board.map((row, y) =>
            row.map((cell, x) => (
              <Cell
                key={`${x}-${y}`}
                cell={cell}
                hinted={lastHint?.x === x && lastHint?.y === y}
                exploded={exploded?.x === x && exploded?.y === y}
                onReveal={handleReveal}
                onFlag={flag}
                onChord={handleChord}
                size={cellSize}
              />
            )),
          )}
        </div>
      </div>
    </div>
  );
}
