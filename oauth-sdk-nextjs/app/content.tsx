import { ArrowRight02Icon, Alert02Icon } from "hugeicons-react";
import { Card } from "@/components/ui/card";

const errorMessages: Record<string, string> = {
  access_denied: "You declined the authorization request.",
  missing_code: "The provider did not return an authorization code.",
  expired_request: "The sign in request expired. Start again.",
  state_mismatch: "The state did not match. The request was discarded.",
  exchange_failed: "The authorization code could not be exchanged.",
  no_tokens: "The token exchange returned no tokens.",
  login_failed: "The sign in request could not be built. Check your .env.",
};

export interface ContentProps {
  scopes: string[];
  error?: string;
}

export function Content({ scopes, error }: ContentProps) {
  const message = error === undefined ? undefined : errorMessages[error];

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-6 px-6 py-16">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Sign in with Nemu
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          This app runs the authorization code flow with PKCE, stores the tokens
          in an encrypted cookie, and calls the management API as you.
        </p>
      </div>

      {message !== undefined && (
        <div className="border-destructive/40 bg-destructive/10 text-destructive-foreground flex items-start gap-3 rounded-lg border p-4 text-sm">
          <Alert02Icon className="mt-0.5 size-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      <Card
        title="Requested scopes"
        description="The consent screen shows exactly these."
      >
        <ul className="flex flex-wrap gap-2">
          {scopes.map((scope) => (
            <li
              key={scope}
              className="border-border bg-muted text-muted-foreground rounded-md border px-2 py-1 font-mono text-xs"
            >
              {scope}
            </li>
          ))}
        </ul>
      </Card>

      <a
        href="/api/auth/login"
        className="bg-primary text-primary-foreground focus-visible:ring-ring inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition hover:opacity-90 focus-visible:ring-2 focus-visible:outline-none"
      >
        Continue with Nemu
        <ArrowRight02Icon className="size-4" />
      </a>
    </main>
  );
}
