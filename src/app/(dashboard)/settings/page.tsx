import { getCurrentUser } from "@/lib/auth-helpers"
import { redirect } from "next/navigation"
import { SettingsClient } from "@/components/settings/settings-client"
import { Breadcrumb } from "@/components/ui/breadcrumb"

export default async function SettingsPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  return (
    <div>
      <Breadcrumb items={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Settings" },
      ]} />
      <SettingsClient
        initialName={user.name}
        initialEmail={user.email}
        initialDepartment={user.department ?? ""}
        userRole={user.role}
      />
    </div>
  )
}
