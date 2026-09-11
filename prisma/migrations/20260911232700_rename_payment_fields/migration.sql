/*
  Warnings:

  - You are about to drop the column `asaasApiKey` on the `Condominium` table. All the data in the column will be lost.
  - You are about to drop the column `asaasEnabled` on the `Condominium` table. All the data in the column will be lost.
  - You are about to drop the column `asaasWalletId` on the `Condominium` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Condominium" DROP COLUMN "asaasApiKey",
DROP COLUMN "asaasEnabled",
DROP COLUMN "asaasWalletId",
ADD COLUMN     "paymentApiKey" TEXT,
ADD COLUMN     "paymentEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "paymentProvider" TEXT DEFAULT 'ASAAS',
ADD COLUMN     "paymentWalletId" TEXT;
