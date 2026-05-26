import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AzureADProvider from "next-auth/providers/azure-ad";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    AzureADProvider({
      clientId: process.env.MICROSOFT_CLIENT_ID!,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
      tenantId: process.env.MICROSOFT_TENANT_ID!,
    }),

    // ── LINE Login Provider (แก้ไข) ──
    {
      id: "line",
      name: "LINE",
      type: "oauth",
      wellKnown: "https://access.line.me/.well-known/openid-configuration",
      authorization: {
        url: "https://access.line.me/oauth2/v2.1/authorize",
        params: {
          scope: "profile openid email",
          response_type: "code",
        },
      },
      token: {
        url: "https://api.line.me/oauth2/v2.1/token",
      },
      userinfo: {
        url: "https://api.line.me/v2/profile",
        async request({ tokens, client }) {
          const response = await fetch("https://api.line.me/v2/profile", {
            headers: {
              Authorization: `Bearer ${tokens.access_token}`,
            },
          });
          const profile = await response.json();

          // LINE ไม่ให้ email โดยตรง ต้องใช้ OpenID Connect
          let email = null;
          if (tokens.id_token) {
            try {
              const base64Payload = tokens.id_token.split(".")[1];
              const payload = JSON.parse(
                Buffer.from(base64Payload, "base64").toString()
              );
              email = payload.email || null;
            } catch (e) {
              console.error("Failed to parse id_token:", e);
            }
          }

          return {
            id: profile.userId,
            name: profile.displayName,
            email: email,
            image: profile.pictureUrl,
          };
        },
      },
      clientId: process.env.LINE_LOGIN_CLIENT_ID!,
      clientSecret: process.env.LINE_LOGIN_CLIENT_SECRET!,
      checks: ["state"],
      profile(profile) {
        return {
          id: profile.userId,
          name: profile.displayName,
          email: profile.email ?? null,
          image: profile.pictureUrl ?? null,
        };
      },
    },
  ],

  callbacks: {
    async session({ session, token }) {
      if (token.provider) {
        (session as typeof session & { provider: string }).provider =
          token.provider as string;
      }
      return session;
    },
    async jwt({ token, account }) {
      if (account) {
        token.provider = account.provider;
      }
      return token;
    },
    async signIn({ user, account, profile }) {
      console.log("Sign in attempt:", {
        provider: account?.provider,
        user: user?.email,
      });
      return true;
    },
  },

  pages: {
    signIn: "/",
    error: "/", // redirect กลับไปหน้าแรกถ้าเกิด error
  },

  debug: process.env.NODE_ENV === "development", // เปิด debug ใน development
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
