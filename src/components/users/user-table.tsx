"use client"

import * as React from "react"
import {
  DataTable,
  DataTableHeader,
  DataTableHead,
  DataTableBody,
  DataTableRow,
  DataTableCell,
} from "@/components/ui/data-table"
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

  const renderMobileCard = (user: UserRow) => (
    <button
      type="button"
      onClick={() => onEdit(user)}
      className="w-full text-left bg-surface-2 border border-edge rounded-[var(--radius-lg)] p-3.5 hover:border-edge-strong transition-colors cursor-pointer"
    >
      <div className="flex items-center gap-3 mb-2">
        <Avatar name={user.name} size={36} />
        <div className="min-w-0">
          <p className="font-[family-name:var(--font-family-body)] text-[13px] font-semibold text-ink-primary truncate">
            {user.name}
          </p>
          <p className="font-[family-name:var(--font-family-body)] text-[12px] text-ink-tertiary truncate">
            {user.email}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant={roleVariantMap[user.role] ?? "neutral"}>
          {roleLabelMap[user.role] ?? user.role}
        </Badge>
        {user.schoolLevel && <LevelBadge level={user.schoolLevel} />}
        <span className="font-[family-name:var(--font-family-body)] text-[11px] text-ink-tertiary ml-auto">
          {user._count.enrollments} {user._count.enrollments === 1 ? "course" : "courses"} · Joined{" "}
          {new Date(user.createdAt).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>
    </button>
  )

  return (
    <DataTable data={users} mobileCard={renderMobileCard}>
      <DataTableHeader>
        <tr>
          <DataTableHead>Name</DataTableHead>
          <DataTableHead>Email</DataTableHead>
          <DataTableHead>Role</DataTableHead>
          <DataTableHead>Level</DataTableHead>
          <DataTableHead>Courses</DataTableHead>
          <DataTableHead>Joined</DataTableHead>
        </tr>
      </DataTableHeader>
      <DataTableBody>
        {users.map((user, idx) => {
          const isLast = idx === users.length - 1
          return (
            <DataTableRow
              key={user.id}
              onClick={() => onEdit(user)}
              className={`cursor-pointer ${isLast ? "[&]:border-b-0" : ""}`}
            >
              <DataTableCell primary>
                <div className="flex items-center gap-2.5">
                  <Avatar name={user.name} size={32} />
                  <span>{user.name}</span>
                </div>
              </DataTableCell>
              <DataTableCell>{user.email}</DataTableCell>
              <DataTableCell>
                <Badge variant={roleVariantMap[user.role] ?? "neutral"}>
                  {roleLabelMap[user.role] ?? user.role}
                </Badge>
              </DataTableCell>
              <DataTableCell>
                {user.schoolLevel ? (
                  <LevelBadge level={user.schoolLevel} />
                ) : (
                  <span className="text-ink-ghost">—</span>
                )}
              </DataTableCell>
              <DataTableCell>{user._count.enrollments}</DataTableCell>
              <DataTableCell>
                {new Date(user.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </DataTableCell>
            </DataTableRow>
          )
        })}
      </DataTableBody>
    </DataTable>
  )
}
