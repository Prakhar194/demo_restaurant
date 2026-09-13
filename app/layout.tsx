import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Half & Full | The Taste of Snacks",
  description: "Half & Full restaurant menu"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
