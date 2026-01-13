import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Article Generator",
  description: "Generate articles based on interview questions with ease",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
