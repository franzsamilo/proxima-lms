-- Backfill existing string values to uppercase
UPDATE "Announcement" SET "priority" = upper("priority") WHERE "priority" IS NOT NULL;

-- CreateEnum
CREATE TYPE "AnnouncementPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH');

-- AlterTable: convert String column to enum
ALTER TABLE "Announcement" ALTER COLUMN "priority" DROP DEFAULT;
ALTER TABLE "Announcement" ALTER COLUMN "priority" TYPE "AnnouncementPriority" USING ("priority"::"AnnouncementPriority");
ALTER TABLE "Announcement" ALTER COLUMN "priority" SET DEFAULT 'NORMAL';
