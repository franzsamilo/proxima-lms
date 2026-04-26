"use client"

import { Suspense, useActionState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { AuthFrame } from "@/components/auth/auth-frame"
import { TerminalInput, TerminalPasswordInput } from "@/components/auth/terminal-input"
import { ProtocolButton } from "@/components/ui/protocol-button"
import { Telemetry } from "@/components/ui/telemetry"
import { ArrowRight, AlertOctagon } from "lucide-react"
import { loginAction, type LoginActionResult } from "@/actions/auth-actions"

const URL_REASONS: Record<string, string> = {
  session_expired: "Your session expired. Please sign in again.",
}

const URL_ERRORS: Record<string, string> = {
  CredentialsSignin: "Wrong email or password. Please try again.",
  CallbackRouteError: "Sign-in service error. Please retry.",
  Configuration: "Authentication is misconfigured. Contact support.",
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[400px]" />}>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const searchParams = useSearchParams()
  const from = searchParams.get("from") ?? "/dashboard"
  const reason = searchParams.get("reason")
  const urlError = searchParams.get("error")

  const initialError =
    (reason && URL_REASONS[reason]) ||
    (urlError && (URL_ERRORS[urlError] ?? urlError)) ||
    null

  const [state, formAction, isPending] = useActionState<LoginActionResult, FormData>(
    async (_prev, formData) => loginAction(from, formData),
    undefined
  )

  const error = state?.ok === false ? state.error : initialError

  return (
    <AuthFrame
      eyebrow="Welcome to Proxima"
      title="Sign in"
      subtitle="Enter your email and password to continue."
    >
      <form action={formAction} className="flex flex-col gap-5">
        <TerminalInput
          id="email"
          name="email"
          type="email"
          label="Email"
          placeholder="you@school.edu"
          required
          autoComplete="email"
          autoFocus
          disabled={isPending}
        />

        <TerminalPasswordInput
          id="password"
          name="password"
          label="Password"
          required
          autoComplete="current-password"
          disabled={isPending}
        />

        {error && (
          <div className="flex items-start gap-2 rounded-[6px] border border-danger/40 bg-danger-tint px-3 py-2.5">
            <AlertOctagon size={14} className="mt-0.5 shrink-0 text-danger" />
            <p className="font-[family-name:var(--font-family-mono)] text-[11px] tracking-wide text-danger leading-relaxed">
              {error}
            </p>
          </div>
        )}

        <ProtocolButton type="submit" disabled={isPending} loading={isPending}>
          {isPending ? "Signing in…" : "Sign in"}
          {!isPending && <ArrowRight size={14} />}
        </ProtocolButton>
      </form>

      <div className="mt-7 flex items-center gap-3">
        <span className="h-px flex-1 bg-edge" />
        <span className="font-[family-name:var(--font-family-body)] text-[12px] text-ink-tertiary">
          New here?
        </span>
        <span className="h-px flex-1 bg-edge" />
      </div>

      <Link
        href="/register"
        className="mt-4 group flex items-center justify-center gap-2 font-[family-name:var(--font-family-body)] text-[13px] text-ink-secondary hover:text-signal transition-colors duration-200"
      >
        Create an account
        <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
      </Link>

      {process.env.NODE_ENV === "development" && (
        <div className="mt-8 grid grid-cols-1 gap-2 rounded-[6px] border border-dashed border-edge bg-surface-1/40 p-3">
          <Telemetry className="text-ink-ghost">DEMO ACCOUNTS · DEV ONLY</Telemetry>
          <DemoRow role="Teacher" email="elena@proxima.edu" />
          <DemoRow role="Student" email="marcus@student.proxima.edu" />
          <Telemetry className="text-ink-ghost mt-1">Password: password123</Telemetry>
        </div>
      )}
    </AuthFrame>
  )
}

function DemoRow({ role, email }: { role: string; email: string }) {
  return (
    <div className="flex items-center justify-between gap-3 font-[family-name:var(--font-family-body)] text-[12px]">
      <span className="text-signal font-medium">{role}</span>
      <span className="text-ink-secondary truncate">{email}</span>
    </div>
  )
}
