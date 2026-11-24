import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Ofício Barber", description: "Agenda online da barbearia" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
