import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { ToastProvider } from "@/components/ui/toast-provider";
import { AuthProvider } from "@/components/auth/auth-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Critero Suite",
    template: "%s — Critero Suite",
  },
  description:
    "Upphandling, verktyg och mognadsmätning — samlad plattform för verksamhetsstöd från Critero Consulting.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://critero.vercel.app",
  ),
  openGraph: {
    title: "Critero Suite",
    description:
      "Upphandling · Verktyg · Mognadsmätning — samlad plattform för verksamhetsstöd.",
    siteName: "Critero Suite",
    locale: "sv_SE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Critero Suite",
    description:
      "Upphandling · Verktyg · Mognadsmätning — samlad plattform för verksamhetsstöd.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <html lang="sv" suppressHydrationWarning>
        <body className="antialiased font-sans">
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <ToastProvider>
              <div className="flex h-screen">
                <AppSidebar />
                <main className="flex-1 overflow-auto">{children}</main>
              </div>
            </ToastProvider>
          </ThemeProvider>
        </body>
      </html>
    </AuthProvider>
  );
}
