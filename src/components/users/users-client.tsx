"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { UserTable } from "./user-table"
import { EditUserModal } from "./edit-user-modal"
import type { UserRow } from "./user-table"

interface UsersClientProps {
  users: UserRow[]
}

export function UsersClient({ users }: UsersClientProps) {
  const [search, setSearch] = React.useState("")
  const [editingUser, setEditingUser] = React.useState<UserRow | null>(null)

  const filtered = users.filter((u) => {
    const q = search.toLowerCase()
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    )
  })

  return (
    <>
      {/* Search bar */}
      <div className="relative mb-5">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-ghost pointer-events-none"
        />
        <Input
          placeholder="Search by name, email or role…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <Card className="p-0 overflow-hidden">
        <UserTable users={filtered} onEdit={(u) => setEditingUser(u)} />
      </Card>

      {/* Edit modal */}
      <EditUserModal
        open={!!editingUser}
        onClose={() => setEditingUser(null)}
        user={editingUser}
      />
    </>
  )
}
