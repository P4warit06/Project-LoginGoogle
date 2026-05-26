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
      authorization: {
        url: "https://access.line.me/oauth2/v2.1/authorize",
        params: {
          scope: "profile openid email",
          response_type: "code",
        },
      },
      token: "https://api.line.me/oauth2/v2.1/token",
      userinfo: "https://api.line.me/v2/profile",
      clientId: process.env.LINE_LOGIN_CLIENT_ID!,
      clientSecret: process.env.LINE_LOGIN_CLIENT_SECRET!,
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
  },

  pages: {
    signIn: "/", 
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
