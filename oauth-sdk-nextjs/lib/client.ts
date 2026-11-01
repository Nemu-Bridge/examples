import type { Nemu, OAuthTokens } from "@nemu-ai/sdk";
import { create_oauth } from "@/lib/oauth";
import { read_session } from "@/lib/session";

export const REFRESH_WINDOW_MS = 120_000;

export function needs_refresh(tokens: OAuthTokens): boolean {
  if (tokens.expires_at === undefined) return true;
  return Date.now() >= tokens.expires_at - REFRESH_WINDOW_MS;
}

export async function get_client(): Promise<Nemu | null> {
  const tokens = await read_session();
  if (tokens === null) return null;
  if (needs_refresh(tokens)) return null;
  return create_oauth().from_tokens(tokens);
}
