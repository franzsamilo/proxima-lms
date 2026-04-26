"use server"

import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth-helpers"

export interface SearchResult {
  id: string
  type: "course" | "lesson" | "user" | "package" | "kit"
  title: string
  subtitle?: string
  href: string
  badge?: string
}

export interface SearchResponse {
  query: string
  results: SearchResult[]
  total: number
}

const PER_KIND = 4

export async function searchAction(query: string): Promise<SearchResponse> {
  const q = query.trim()
  if (q.length < 2) return { query: q, results: [], total: 0 }

  const user = await getCurrentUser()
  if (!user) return { query: q, results: [], total: 0 }

  const role = user.role
  const search = q

  // Role-aware course filter
  const courseWhere =
    role === "STUDENT"
      ? { enrollments: { some: { studentId: user.id } } }
      : role === "TEACHER"
        ? { instructorId: user.id }
        : {}

  // Lessons: same scope as their enrolled/taught courses
  const lessonWhere =
    role === "STUDENT"
      ? {
          module: {
            course: { enrollments: { some: { studentId: user.id } } },
          },
        }
      : role === "TEACHER"
        ? { module: { course: { instructorId: user.id } } }
        : {}

  const [courses, lessons, packages, users, kits] = await Promise.all([
    prisma.course.findMany({
      where: {
        AND: [
          courseWhere,
          {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
            ],
          },
        ],
      },
      take: PER_KIND,
      select: { id: true, title: true, level: true, instructor: { select: { name: true } } },
    }),
    prisma.lesson.findMany({
      where: {
        AND: [
          lessonWhere,
          { title: { contains: search, mode: "insensitive" } },
        ],
      },
      take: PER_KIND,
      select: {
        id: true,
        title: true,
        type: true,
        module: { select: { title: true, course: { select: { title: true } } } },
      },
    }),
    prisma.lessonPackage.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      },
      take: PER_KIND,
      select: { id: true, name: true, level: true, tier: true },
    }),
    role === "ADMIN"
      ? prisma.user.findMany({
          where: {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          },
          take: PER_KIND,
          select: { id: true, name: true, email: true, role: true },
        })
      : Promise.resolve([]),
    role === "TEACHER" || role === "ADMIN"
      ? prisma.hardwareKit.findMany({
          where: {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { specs: { contains: search, mode: "insensitive" } },
            ],
          },
          take: PER_KIND,
          select: { id: true, name: true, level: true },
        })
      : Promise.resolve([]),
  ])

  const results: SearchResult[] = [
    ...courses.map((c) => ({
      id: c.id,
      type: "course" as const,
      title: c.title,
      subtitle: `Course · ${c.instructor.name}`,
      href: `/courses/${c.id}`,
      badge: c.level,
    })),
    ...lessons.map((l) => ({
      id: l.id,
      type: "lesson" as const,
      title: l.title,
      subtitle: `${l.module.course.title} › ${l.module.title}`,
      href: `/lessons/${l.id}`,
      badge: l.type,
    })),
    ...packages.map((p) => ({
      id: p.id,
      type: "package" as const,
      title: p.name,
      subtitle: `Package · ${p.tier}`,
      href: `/packages`,
      badge: p.level,
    })),
    ...users.map((u) => ({
      id: u.id,
      type: "user" as const,
      title: u.name,
      subtitle: u.email,
      href: `/users`,
      badge: u.role,
    })),
    ...kits.map((k) => ({
      id: k.id,
      type: "kit" as const,
      title: k.name,
      subtitle: "Hardware kit",
      href: `/hardware`,
      badge: k.level,
    })),
  ]

  return { query: q, results, total: results.length }
}
