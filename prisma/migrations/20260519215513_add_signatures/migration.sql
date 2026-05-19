-- CreateTable
CREATE TABLE "DocumentSignature" (
    "id" TEXT NOT NULL,
    "condominiumId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "signatureData" TEXT NOT NULL,
    "ip" TEXT,
    "signedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentSignature_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DocumentSignature" ADD CONSTRAINT "DocumentSignature_condominiumId_fkey" FOREIGN KEY ("condominiumId") REFERENCES "Condominium"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentSignature" ADD CONSTRAINT "DocumentSignature_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
