const MINIMUM_SECRET_LENGTH = 32;

export interface Environment {
  client_id: string;
  client_secret: string;
  redirect_uri: string;
  session_secret: string;
  base_url: string;
}

function read(key: string): string {
  const value = process.env[key];
  if (value === undefined || value.length === 0) {
    throw new Error(`Missing environment variable ${key} [env_missing]`);
  }
  return value;
}

export function get_env(): Environment {
  const session_secret = read("SESSION_SECRET");
  if (session_secret.length < MINIMUM_SECRET_LENGTH) {
    throw new Error(
      `SESSION_SECRET must be at least ${MINIMUM_SECRET_LENGTH} characters [env_weak_secret]`,
    );
  }

  return {
    client_id: read("NEMU_CLIENT_ID"),
    client_secret: read("NEMU_CLIENT_SECRET"),
    redirect_uri: read("NEMU_REDIRECT_URI"),
    session_secret,
    base_url: process.env.NEMU_BASE_URL ?? "https://app.nemu.cc/api/v1",
  };
}
