-- CreateTable
CREATE TABLE "LostFound" (
    "id" TEXT NOT NULL,
    "condominiumId" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'FOUND',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "location" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LostFound_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LostFound" ADD CONSTRAINT "LostFound_condominiumId_fkey" FOREIGN KEY ("condominiumId") REFERENCES "Condominium"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LostFound" ADD CONSTRAINT "LostFound_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
