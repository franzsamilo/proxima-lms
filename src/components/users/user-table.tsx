"use client"

import * as React from "react"
import { Avatar } from "@/components/ui/avatar"
import { Badge, LevelBadge } from "@/components/ui/badge"
import type { BadgeVariant } from "@/components/ui/badge"

export interface UserRow {
  id: string
  name: string
  email: string
  role: "STUDENT" | "TEACHER" | "ADMIN"
  schoolLevel: string | null
  department: string | null
  createdAt: Date
  _count: { enrollments: number }
}

const roleVariantMap: Record<string, BadgeVariant> = {
  STUDENT: "info",
  TEACHER: "warning",
  ADMIN: "purple",
}

const roleLabelMap: Record<string, string> = {
  STUDENT: "Student",
  TEACHER: "Teacher",
  ADMIN: "Admin",
}

interface UserTableProps {
  users: UserRow[]
  onEdit: (user: UserRow) => void
}

export function UserTable({ users, onEdit }: UserTableProps) {
  if (users.length === 0) {
    return (
      <div className="px-4 py-12 text-center">
        <p className="font-[family-name:var(--font-family-body)] text-[13px] text-ink-secondary">
          No users found.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-edge">
            <th className="text-left font-[family-name:var(--font-family-mono)] text-[10px] font-medium uppercase tracking-[1.5px] text-ink-ghost py-3 px-4">
              Name
            </th>
            <th className="text-left font-[family-name:var(--font-family-mono)] text-[10px] font-medium uppercase tracking-[1.5px] text-ink-ghost py-3 px-4">
              Email
            </th>
            <th className="text-left font-[family-name:var(--font-family-mono)] text-[10px] font-medium uppercase tracking-[1.5px] text-ink-ghost py-3 px-4">
              Role
            </th>
            <th className="text-left font-[family-name:var(--font-family-mono)] text-[10px] font-medium uppercase tracking-[1.5px] text-ink-ghost py-3 px-4">
              Level
            </th>
            <th className="text-left font-[family-name:var(--font-family-mono)] text-[10px] font-medium uppercase tracking-[1.5px] text-ink-ghost py-3 px-4">
              Courses
            </th>
            <th className="text-left font-[family-name:var(--font-family-mono)] text-[10px] font-medium uppercase tracking-[1.5px] text-ink-ghost py-3 px-4">
              Joined
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, idx) => {
            const isLast = idx === users.length - 1
            return (
              <tr
                key={user.id}
                onClick={() => onEdit(user)}
                className={`hover:bg-surface-3 transition-colors duration-150 cursor-pointer ${
                  isLast ? "" : "border-b border-edge"
                }`}
              >
                {/* Name with Avatar */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={user.name} size={32} />
                    <span className="font-[family-name:var(--font-family-body)] text-[13px] font-semibold text-ink-primary">
                      {user.name}
                    </span>
                  </div>
                </td>

                {/* Email */}
                <td className="py-3 px-4 font-[family-name:var(--font-family-body)] text-[13px] text-ink-secondary">
                  {user.email}
                </td>

                {/* Role Badge */}
                <td className="py-3 px-4">
                  <Badge variant={roleVariantMap[user.role] ?? "neutral"}>
                    {roleLabelMap[user.role] ?? user.role}
                  </Badge>
                </td>

                {/* Level Badge */}
                <td className="py-3 px-4">
                  {user.schoolLevel ? (
                    <LevelBadge level={user.schoolLevel} />
                  ) : (
                    <span className="font-[family-name:var(--font-family-body)] text-[13px] text-ink-ghost">
                      —
                    </span>
                  )}
                </td>

                {/* Enrollments */}
                <td className="py-3 px-4 font-[family-name:var(--font-family-body)] text-[13px] text-ink-secondary">
                  {user._count.enrollments}
                </td>

                {/* Joined date */}
                <td className="py-3 px-4 font-[family-name:var(--font-family-body)] text-[13px] text-ink-secondary">
                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
