import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tanmay Gandhi — AI",
  description: "Talk to Tanmay's personal AI. Ask about his skills, projects, and experience.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
