import type { Metadata, Viewport } from "next";
import { Geist_Mono, Space_Grotesk, Inter } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/hud/ThemeProvider";
import "./globals.css";

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const display = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const mono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "OPERATION RED — Advanced Minesweeper",
  description:
    "Brutalist Minesweeper for probabilistic thinking. AI Coach, Daily Challenge, leaderboards, custom skins.",
  applicationName: "Operation Red",
  keywords: ["minesweeper", "сапёр", "ai coach", "daily challenge", "puzzle"],
  authors: [{ name: "Operation Red" }],
  openGraph: {
    title: "OPERATION RED",
    description: "Train your probabilistic mind. Defuse the field.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ru"
      data-theme="dark"
      className={`${sans.variable} ${display.variable} ${mono.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col grain scanlines selection:bg-red-alert selection:text-void">
        <ThemeProvider>{children}</ThemeProvider>
        <Toaster
          position="top-right"
          theme="dark"
          toastOptions={{
            style: {
              background: "var(--bg-elevated)",
              border: "1px solid var(--steel-700)",
              borderRadius: 0,
              color: "var(--bone)",
              fontFamily: "var(--font-mono)",
              fontSize: "13px",
            },
          }}
        />
      </body>
    </html>
  );
}
