import "./globals.css";

export const metadata = {
  title: "Gift Card Platform",
  description: "Plataforma de Gift Cards",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
