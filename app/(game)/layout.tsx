import { TopBar } from "@/components/hud/TopBar";
import { BackgroundSurface } from "@/components/hud/BackgroundSurface";

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-full">
      <BackgroundSurface />
      <div className="relative z-10 flex-1 flex flex-col">
        <TopBar />
        <div className="flex-1 flex flex-col">{children}</div>
      </div>
    </div>
  );
}
