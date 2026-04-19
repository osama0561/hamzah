import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import CalculatorClient from "@/components/CalculatorClient";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function CalculatorPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return <CalculatorClient userEmail={session.user?.email ?? undefined} />;
}
