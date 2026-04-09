-- DropIndex
DROP INDEX "HardwareAssignment_kitId_userId_key";

-- CreateIndex
CREATE INDEX "HardwareAssignment_kitId_userId_idx" ON "HardwareAssignment"("kitId", "userId");
