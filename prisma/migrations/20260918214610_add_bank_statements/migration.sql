-- CreateTable
CREATE TABLE "BankStatement" (
    "id" TEXT NOT NULL,
    "condominiumId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "bankName" TEXT,
    "periodStart" TIMESTAMP(3),
    "periodEnd" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PROCESSING',
    "processedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "totalEntries" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BankStatement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatementEntry" (
    "id" TEXT NOT NULL,
    "statementId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "aiCategory" TEXT,
    "aiConfidence" DOUBLE PRECISION,
    "aiMatched" BOOLEAN NOT NULL DEFAULT false,
    "categoryId" TEXT,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StatementEntry_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BankStatement" ADD CONSTRAINT "BankStatement_condominiumId_fkey" FOREIGN KEY ("condominiumId") REFERENCES "Condominium"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatementEntry" ADD CONSTRAINT "StatementEntry_statementId_fkey" FOREIGN KEY ("statementId") REFERENCES "BankStatement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatementEntry" ADD CONSTRAINT "StatementEntry_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "AccountCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
