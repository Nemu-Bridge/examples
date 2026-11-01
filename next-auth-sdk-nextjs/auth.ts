import NextAuth from "next-auth";
import type { JWT } from "next-auth/jwt";
import { nemu_provider } from "@/lib/provider";
import { create_oauth } from "@/lib/oauth";

const REFRESH_WINDOW_SECONDS = 120;
const DEFAULT_LIFETIME_SECONDS = 3600;

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [nemu_provider],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        return {
          ...token,
          access_token: account.access_token,
          refresh_token: account.refresh_token,
          expires_at:
            account.expires_at ??
            Math.floor(Date.now() / 1000) + DEFAULT_LIFETIME_SECONDS,
          scope: account.scope,
          error: undefined,
        };
      }

      const expires_at = token.expires_at ?? 0;
      if (Date.now() / 1000 < expires_at - REFRESH_WINDOW_SECONDS) {
        return token;
      }

      if (token.refresh_token === undefined) {
        return { ...token, error: "RefreshTokenError" as const };
      }

      try {
        const rotated = await create_oauth()
          .from_tokens({
            access_token: token.access_token ?? "",
            refresh_token: token.refresh_token,
            expires_at: expires_at * 1000,
          })
          .refresh();

        return {
          ...token,
          access_token: rotated.access_token,
          refresh_token: rotated.refresh_token ?? token.refresh_token,
          expires_at: Math.floor(
            (rotated.expires_at ??
              Date.now() + DEFAULT_LIFETIME_SECONDS * 1000) / 1000,
          ),
          error: undefined,
        };
      } catch {
        return { ...token, error: "RefreshTokenError" as const };
      }
    },

    async session({ session, token }) {
      session.access_token = token.access_token;
      session.scope = token.scope;
      session.error = token.error;
      return session;
    },
  },
});

declare module "next-auth" {
  interface Session {
    access_token?: string;
    scope?: string;
    error?: "RefreshTokenError";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    access_token?: string;
    refresh_token?: string;
    expires_at?: number;
    scope?: string;
    error?: "RefreshTokenError";
  }
}
