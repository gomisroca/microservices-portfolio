import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Microservices Portfolio",
  description:
    "Three production-grade Go and Python microservices: image upload, rate limiting, and webhook dispatch.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
