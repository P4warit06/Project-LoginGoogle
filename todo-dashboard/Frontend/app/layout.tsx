import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "DashBoard — Sign In",
  description: "Premium authentication with Google, Microsoft",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />

        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />

        {/* Mobile responsive */}
        <meta name="theme-color" content="#070708" />
      </head>

      <body
        className="min-h-screen overflow-x-hidden bg-[#070708] text-white antialiased"
        style={
          {
            fontFamily: "'DM Sans', sans-serif",
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale",

            // Safe area support (iPhone notch)
            paddingTop: "env(safe-area-inset-top)",
            paddingBottom: "env(safe-area-inset-bottom)",
            paddingLeft: "env(safe-area-inset-left)",
            paddingRight: "env(safe-area-inset-right)",
          } as React.CSSProperties
        }
      >
        {/* Main wrapper */}
        <div className="relative flex min-h-screen w-full flex-col">
          <Providers>{children}</Providers>
        </div>

        {/* Toast */}
        <Toaster
          position="top-right"
          containerStyle={{
            top: 20,
            right: 20,
          }}
          toastOptions={{
            duration: 3000,
            style: {
              background: "#18181b",
              color: "#ffffff",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "16px",
              padding: "14px 16px",
              maxWidth: "90vw",
              fontSize: "14px",
            },
          }}
        />
      </body>
    </html>
  );
}
