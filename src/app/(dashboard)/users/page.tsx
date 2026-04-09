import { getCurrentUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { UsersClient } from "@/components/users/users-client"
import type { UserRow } from "@/components/users/user-table"
import { usersQuerySchema } from "@/lib/validations"
import type { Prisma } from "@prisma/client"

export default async function UsersPage(props: {
  searchParams: Promise<{ role?: string; search?: string }>
}) {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (user.role !== "ADMIN") redirect("/dashboard")

  const searchParams = await props.searchParams
  const parsed = usersQuerySchema.safeParse({
    role: searchParams.role,
    search: searchParams.search,
  })

  const where: Prisma.UserWhereInput = {}
  if (parsed.success) {
    if (parsed.data.role) where.role = parsed.data.role
    if (parsed.data.search) {
      where.OR = [
        { name: { contains: parsed.data.search, mode: "insensitive" } },
        { email: { contains: parsed.data.search, mode: "insensitive" } },
      ]
    }
  }

  const users = await prisma.user.findMany({
    where,
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
    role: u.role,
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
