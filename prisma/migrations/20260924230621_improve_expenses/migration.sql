-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "installment" INTEGER,
ADD COLUMN     "isRecurring" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "paidAmount" DOUBLE PRECISION,
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "recurringDay" INTEGER,
ADD COLUMN     "totalInstallments" INTEGER;
