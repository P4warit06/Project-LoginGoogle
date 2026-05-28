import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AzureADProvider from "next-auth/providers/azure-ad";

export const authOptions: NextAuthOptions = {
  trustHost: true,
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

    {
      id: "line",
      name: "LINE",
      type: "oauth",

      wellKnown: "https://access.line.me/.well-known/openid-configuration",

      authorization: {
        params: {
          scope: "profile openid",
        },
      },

      idToken: true,
      checks: ["pkce", "state"],

      clientId: process.env.LINE_LOGIN_CLIENT_ID!,
      clientSecret: process.env.LINE_LOGIN_CLIENT_SECRET!,

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

  pages: {
    signIn: "/",
    error: "/",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
