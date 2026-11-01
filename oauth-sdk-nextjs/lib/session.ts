import { cookies } from "next/headers";
import type { OAuthTokens } from "@nemu-ai/sdk";
import { get_env } from "@/lib/env";

export const SESSION_COOKIE = "nemu_session";
export const PENDING_COOKIE = "nemu_pending";

const KEY_SALT = "nemu-oauth-sdk-nextjs";
const PBKDF2_ITERATIONS = 100_000;
const SESSION_MAX_AGE = 60 * 60 * 24 * 30;
const PENDING_MAX_AGE = 60 * 10;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export interface PendingAuth {
  code_verifier: string;
  state: string;
}

export interface CookieOptions {
  httpOnly: true;
  secure: boolean;
  sameSite: "lax";
  path: string;
  maxAge: number;
}

export function cookie_options(max_age: number): CookieOptions {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: max_age,
  };
}

export const SESSION_COOKIE_OPTIONS = (): CookieOptions =>
  cookie_options(SESSION_MAX_AGE);

export const PENDING_COOKIE_OPTIONS = (): CookieOptions =>
  cookie_options(PENDING_MAX_AGE);

function to_base64url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function from_base64url(value: string): Uint8Array<ArrayBuffer> {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded.padEnd(Math.ceil(padded.length / 4) * 4, "="));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

let cached_key: Promise<CryptoKey> | null = null;

async function derive_key(): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey(
    "raw",
    encoder.encode(get_env().session_secret),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: encoder.encode(KEY_SALT),
      iterations: PBKDF2_ITERATIONS,
    },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

function get_key(): Promise<CryptoKey> {
  if (cached_key === null) cached_key = derive_key();
  return cached_key;
}

export async function seal(value: unknown): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    await get_key(),
    encoder.encode(JSON.stringify(value)),
  );
  return `${to_base64url(iv)}.${to_base64url(new Uint8Array(encrypted))}`;
}

export async function unseal<T>(sealed: string): Promise<T | null> {
  const [iv, payload] = sealed.split(".");
  if (iv === undefined || payload === undefined) return null;

  try {
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: from_base64url(iv) },
      await get_key(),
      from_base64url(payload),
    );
    return JSON.parse(decoder.decode(decrypted)) as T;
  } catch {
    return null;
  }
}

export async function read_session(): Promise<OAuthTokens | null> {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;
  if (raw === undefined) return null;
  return unseal<OAuthTokens>(raw);
}

export async function write_session(tokens: OAuthTokens): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, await seal(tokens), SESSION_COOKIE_OPTIONS());
}

export async function clear_session(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  store.delete(PENDING_COOKIE);
}

export async function write_pending(pending: PendingAuth): Promise<void> {
  const store = await cookies();
  store.set(PENDING_COOKIE, await seal(pending), PENDING_COOKIE_OPTIONS());
}

export async function take_pending(): Promise<PendingAuth | null> {
  const store = await cookies();
  const raw = store.get(PENDING_COOKIE)?.value;
  if (raw === undefined) return null;
  store.delete(PENDING_COOKIE);
  return unseal<PendingAuth>(raw);
}
