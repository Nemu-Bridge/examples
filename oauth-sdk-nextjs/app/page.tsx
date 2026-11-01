import { redirect } from "next/navigation";
import { read_session } from "@/lib/session";
import { SCOPES } from "@/lib/oauth";
import { Content } from "./content";

export interface HomePageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const session = await read_session();
  if (session !== null) redirect("/dashboard");

  const { error } = await searchParams;
  return <Content scopes={SCOPES} error={error} />;
}
