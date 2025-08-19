import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gift Card Platform",
  description: "Plataforma de Gift Cards",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
