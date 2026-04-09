import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CT Cock Index",
  description: "Bullish tweets. Bigger results.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
