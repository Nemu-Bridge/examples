import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { SCOPE } from "@/lib/provider";
import { Content } from "./content";

export default async function HomePage() {
  const session = await auth();
  if (session !== null && session.error === undefined) redirect("/dashboard");

  async function start() {
    "use server";
    await signIn("nemu", { redirectTo: "/dashboard" });
  }

  return <Content scopes={SCOPE.split(" ")} start={start} />;
}
