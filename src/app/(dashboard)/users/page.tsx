import { getCurrentUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { UsersClient } from "@/components/users/users-client"
import type { UserRow } from "@/components/users/user-table"

export default async function UsersPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (user.role !== "ADMIN") redirect("/dashboard")

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      schoolLevel: true,
      department: true,
      createdAt: true,
      _count: {
        select: { enrollments: true },
      },
    },
  })

  const userRows: UserRow[] = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role as "STUDENT" | "TEACHER" | "ADMIN",
    schoolLevel: u.schoolLevel,
    department: u.department,
    createdAt: u.createdAt,
    _count: u._count,
  }))

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-[family-name:var(--font-family-display)] text-[20px] md:text-[24px] font-bold tracking-tight text-ink-primary">
          Users
        </h1>
        <p className="font-[family-name:var(--font-family-body)] text-[13px] text-ink-secondary mt-1">
          {userRows.length} {userRows.length === 1 ? "user" : "users"} registered
        </p>
      </div>

      <UsersClient users={userRows} />
    </div>
  )
}
