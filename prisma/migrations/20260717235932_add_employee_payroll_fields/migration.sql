/*
  Warnings:

  - You are about to drop the column `adicionais` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `descontos` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `fgts` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `inss` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `planoOdon` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `salary` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `total` on the `Employee` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "adicionais",
DROP COLUMN "descontos",
DROP COLUMN "fgts",
DROP COLUMN "inss",
DROP COLUMN "planoOdon",
DROP COLUMN "salary",
DROP COLUMN "total",
ADD COLUMN     "adicionalNoturno" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "avisoPrevio" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "ctps" TEXT,
ADD COLUMN     "dataAdmissao" TIMESTAMP(3),
ADD COLUMN     "dataDemissao" TIMESTAMP(3),
ADD COLUMN     "decimoTerceiro" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "dsr" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "faltas" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "feriasProporcional" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "fgtsPercentual" DOUBLE PRECISION NOT NULL DEFAULT 8,
ADD COLUMN     "fgtsValor" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "insalubridade" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "inssPercentual" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "inssValor" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "multaFgts" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "periculosidade" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "planoOdonto" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "planoSaude" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "salarioBase" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "seguroVida" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "totalDescontos" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "totalLiquido" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "totalProventos" DOUBLE PRECISION NOT NULL DEFAULT 0;
