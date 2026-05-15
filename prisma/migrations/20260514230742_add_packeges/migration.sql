-- CreateTable
CREATE TABLE "Package" (
    "id" TEXT NOT NULL,
    "condominiumId" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "carrier" TEXT,
    "trackingCode" TEXT,
    "arrivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "retrievedAt" TIMESTAMP(3),
    "retrievedBy" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Package_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Package" ADD CONSTRAINT "Package_condominiumId_fkey" FOREIGN KEY ("condominiumId") REFERENCES "Condominium"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Package" ADD CONSTRAINT "Package_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
