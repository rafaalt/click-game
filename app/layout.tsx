import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Click Game",
  description:
    "Até onde você consegue chegar? Clique, marque pontos e encare uma chance de falha cada vez maior.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
