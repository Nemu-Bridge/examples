import { NextRequest, NextResponse } from "next/server";
import { clear_session } from "@/lib/session";

export async function POST(request: NextRequest) {
  await clear_session();
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}
