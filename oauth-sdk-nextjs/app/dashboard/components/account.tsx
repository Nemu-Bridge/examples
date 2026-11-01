import type { UserData } from "@nemu-ai/sdk";
import { Card } from "@/components/ui/card";

export interface AccountProps {
  user: UserData;
}

export function Account({ user }: AccountProps) {
  const rows: [string, string][] = [
    ["Email", user.email],
    ["Username", user.username ?? "Not set"],
    ["Role", user.role],
    ["Account type", user.account_type],
    ["Plan", user.plan ?? "None"],
    ["Email verified", user.email_verified ? "Yes" : "No"],
  ];

  return (
    <Card
      title="Account"
      description="Returned by GET /api/v1/user, which needs profile:read."
    >
      <dl className="grid gap-3 sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt className="text-muted-foreground text-xs">{label}</dt>
            <dd className="mt-0.5 text-sm">{value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
