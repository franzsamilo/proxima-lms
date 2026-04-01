import { getCurrentUser } from "@/lib/auth-helpers"
import { redirect } from "next/navigation"
import { SettingsClient } from "@/components/settings/settings-client"

export default async function SettingsPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  return (
    <SettingsClient
      initialName={user.name}
      initialEmail={user.email}
      initialDepartment={user.department ?? ""}
    />
  )
}
