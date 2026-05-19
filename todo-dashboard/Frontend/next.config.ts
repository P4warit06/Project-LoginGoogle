import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", 
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.microsoft.com", // Microsoft profile photo
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com", // Google (wildcard)
        port: "",
        pathname: "/**",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // HTTPS strict — บังคับ browser ใช้ HTTPS ตลอด 2 ปี
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // ป้องกัน MIME sniffing
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // SAMEORIGIN = LINE LIFF เปิดใน iframe ได้
          // ห้ามใช้ DENY เด็ดขาด จะทำให้ LIFF โหลดไม่ขึ้น
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
