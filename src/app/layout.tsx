import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Secure RBAC Auth Console",
  description: "Next.js Fullstack Role-based Access Control Console using JWT, Middleware, and Prisma.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="glow-spot glow-1"></div>
        <div className="glow-spot glow-2"></div>
        {children}
      </body>
    </html>
  );
}
