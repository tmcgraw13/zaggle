import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Zaggle - Word Game",
  description: "Fast-paced multiplayer word game. Create words, score points, beat your friends!",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Zaggle",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0F172A",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-[100dvh] flex flex-col bg-slate-900`}>
        {/* Fixed navbar with safe area support */}
        <div
          className="fixed inset-x-0 top-0 z-50 bg-slate-800"
          style={{ paddingTop: "env(safe-area-inset-top)" }}
        >
          <Navbar />
        </div>

        {/* Main content area */}
        <main
          className="flex-1"
          style={{
            paddingTop: "calc(60px + env(safe-area-inset-top))",
          }}
        >
          {children}
        </main>
      </body>
    </html>
  );
}
