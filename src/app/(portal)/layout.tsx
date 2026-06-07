import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import PortalShell from "@/components/ui_components/portal/PortalShell";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/auth/login");

  return <PortalShell>{children}</PortalShell>;
}
