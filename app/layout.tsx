import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/auth-provider";
import { ParticleBackground } from "@/components/ui/particle-background";
import { FloatingElements } from "@/components/ui/floating-elements";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Neural Chat - AI Assistant",
  description: "Experience the future of AI conversation with Neural Chat",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <ParticleBackground />
        <FloatingElements />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
