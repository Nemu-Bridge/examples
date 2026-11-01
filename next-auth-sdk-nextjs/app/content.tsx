import { ArrowRight02Icon } from "hugeicons-react";
import { Card } from "@/components/ui/card";

export interface ContentProps {
  scopes: string[];
  start: () => Promise<void>;
}

export function Content({ scopes, start }: ContentProps) {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-6 px-6 py-16">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Sign in with Nemu
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Nemu is registered as a custom Auth.js provider. Auth.js runs the
          authorization code flow with PKCE, keeps the session, and refreshes
          the access token when it expires.
        </p>
      </div>

      <Card
        title="Requested scopes"
        description="Built with format_scopes and handed to Auth.js as the scope parameter."
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

      <form action={start}>
        <button
          type="submit"
          className="bg-primary text-primary-foreground focus-visible:ring-ring inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition hover:opacity-90 focus-visible:ring-2 focus-visible:outline-none"
        >
          Continue with Nemu
          <ArrowRight02Icon className="size-4" />
        </button>
      </form>
    </main>
  );
}
