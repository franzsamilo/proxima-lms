"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Button } from "@/components/ui/button"
import { Toast } from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"
import { updateProfile, changePassword } from "@/actions/settings-actions"

interface SettingsClientProps {
  initialName: string
  initialEmail: string
  initialDepartment: string
}

export function SettingsClient({
  initialName,
  initialEmail,
  initialDepartment,
}: SettingsClientProps) {
  // Profile state
  const [name, setName] = React.useState(initialName)
  const [department, setDepartment] = React.useState(initialDepartment)
  const [profilePending, setProfilePending] = React.useState(false)

  // Password state
  const [currentPassword, setCurrentPassword] = React.useState("")
  const [newPassword, setNewPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [passwordPending, setPasswordPending] = React.useState(false)

  const { showToast, toastProps } = useToast()

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault()
    setProfilePending(true)

    const formData = new FormData()
    formData.set("name", name)
    formData.set("department", department)

    const result = await updateProfile(formData)

    if (result?.error) {
      showToast(result.error, "error")
    } else {
      showToast("Profile updated successfully.", "success")
    }
    setProfilePending(false)
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    setPasswordPending(true)

    const formData = new FormData()
    formData.set("currentPassword", currentPassword)
    formData.set("newPassword", newPassword)
    formData.set("confirmPassword", confirmPassword)

    const result = await changePassword(formData)

    if (result?.error) {
      showToast(result.error, "error")
    } else {
      showToast("Password changed successfully.", "success")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    }
    setPasswordPending(false)
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-[family-name:var(--font-family-display)] text-[24px] font-bold tracking-tight text-ink-primary">
        Settings
      </h1>

      {/* Profile section */}
      <Card>
        <h2 className="font-[family-name:var(--font-family-display)] text-[16px] font-bold text-ink-primary mb-5">
          Profile
        </h2>

        <form onSubmit={handleProfileSave} className="space-y-4">
          {/* Name */}
          <div>
            <label
              htmlFor="settings-name"
              className="block font-[family-name:var(--font-family-mono)] text-[10px] font-medium uppercase tracking-[1.5px] text-ink-ghost mb-1.5"
            >
              Name
            </label>
            <Input
              id="settings-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              required
              minLength={2}
            />
          </div>

          {/* Email (read-only) */}
          <div>
            <label
              htmlFor="settings-email"
              className="block font-[family-name:var(--font-family-mono)] text-[10px] font-medium uppercase tracking-[1.5px] text-ink-ghost mb-1.5"
            >
              Email
            </label>
            <Input
              id="settings-email"
              type="email"
              defaultValue={initialEmail}
              readOnly
              disabled
              className="opacity-60 cursor-not-allowed"
            />
            <p className="mt-1 font-[family-name:var(--font-family-mono)] text-[10px] text-ink-ghost">
              Email cannot be changed.
            </p>
          </div>

          {/* Department */}
          <div>
            <label
              htmlFor="settings-department"
              className="block font-[family-name:var(--font-family-mono)] text-[10px] font-medium uppercase tracking-[1.5px] text-ink-ghost mb-1.5"
            >
              Department
            </label>
            <Input
              id="settings-department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. Robotics, Engineering…"
            />
          </div>

          <div className="pt-2">
            <Button type="submit" disabled={profilePending}>
              {profilePending ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </form>
      </Card>

      {/* Password section */}
      <Card>
        <h2 className="font-[family-name:var(--font-family-display)] text-[16px] font-bold text-ink-primary mb-5">
          Change Password
        </h2>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          {/* Current password */}
          <div>
            <label
              htmlFor="settings-current-password"
              className="block font-[family-name:var(--font-family-mono)] text-[10px] font-medium uppercase tracking-[1.5px] text-ink-ghost mb-1.5"
            >
              Current Password
            </label>
            <PasswordInput
              id="settings-current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              required
              autoComplete="current-password"
            />
          </div>

          {/* New password */}
          <div>
            <label
              htmlFor="settings-new-password"
              className="block font-[family-name:var(--font-family-mono)] text-[10px] font-medium uppercase tracking-[1.5px] text-ink-ghost mb-1.5"
            >
              New Password
            </label>
            <PasswordInput
              id="settings-new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          {/* Confirm new password */}
          <div>
            <label
              htmlFor="settings-confirm-password"
              className="block font-[family-name:var(--font-family-mono)] text-[10px] font-medium uppercase tracking-[1.5px] text-ink-ghost mb-1.5"
            >
              Confirm New Password
            </label>
            <PasswordInput
              id="settings-confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat new password"
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          <div className="pt-2">
            <Button type="submit" disabled={passwordPending}>
              {passwordPending ? "Changing…" : "Change Password"}
            </Button>
          </div>
        </form>
      </Card>

      <Toast {...toastProps} />
    </div>
  )
}
