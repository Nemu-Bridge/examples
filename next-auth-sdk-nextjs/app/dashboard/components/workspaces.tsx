import type { WorkspaceData } from "@nemu-ai/sdk";
import { Card } from "@/components/ui/card";

export interface WorkspacesProps {
  workspaces: WorkspaceData[];
}

export function Workspaces({ workspaces }: WorkspacesProps) {
  return (
    <Card
      title="Workspaces"
      description="Returned by GET /api/v1/workspaces, which needs workspaces:read."
    >
      {workspaces.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          This account has no workspaces yet.
        </p>
      ) : (
        <ul className="divide-border divide-y">
          {workspaces.map((workspace) => (
            <li
              key={workspace.id}
              className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
            >
              <div>
                <p className="text-sm font-medium">{workspace.name}</p>
                <p className="text-muted-foreground font-mono text-xs">
                  {workspace.id}
                </p>
              </div>
              <span className="text-muted-foreground text-sm">
                Budget {workspace.budget}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
