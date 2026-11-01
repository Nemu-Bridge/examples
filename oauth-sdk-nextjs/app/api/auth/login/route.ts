import { NextRequest, NextResponse } from "next/server";
import { create_oauth, SCOPES } from "@/lib/oauth";
import { write_pending } from "@/lib/session";

export async function GET(request: NextRequest) {
  const state = crypto.randomUUID();

  try {
    const { url, code_verifier } = await create_oauth().authorize_url({
      scopes: SCOPES,
      state,
    });

    await write_pending({ code_verifier, state });
    return NextResponse.redirect(url);
  } catch {
    return NextResponse.redirect(new URL("/?error=login_failed", request.url));
  }
}
