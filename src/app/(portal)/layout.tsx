import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import PortalShell from "@/components/ui_components/portal/PortalShell";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  return <PortalShell>{children}</PortalShell>;
}
