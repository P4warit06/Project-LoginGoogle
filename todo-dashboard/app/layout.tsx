import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "DashBoard — Sign In",
  description: "Premium authentication with Google , Microsoft",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        style={
          {
            backgroundColor: "#070708",
            color: "#ffffff",
            fontFamily: "'DM Sans', sans-serif",
            margin: 0,
            padding: 0,
            minHeight: "100vh",
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale",
          } as React.CSSProperties
        }
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
