import type { BoardSkin } from "@/lib/skins/types";
import { Flag, Bomb } from "lucide-react";

/** Tiny mock board to show how a skin looks. */
export function SkinPreview({ skin, size = 22 }: { skin: BoardSkin; size?: number }) {
  // Demo grid pattern
  const grid: { state: string; num?: number; mine?: boolean; flag?: boolean }[] = [
    { state: "open", num: 1 }, { state: "open", num: 2 }, { state: "open" },
    { state: "open", num: 1 }, { state: "flag", flag: true }, { state: "closed" },
    { state: "open", num: 1 }, { state: "open", num: 2 }, { state: "mine", mine: true },
  ];
  return (
    <div
      className="inline-block frame p-1"
      style={skin.tokens as React.CSSProperties}
    >
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(3, ${size}px)`,
          gridTemplateRows: `repeat(3, ${size}px)`,
        }}
      >
        {grid.map((c, i) => {
          const isOpen = c.state !== "closed" && c.state !== "flag";
          const isMine = c.state === "mine";
          const numColor = c.num != null ? `var(--num-${c.num})` : undefined;
          return (
            <div
              key={i}
              className={`cell ${isOpen ? "cell-open" : ""} ${isMine ? "cell-mine" : ""}`}
              style={{
                width: size,
                height: size,
                fontSize: Math.floor(size * 0.55),
                color: numColor,
              }}
            >
              {c.flag && <Flag fill="currentColor" className="text-red-alert" style={{ width: size * 0.55, height: size * 0.55 }} />}
              {c.mine && <Bomb className="text-bone" style={{ width: size * 0.6, height: size * 0.6 }} />}
              {c.num && !c.mine && !c.flag && <span style={{ color: numColor }}>{c.num}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
