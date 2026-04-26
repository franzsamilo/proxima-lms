"use client"

import { useActionState, useState } from "react"
import Link from "next/link"
import { AuthFrame } from "@/components/auth/auth-frame"
import { TerminalInput, TerminalPasswordInput, TerminalSelect } from "@/components/auth/terminal-input"
import { ProtocolButton } from "@/components/ui/protocol-button"
import { AlertOctagon, ArrowRight } from "lucide-react"
import { registerAction, type RegisterActionResult } from "@/actions/auth-actions"

type Role = "STUDENT" | "TEACHER"
type SchoolLevel = "ELEMENTARY" | "HS" | "COLLEGE"

export default function RegisterPage() {
  const [role, setRole] = useState<Role>("STUDENT")
  const [schoolLevel, setSchoolLevel] = useState<SchoolLevel>("HS")

  const [state, formAction, isPending] = useActionState<RegisterActionResult, FormData>(
    async (_prev, formData) => registerAction(formData),
    undefined
  )

  const fieldErrors = state?.ok === false ? state.fieldErrors ?? {} : {}
  const generalError = state?.ok === false ? state.error : null

  return (
    <AuthFrame
      eyebrow="Get started"
      title="Create your account"
      subtitle="Sign up as a student or teacher."
    >
      <form action={formAction} className="flex flex-col gap-5">
        <TerminalInput
          id="name"
          name="name"
          label="Full name"
          placeholder="Elena Torres"
          autoComplete="name"
          required
          disabled={isPending}
          error={fieldErrors.name}
        />

        <TerminalInput
          id="email"
          name="email"
          type="email"
          label="Email"
          placeholder="you@school.edu"
          autoComplete="email"
          required
          disabled={isPending}
          error={fieldErrors.email}
        />

        <div className="grid grid-cols-2 gap-4">
          <TerminalPasswordInput
            id="password"
            name="password"
            label="Password"
            autoComplete="new-password"
            required
            disabled={isPending}
            error={fieldErrors.password}
          />
          <TerminalPasswordInput
            id="confirmPassword"
            name="confirmPassword"
            label="Confirm"
            autoComplete="new-password"
            required
            disabled={isPending}
            error={fieldErrors.confirmPassword}
          />
        </div>

        <input type="hidden" name="role" value={role} />
        <div className="flex flex-col gap-2">
          <span className="font-[family-name:var(--font-family-body)] text-[12px] font-medium text-ink-secondary">
            I am a…
          </span>
          <div className="grid grid-cols-2 gap-2">
            {(["STUDENT", "TEACHER"] as Role[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                disabled={isPending}
                className={[
                  "relative h-10 rounded-[6px] border font-[family-name:var(--font-family-body)] text-[13px] font-medium transition-all duration-200 disabled:opacity-50",
                  role === r
                    ? "bg-signal-muted text-signal border-signal shadow-[0_0_0_3px_var(--color-signal-glow)]"
                    : "bg-surface-3/60 text-ink-secondary border-edge hover:border-edge-strong hover:text-ink-primary",
                ].join(" ")}
              >
                <span className="relative">
                  {role === r && <span className="mr-2 text-signal">●</span>}
                  {r === "STUDENT" ? "Student" : "Teacher"}
                </span>
              </button>
            ))}
          </div>
        </div>

        {role === "STUDENT" && (
          <TerminalSelect
            id="schoolLevel"
            name="schoolLevel"
            label="School level"
            value={schoolLevel}
            onChange={(e) => setSchoolLevel(e.target.value as SchoolLevel)}
            disabled={isPending}
          >
            <option value="ELEMENTARY">Elementary</option>
            <option value="HS">High school</option>
            <option value="COLLEGE">College</option>
          </TerminalSelect>
        )}

        {generalError && (
          <div className="flex items-start gap-2 rounded-[6px] border border-danger/40 bg-danger-tint px-3 py-2.5">
            <AlertOctagon size={14} className="mt-0.5 shrink-0 text-danger" />
            <p className="font-[family-name:var(--font-family-mono)] text-[11px] tracking-wide text-danger leading-relaxed">
              {generalError}
            </p>
          </div>
        )}

        <ProtocolButton type="submit" disabled={isPending} loading={isPending}>
          {isPending ? "Creating account…" : "Create account"}
          {!isPending && <ArrowRight size={14} />}
        </ProtocolButton>
      </form>

      <div className="mt-7 flex items-center gap-3">
        <span className="h-px flex-1 bg-edge" />
        <span className="font-[family-name:var(--font-family-body)] text-[12px] text-ink-tertiary">
          Already have an account?
        </span>
        <span className="h-px flex-1 bg-edge" />
      </div>

      <Link
        href="/login"
        className="mt-4 group flex items-center justify-center gap-2 font-[family-name:var(--font-family-body)] text-[13px] text-ink-secondary hover:text-signal transition-colors duration-200"
      >
        Sign in
        <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
      </Link>
    </AuthFrame>
  )
}
