import { Card } from "@/components/ui/card";

export interface ScopesProps {
  scopes: string[];
}

export function Scopes({ scopes }: ScopesProps) {
  return (
    <Card
      title="Granted scopes"
      description="Built with build_scopes in lib/oauth.ts."
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
  );
}
