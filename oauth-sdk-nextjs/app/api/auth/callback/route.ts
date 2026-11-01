import { NextRequest, NextResponse } from "next/server";
import { create_oauth } from "@/lib/oauth";
import { take_pending, write_session } from "@/lib/session";

function failure(request: NextRequest, reason: string): NextResponse {
  return NextResponse.redirect(new URL(`/?error=${reason}`, request.url));
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const denied = params.get("error");
  if (denied !== null) return failure(request, "access_denied");

  const code = params.get("code");
  const state = params.get("state");
  if (code === null || state === null) return failure(request, "missing_code");

  const pending = await take_pending();
  if (pending === null) return failure(request, "expired_request");
  if (pending.state !== state) return failure(request, "state_mismatch");

  try {
    const nemu = await create_oauth().exchange_code({
      code,
      code_verifier: pending.code_verifier,
    });

    if (nemu.tokens === undefined) {
      return failure(request, "no_tokens");
    }

    await write_session(nemu.tokens);
    return NextResponse.redirect(new URL("/dashboard", request.url));
  } catch {
    return failure(request, "exchange_failed");
  }
}
