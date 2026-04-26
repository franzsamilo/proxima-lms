import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  role: z.enum(["STUDENT", "TEACHER"]),
  schoolLevel: z.enum(["ELEMENTARY", "HS", "COLLEGE"]).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export const createCourseSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10),
  level: z.enum(["ELEMENTARY", "HS", "COLLEGE"]),
  maxStudents: z.number().int().min(1).max(200).default(30),
  startDate: z.string().transform((s) => new Date(s)),
  endDate: z.string().transform((s) => new Date(s)),
})

export const updateCourseSchema = createCourseSchema.partial()

export const createModuleSchema = z.object({
  title: z.string().min(2).max(100),
  courseId: z.string().cuid(),
})

export const createLessonSchema = z.object({
  title: z.string().min(2).max(100),
  type: z.enum(["SLIDES", "CODE", "QUIZ", "TASK", "VIDEO", "DOCUMENT"]),
  durationMins: z.number().int().min(1).max(480).default(30),
  content: z.any().optional(),
  codeSkeleton: z.string().optional(),
  fileUrl: z.string().url().optional().nullable(),
  fileName: z.string().max(260).optional().nullable(),
  fileMime: z.string().max(120).optional().nullable(),
  fileSize: z.number().int().min(0).optional().nullable(),
  moduleId: z.string().cuid(),
})

export const updateModuleSchema = z.object({
  title: z.string().min(2).max(100).optional(),
  order: z.number().int().min(0).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
})

export const updateLessonSchema = createLessonSchema.partial().omit({ moduleId: true })

export const submitTaskSchema = z.object({
  lessonId: z.string().cuid(),
  codeContent: z.string().optional(),
  videoUrl: z.string().url().optional(),
  quizAnswers: z.record(z.string(), z.string()).optional(),
  fileUrl: z.string().url().optional(),
})

export const tasksQuerySchema = z.object({
  status: z.enum(["DRAFT", "SUBMITTED", "GRADED", "RETURNED"]).optional(),
  courseId: z.string().cuid().optional(),
  tab: z.enum(["all", "pending", "graded"]).optional(),
})

export const gradeTaskSchema = z.object({
  grade: z.number().int().min(0).max(100),
  feedback: z.string().max(2000).optional(),
})

export const createEventSchema = z.object({
  title: z.string().min(2).max(100),
  date: z
    .string()
    .transform((s) => new Date(s))
    .refine((d) => !Number.isNaN(d.getTime()), { message: "Invalid date" })
    .refine(
      (d) => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return d.getTime() >= today.getTime()
      },
      { message: "Date cannot be in the past" }
    ),
  type: z.enum(["deadline", "exam", "event"]),
  courseId: z
    .string()
    .optional()
    .transform((v) => (v === "" || v === undefined ? undefined : v))
    .pipe(z.string().cuid().optional()),
})

export const assignKitSchema = z.object({
  kitId: z.string().cuid(),
  userId: z.string().cuid(),
})

export const createKitSchema = z.object({
  name: z.string().min(2).max(100),
  level: z.enum(["ELEMENTARY", "HS", "COLLEGE"]),
  specs: z.string().min(5),
  totalQty: z.number().int().min(1).max(500),
  imageEmoji: z.string().min(1).max(8).default("🤖"),
})

export const updateKitSchema = createKitSchema.partial()

export const userRoleEnum = z.enum(["STUDENT", "TEACHER", "ADMIN"])

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  role: userRoleEnum.optional(),
  department: z.string().max(100).nullable().optional(),
  schoolLevel: z.enum(["ELEMENTARY", "HS", "COLLEGE"]).nullable().optional(),
})

export const usersQuerySchema = z.object({
  role: userRoleEnum.optional(),
  search: z.string().max(100).optional(),
})

// ─── Announcements ───

export const createAnnouncementSchema = z.object({
  title: z.string().min(2).max(120),
  content: z.string().min(2).max(5000),
  priority: z.enum(["LOW", "NORMAL", "HIGH"]).default("NORMAL"),
})

// ─── Settings ───

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters")
    .refine((s) => s.trim().length >= 2, {
      message: "Name must be at least 2 characters",
    }),
  department: z
    .string()
    .max(100, "Department must be at most 100 characters")
    .nullable()
    .optional(),
})

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(6, "Current password must be at least 6 characters")
      .max(128),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters")
      .max(72, "New password must be at most 72 characters")
      .refine((s) => s.trim().length >= 6, {
        message: "New password cannot be only whitespace",
      }),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((d) => d.currentPassword !== d.newPassword, {
    message: "New password must differ from current password",
    path: ["newPassword"],
  })
