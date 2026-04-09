"use client"

import * as React from "react"
import { useActionState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Button } from "@/components/ui/button"
import { Toast } from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"
import { updateProfile, changePassword } from "@/actions/settings-actions"
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes"

interface SettingsClientProps {
  initialName: string
  initialEmail: string
  initialDepartment: string
  userRole: string
}

export function SettingsClient({
  initialName,
  initialEmail,
  initialDepartment,
  userRole,
}: SettingsClientProps) {
  // Profile state
  const [name, setName] = React.useState(initialName)
  const [department, setDepartment] = React.useState(initialDepartment)

  // Password state
  const [currentPassword, setCurrentPassword] = React.useState("")
  const [newPassword, setNewPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")

  const { showToast, hideToast, toastProps } = useToast()

  // Dismiss any visible toast when the component unmounts (finding 11).
  React.useEffect(() => {
    return () => hideToast()
  }, [hideToast])

  type FormState = { error?: string; success?: boolean } | null

  // Profile form via useActionState (finding 9).
  const [profileState, profileAction, profilePending] = useActionState<FormState, FormData>(
    async (_prevState, formData) => {
      const result = await updateProfile(null, formData)
      if ("error" in result) {
        showToast(result.error, "error")
        return { error: result.error }
      }
      showToast("Profile updated successfully.", "success")
      return { success: true }
    },
    null
  )

  // Password form via useActionState (finding 9).
  const [, passwordAction, passwordPending] = useActionState<FormState, FormData>(
    async (_prevState, formData) => {
      const result = await changePassword(null, formData)
      if ("error" in result) {
        showToast(result.error, "error")
        return { error: result.error }
      }
      showToast("Password changed successfully.", "success")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      return { success: true }
    },
    null
  )

  // Finding 10: Only count password fields as dirty when newPassword is
  // non-empty. A bare currentPassword entry (user started then abandoned)
  // shouldn't trigger the unsaved-changes warning.
  const profileDirty = name !== initialName || department !== initialDepartment
  const passwordDirty = newPassword !== "" || confirmPassword !== ""
  useUnsavedChanges(profileDirty || passwordDirty)

  const showDepartment = userRole !== "STUDENT"

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

        <form action={profileAction} className="space-y-4">
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
              name="name"
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

          {/* Department — only for TEACHER/ADMIN (finding 2) */}
          {showDepartment && (
            <div>
              <label
                htmlFor="settings-department"
                className="block font-[family-name:var(--font-family-mono)] text-[10px] font-medium uppercase tracking-[1.5px] text-ink-ghost mb-1.5"
              >
                Department
              </label>
              <Input
                id="settings-department"
                name="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Robotics, Engineering…"
              />
            </div>
          )}

          {profileState?.error && (
            <p className="text-danger text-sm">{profileState.error}</p>
          )}

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

        <form action={passwordAction} className="space-y-4">
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
              name="currentPassword"
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
              name="newPassword"
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
              name="confirmPassword"
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
