-- AlterTable
ALTER TABLE "Occurrence" ADD COLUMN     "photos" TEXT[],
ADD COLUMN     "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "respondedAt" TIMESTAMP(3),
ADD COLUMN     "respondedBy" TEXT;
