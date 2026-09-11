-- AlterTable
ALTER TABLE "Condominium" ADD COLUMN     "asaasApiKey" TEXT,
ADD COLUMN     "asaasEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "asaasWalletId" TEXT;
