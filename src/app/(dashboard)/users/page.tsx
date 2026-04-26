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

  const studentCount = userRows.filter(u => u.role === "STUDENT").length
  const teacherCount = userRows.filter(u => u.role === "TEACHER").length
  const adminCount = userRows.filter(u => u.role === "ADMIN").length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-[family-name:var(--font-family-display)] text-[28px] md:text-[36px] font-bold tracking-tight text-ink-primary leading-[1.05]">
          Users
        </h1>
        <p className="font-[family-name:var(--font-family-body)] text-[14px] text-ink-tertiary">
          {userRows.length} total · <span className="text-success">{studentCount} students</span> · <span className="text-info">{teacherCount} teachers</span> · <span className="text-purple">{adminCount} admins</span>
        </p>
      </div>

      <UsersClient users={userRows} />
    </div>
  )
}
