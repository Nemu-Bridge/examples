import type { Nemu } from "@nemu-ai/sdk";
import { auth } from "@/auth";
import { create_oauth } from "@/lib/oauth";

export async function get_client(): Promise<Nemu | null> {
  const session = await auth();
  if (!session) return null;
  if (session.error !== undefined) return null;
  if (session.access_token === undefined) return null;
  return create_oauth().from_tokens({ access_token: session.access_token });
}
