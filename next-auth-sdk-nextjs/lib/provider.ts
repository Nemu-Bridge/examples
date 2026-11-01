import type { OAuthConfig } from "next-auth/providers";
import { format_scopes } from "@nemu-ai/sdk";

const origin = process.env.NEMU_ORIGIN ?? "https://app.nemu.cc";

export const SCOPE = format_scopes({
  profile: "read",
  workspaces: "read",
  models: "read",
  usage: "read",
});

export interface NemuProfile {
  data: {
    id: string;
    email: string;
    username: string | null;
    role: string;
    account_type: string;
    plan: string | null;
    email_verified: boolean;
    created_at: string;
  };
}

export const nemu_provider: OAuthConfig<NemuProfile> = {
  id: "nemu",
  name: "Nemu",
  type: "oauth",
  clientId: process.env.AUTH_NEMU_ID,
  clientSecret: process.env.AUTH_NEMU_SECRET,
  authorization: {
    url: `${origin}/oauth/authorize`,
    params: { scope: SCOPE },
  },
  token: `${origin}/api/oauth/token`,
  userinfo: `${origin}/api/v1/user`,
  checks: ["pkce", "state"],
  client: { token_endpoint_auth_method: "client_secret_basic" },
  profile(profile) {
    return {
      id: profile.data.id,
      name: profile.data.username,
      email: profile.data.email,
    };
  },
};
