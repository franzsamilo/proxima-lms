-- AlterEnum: add DOCUMENT to LessonType
ALTER TYPE "LessonType" ADD VALUE 'DOCUMENT';

-- AlterTable: add file attachment columns to Lesson
ALTER TABLE "Lesson" ADD COLUMN "fileUrl" TEXT;
ALTER TABLE "Lesson" ADD COLUMN "fileName" TEXT;
ALTER TABLE "Lesson" ADD COLUMN "fileMime" TEXT;
ALTER TABLE "Lesson" ADD COLUMN "fileSize" INTEGER;
