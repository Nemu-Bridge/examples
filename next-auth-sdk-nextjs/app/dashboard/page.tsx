import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { get_client } from "@/lib/client";
import { Content } from "./content";

export default async function DashboardPage() {
  const session = await auth();
  if (session === null) redirect("/");
  if (session.error !== undefined) redirect("/?error=refresh_failed");

  const nemu = await get_client();
  if (nemu === null) redirect("/");

  const [user, workspaces] = await Promise.all([
    nemu.user.get(),
    nemu.workspaces.list(),
  ]);

  async function leave() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <Content
      user={user.toJSON()}
      workspaces={workspaces.map((workspace) => workspace.toJSON())}
      scopes={(session.scope ?? "").split(" ").filter(Boolean)}
      leave={leave}
    />
  );
}
