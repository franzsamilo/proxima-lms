import type { Role, SchoolLevel, Tier, LessonType, SubmissionStatus, ModuleStatus } from "@prisma/client"

export type SerializedUser = {
  id: string
  name: string
  email: string
  role: Role
  image: string | null
  department: string | null
  schoolLevel: SchoolLevel | null
}

export type CourseWithModules = {
  id: string
  title: string
  description: string
  level: SchoolLevel
  tier: Tier
  maxStudents: number
  startDate: string
  endDate: string
  isPublished: boolean
  instructorId: string
  instructor: { name: string }
  modules: ModuleWithLessons[]
  _count: { enrollments: number }
}

export type ModuleWithLessons = {
  id: string
  title: string
  order: number
  status: ModuleStatus
  lessons: LessonSummary[]
}

export type LessonSummary = {
  id: string
  title: string
  type: LessonType
  order: number
  durationMins: number
}

export type SubmissionWithDetails = {
  id: string
  status: SubmissionStatus
  submittedAt: string | null
  gradedAt: string | null
  grade: number | null
  feedback: string | null
  codeContent: string | null
  videoUrl: string | null
  quizAnswers: Record<string, string> | null
  fileUrl: string | null
  student: { id: string; name: string }
  lesson: { id: string; title: string; type: LessonType }
}
