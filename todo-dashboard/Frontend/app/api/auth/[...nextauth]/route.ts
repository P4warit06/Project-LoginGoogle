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

    // ── LINE Login Provider (Fixed) ──
    {
      id: "line",
      name: "LINE",
      type: "oauth",
      wellKnown: "https://access.line.me/.well-known/openid-configuration",
      authorization: {
        params: {
          scope: "profile openid email",
        },
      },
      clientId: process.env.LINE_LOGIN_CLIENT_ID!,
      clientSecret: process.env.LINE_LOGIN_CLIENT_SECRET!,
      checks: ["state"],

      // This is the correct profile mapping function
      profile(profile, tokens) {
        // Parse email from id_token if available
        let email = null;
        if (tokens?.id_token) {
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
          id: profile.sub, // OpenID Connect uses 'sub' as user ID
          name: profile.name,
          email: email,
          image: profile.picture,
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
        // Store the id_token for email extraction
        if (account.id_token) {
          token.id_token = account.id_token;
        }
      }
      return token;
    },
    async signIn({ user, account, profile }) {
      console.log("Sign in attempt:", {
        provider: account?.provider,
        user: user?.email || user?.name,
      });
      return true;
    },
  },

  pages: {
    signIn: "/",
    error: "/",
  },

  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
