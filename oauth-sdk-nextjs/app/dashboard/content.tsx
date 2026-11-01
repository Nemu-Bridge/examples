import type { UserData, WorkspaceData } from "@nemu-ai/sdk";
import { Account } from "./components/account";
import { Workspaces } from "./components/workspaces";
import { Scopes } from "./components/scopes";

export interface ContentProps {
  user: UserData;
  workspaces: WorkspaceData[];
  scopes: string[];
}

export function Content({ user, workspaces, scopes }: ContentProps) {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-16">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Every value below was read from the API with the token this app was
            granted.
          </p>
        </div>
        <form action="/api/auth/logout" method="post">
          <button
            type="submit"
            className="border-border bg-card hover:bg-accent focus-visible:ring-ring inline-flex h-10 items-center rounded-lg border px-4 text-sm font-medium transition focus-visible:ring-2 focus-visible:outline-none"
          >
            Sign out
          </button>
        </form>
      </header>

      <Account user={user} />
      <Workspaces workspaces={workspaces} />
      <Scopes scopes={scopes} />
    </main>
  );
}
