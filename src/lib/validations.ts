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
  type: z.enum(["SLIDES", "CODE", "QUIZ", "TASK", "VIDEO"]),
  durationMins: z.number().int().min(1).max(480).default(30),
  content: z.any().optional(),
  codeSkeleton: z.string().optional(),
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

export const gradeTaskSchema = z.object({
  grade: z.number().int().min(0).max(100),
  feedback: z.string().max(2000).optional(),
})

export const createEventSchema = z.object({
  title: z.string().min(2).max(100),
  date: z.string().transform((s) => new Date(s)),
  type: z.enum(["deadline", "exam", "event"]),
  courseId: z.string().cuid().optional(),
})

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  role: z.enum(["STUDENT", "TEACHER", "ADMIN"]).optional(),
  department: z.string().optional(),
  schoolLevel: z.enum(["ELEMENTARY", "HS", "COLLEGE"]).nullable().optional(),
})
