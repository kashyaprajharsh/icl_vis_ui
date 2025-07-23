import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ICL Visualizer",
  description: "Real-time In-Context Learning Analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
