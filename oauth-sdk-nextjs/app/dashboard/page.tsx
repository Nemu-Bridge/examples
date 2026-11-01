import { redirect } from "next/navigation";
import { get_client } from "@/lib/client";
import { SCOPES } from "@/lib/oauth";
import { Content } from "./content";

export default async function DashboardPage() {
  const nemu = await get_client();
  if (nemu === null) redirect("/api/auth/login");

  const [user, workspaces] = await Promise.all([
    nemu.user.get(),
    nemu.workspaces.list(),
  ]);

  return (
    <Content
      user={user.toJSON()}
      workspaces={workspaces.map((workspace) => workspace.toJSON())}
      scopes={SCOPES}
    />
  );
}
