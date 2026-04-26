import { createUploadthing, type FileRouter } from "uploadthing/next"
import { auth } from "@/lib/auth"

const f = createUploadthing()

export const ourFileRouter = {
  videoUploader: f({ video: { maxFileSize: "64MB", maxFileCount: 1 } })
    .middleware(async () => {
      const session = await auth()
      if (!session?.user) throw new Error("Unauthorized")
      return { userId: session.user.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.url }
    }),

  fileUploader: f({ blob: { maxFileSize: "16MB", maxFileCount: 1 } })
    .middleware(async () => {
      const session = await auth()
      if (!session?.user) throw new Error("Unauthorized")
      return { userId: session.user.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.url }
    }),

  // Lesson document uploader — accepts PDFs, Office docs, images, archives, etc.
  documentUploader: f({
    "application/pdf": { maxFileSize: "64MB", maxFileCount: 1 },
    "application/msword": { maxFileSize: "32MB", maxFileCount: 1 },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { maxFileSize: "32MB", maxFileCount: 1 },
    "application/vnd.ms-powerpoint": { maxFileSize: "64MB", maxFileCount: 1 },
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": { maxFileSize: "64MB", maxFileCount: 1 },
    "application/vnd.ms-excel": { maxFileSize: "32MB", maxFileCount: 1 },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": { maxFileSize: "32MB", maxFileCount: 1 },
    "text/plain": { maxFileSize: "8MB", maxFileCount: 1 },
    "text/csv": { maxFileSize: "16MB", maxFileCount: 1 },
    "text/markdown": { maxFileSize: "8MB", maxFileCount: 1 },
    image: { maxFileSize: "16MB", maxFileCount: 1 },
    video: { maxFileSize: "256MB", maxFileCount: 1 },
    audio: { maxFileSize: "64MB", maxFileCount: 1 },
    blob: { maxFileSize: "32MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const session = await auth()
      if (!session?.user) throw new Error("Unauthorized")
      const role = (session.user as { role?: string }).role
      if (role !== "TEACHER" && role !== "ADMIN") throw new Error("Forbidden")
      return { userId: session.user.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return {
        uploadedBy: metadata.userId,
        url: file.url,
        name: file.name,
        size: file.size,
        type: file.type,
      }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
