"use client"

import { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]" />}>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const searchParams = useSearchParams()
  const urlError = searchParams.get("error")

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(urlError)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await signIn("credentials", {
        email,
        password,
        redirectTo: "/dashboard",
      })
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Logo Block */}
      <div className="flex flex-col items-center gap-3">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-signal to-[#0EA5A0] flex items-center justify-center">
          <span className="font-[family-name:var(--font-family-display)] text-2xl font-extrabold text-white">
            P
          </span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="font-[family-name:var(--font-family-display)] text-2xl font-extrabold tracking-[6px] bg-clip-text text-transparent bg-gradient-to-r from-signal to-[#0EA5A0]">
            PROXIMA
          </span>
          <span className="font-[family-name:var(--font-family-mono)] text-[10px] font-medium tracking-[4px] text-ink-ghost uppercase">
            ROBOTICS LMS
          </span>
        </div>
      </div>

      {/* Card */}
      <div className="w-full bg-surface-2 border border-edge rounded-[var(--radius-lg)] p-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="font-[family-name:var(--font-family-mono)] text-[10px] font-medium tracking-[1.5px] uppercase text-ink-ghost"
            >
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@proxima.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="font-[family-name:var(--font-family-mono)] text-[10px] font-medium tracking-[1.5px] uppercase text-ink-ghost"
            >
              Password
            </label>
            <PasswordInput
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="text-[12px] text-danger bg-danger-tint border border-danger/20 rounded-[var(--radius-md)] px-3 py-2">
              {error === "CredentialsSignin"
                ? "Invalid email or password. Please try again."
                : error}
            </p>
          )}

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-1"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <p className="mt-6 text-center font-[family-name:var(--font-family-body)] text-[13px] text-ink-tertiary">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-signal hover:text-signal-hover transition-colors duration-200"
          >
            Create one
          </Link>
        </p>
      </div>

      {/* Demo Hint */}
      <p className="font-[family-name:var(--font-family-body)] text-[11px] text-ink-ghost text-center">
        Demo: elena@proxima.edu / password123
      </p>
    </div>
  )
}
