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

    // ── LINE Login Provider ──
    {
      id: "line",
      name: "LINE",
      type: "oauth",

      // LINE รองรับ OpenID Connect — ใช้ wellKnown เพื่อ auto-discover endpoints
      wellKnown: "https://access.line.me/.well-known/openid-configuration",

      // *** จุดสำคัญ: ต้องเปิด idToken เพื่อให้ NextAuth อ่าน profile จาก id_token ***
      idToken: true,

      // checks: ["pkce", "state"] — LINE รองรับทั้งคู่
      checks: ["pkce", "state"],

      authorization: {
        params: {
          scope: "profile openid email",
        },
      },

      clientId: process.env.LINE_LOGIN_CLIENT_ID!,
      clientSecret: process.env.LINE_LOGIN_CLIENT_SECRET!,

      // profile จาก id_token (OpenID Connect standard claims)
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email ?? null,
          image: profile.picture ?? null,
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
    async signIn({ account }) {
      console.log("Sign in:", account?.provider);
      return true;
    },
  },

  pages: {
    signIn: "/",
    error: "/",
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
