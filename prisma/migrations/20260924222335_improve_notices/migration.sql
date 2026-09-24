-- AlterTable
ALTER TABLE "Notice" ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "pinnedUntil" TIMESTAMP(3),
ADD COLUMN     "views" INTEGER NOT NULL DEFAULT 0;
