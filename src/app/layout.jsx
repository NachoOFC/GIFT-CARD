import "./globals.css";
import { CartProvider } from "@/contexts/CartContext";

export const metadata = {
  title: "Gift Card Platform",
  description: "Plataforma de Gift Cards",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="antialiased">
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
