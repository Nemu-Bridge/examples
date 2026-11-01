import { NextRequest, NextResponse } from "next/server";
import type { OAuthTokens } from "@nemu-ai/sdk";
import { create_oauth } from "@/lib/oauth";
import { needs_refresh } from "@/lib/client";
import {
  SESSION_COOKIE,
  SESSION_COOKIE_OPTIONS,
  seal,
  unseal,
} from "@/lib/session";

export const config = {
  matcher: ["/dashboard/:path*"],
};

function sign_out(): NextResponse {
  const response = NextResponse.next();
  response.cookies.delete(SESSION_COOKIE);
  return response;
}

export async function proxy(request: NextRequest) {
  const raw = request.cookies.get(SESSION_COOKIE)?.value;
  if (raw === undefined) return NextResponse.next();

  const tokens = await unseal<OAuthTokens>(raw);
  if (tokens === null) return sign_out();

  if (!needs_refresh(tokens)) return NextResponse.next();
  if (tokens.refresh_token === undefined) return sign_out();

  try {
    const rotated = await create_oauth().from_tokens(tokens).refresh();
    const response = NextResponse.next();
    response.cookies.set(
      SESSION_COOKIE,
      await seal(rotated),
      SESSION_COOKIE_OPTIONS(),
    );
    return response;
  } catch {
    return sign_out();
  }
}
