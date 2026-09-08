import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pathwise — Every path. Every cent.",
  description: "Intent-based execution routing with deterministic path scores and verifiable receipts. Binance Agent OS workspace.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
