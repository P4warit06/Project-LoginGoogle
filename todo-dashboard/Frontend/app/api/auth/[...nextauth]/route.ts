import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AzureADProvider from "next-auth/providers/azure-ad";

export const authOptions = {
  session: {
    strategy: "jwt",
  },

  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",

      options: {
        httpOnly: true,
        sameSite: "none",
        path: "/",
        secure: true,
      },
    },
  },
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

      version: "2.0",

      authorization: {
        url: "https://access.line.me/oauth2/v2.1/authorize",
        params: {
          scope: "profile openid",
        },
      },

      token: "https://api.line.me/oauth2/v2.1/token",

      userinfo: "https://api.line.me/v2/profile",

      clientId: process.env.LINE_LOGIN_CLIENT_ID,
      clientSecret: process.env.LINE_LOGIN_CLIENT_SECRET,

      profile(profile: any) {
        return {
          id: profile.userId,
          name: profile.displayName,
          image: profile.pictureUrl,
          email: null,
        };
      },
    },
  ],

  callbacks: {
    async jwt({
      token,
      account,
      profile,
    }: {
      token: any;
      account: any;
      profile: any;
    }) {
      if (account) {
        token.provider = account.provider;
      }

      if (profile) {
        token.picture = profile.pictureUrl;
      }

      return token;
    },

    async session({ session, token }: { session: any; token: any }) {
      if (token.picture) {
        session.user.image = token.picture as string;
      }

      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};


const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
