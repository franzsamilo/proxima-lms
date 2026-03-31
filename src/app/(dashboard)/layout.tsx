import { getCurrentUser } from "@/lib/auth-helpers"
import { redirect } from "next/navigation"
import { DashboardShell } from "./dashboard-shell"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  return (
    <DashboardShell user={JSON.parse(JSON.stringify(user))}>
      {children}
    </DashboardShell>
  )
}
