import { NemuOAuth } from "@nemu-ai/sdk";

const origin = process.env.NEMU_ORIGIN ?? "https://app.nemu.cc";

export function create_oauth(): NemuOAuth {
  return new NemuOAuth({
    client_id: process.env.AUTH_NEMU_ID ?? "",
    client_secret: process.env.AUTH_NEMU_SECRET ?? "",
    redirect_uri: "",
    base_url: `${origin}/api/v1`,
  });
}
