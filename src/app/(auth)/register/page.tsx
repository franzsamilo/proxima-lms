"use client"

import { useState } from "react"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"

type Role = "STUDENT" | "TEACHER"
type SchoolLevel = "ELEMENTARY" | "HIGH_SCHOOL" | "COLLEGE"

interface FieldErrors {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
  general?: string
}

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState<Role>("STUDENT")
  const [schoolLevel, setSchoolLevel] = useState<SchoolLevel>("HIGH_SCHOOL")
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})

  function validate(): boolean {
    const next: FieldErrors = {}
    if (!name.trim()) next.name = "Name is required."
    if (!email.trim()) next.email = "Email is required."
    if (!password) next.password = "Password is required."
    else if (password.length < 6) next.password = "Password must be at least 6 characters."
    if (password !== confirmPassword) next.confirmPassword = "Passwords do not match."
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    setErrors({})

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          ...(role === "STUDENT" ? { schoolLevel } : {}),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.errors) {
          setErrors(data.errors)
        } else {
          setErrors({ general: data.message || "Registration failed. Please try again." })
        }
        return
      }

      // Auto sign in after successful registration
      await signIn("credentials", {
        email,
        password,
        redirectTo: "/dashboard",
      })
    } catch {
      setErrors({ general: "Something went wrong. Please try again." })
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
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="name"
              className="font-[family-name:var(--font-family-mono)] text-[10px] font-medium tracking-[1.5px] uppercase text-ink-ghost"
            >
              Full Name
            </label>
            <Input
              id="name"
              type="text"
              placeholder="Elena Torres"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
            {errors.name && (
              <p className="text-[11px] text-danger">{errors.name}</p>
            )}
          </div>

          {/* Email */}
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
              autoComplete="email"
            />
            {errors.email && (
              <p className="text-[11px] text-danger">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="font-[family-name:var(--font-family-mono)] text-[10px] font-medium tracking-[1.5px] uppercase text-ink-ghost"
            >
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            {errors.password && (
              <p className="text-[11px] text-danger">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="confirmPassword"
              className="font-[family-name:var(--font-family-mono)] text-[10px] font-medium tracking-[1.5px] uppercase text-ink-ghost"
            >
              Confirm Password
            </label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
            {errors.confirmPassword && (
              <p className="text-[11px] text-danger">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Role Toggle */}
          <div className="flex flex-col gap-1.5">
            <span className="font-[family-name:var(--font-family-mono)] text-[10px] font-medium tracking-[1.5px] uppercase text-ink-ghost">
              Role
            </span>
            <div className="grid grid-cols-2 gap-2">
              {(["STUDENT", "TEACHER"] as Role[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={[
                    "h-10 rounded-[var(--radius-md)] border font-[family-name:var(--font-family-body)] text-[12px] font-semibold transition-all duration-200",
                    role === r
                      ? "bg-signal-muted text-signal border-signal"
                      : "bg-surface-3 text-ink-secondary border-edge hover:border-edge-strong hover:text-ink-primary",
                  ].join(" ")}
                >
                  {r === "STUDENT" ? "Student" : "Teacher"}
                </button>
              ))}
            </div>
          </div>

          {/* School Level (Student only) */}
          {role === "STUDENT" && (
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="schoolLevel"
                className="font-[family-name:var(--font-family-mono)] text-[10px] font-medium tracking-[1.5px] uppercase text-ink-ghost"
              >
                School Level
              </label>
              <Select
                id="schoolLevel"
                value={schoolLevel}
                onChange={(e) => setSchoolLevel(e.target.value as SchoolLevel)}
              >
                <option value="ELEMENTARY">Elementary</option>
                <option value="HIGH_SCHOOL">High School</option>
                <option value="COLLEGE">College</option>
              </Select>
            </div>
          )}

          {/* General Error */}
          {errors.general && (
            <p className="text-[12px] text-danger bg-danger-tint border border-danger/20 rounded-[var(--radius-md)] px-3 py-2">
              {errors.general}
            </p>
          )}

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-1"
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        <p className="mt-6 text-center font-[family-name:var(--font-family-body)] text-[13px] text-ink-tertiary">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-signal hover:text-signal-hover transition-colors duration-200"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
