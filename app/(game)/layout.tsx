import { TopBar } from "@/components/hud/TopBar";

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-full">
      <TopBar />
      <div className="flex-1 flex flex-col">{children}</div>
    </div>
  );
}
