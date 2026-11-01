import { NemuOAuth, build_scopes, type Scope } from "@nemu-ai/sdk";
import { get_env } from "@/lib/env";

export const SCOPES: Scope[] = build_scopes({
  profile: "read",
  workspaces: "read",
  models: "read",
  usage: "read",
});

export function create_oauth(): NemuOAuth {
  const env = get_env();
  return new NemuOAuth({
    client_id: env.client_id,
    client_secret: env.client_secret,
    redirect_uri: env.redirect_uri,
    base_url: env.base_url,
  });
}
