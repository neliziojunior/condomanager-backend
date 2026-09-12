/*
  Warnings:

  - You are about to drop the column `avisoPrevio` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `ctps` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `decimoTerceiro` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `feriasProporcional` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `fgtsPercentual` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `fgtsValor` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `horasExtras` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `inssPercentual` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `inssValor` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `multaFgts` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `seguroVida` on the `Employee` table. All the data in the column will be lost.
  - Added the required column `cargo` to the `Employee` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "avisoPrevio",
DROP COLUMN "ctps",
DROP COLUMN "decimoTerceiro",
DROP COLUMN "feriasProporcional",
DROP COLUMN "fgtsPercentual",
DROP COLUMN "fgtsValor",
DROP COLUMN "horasExtras",
DROP COLUMN "inssPercentual",
DROP COLUMN "inssValor",
DROP COLUMN "multaFgts",
DROP COLUMN "role",
DROP COLUMN "seguroVida",
ADD COLUMN     "adiantamento" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "cargo" TEXT NOT NULL,
ADD COLUMN     "cbo" TEXT,
ADD COLUMN     "celular" TEXT,
ADD COLUMN     "cep" TEXT,
ADD COLUMN     "cidade" TEXT,
ADD COLUMN     "competencia" TEXT,
ADD COLUMN     "ctpsNumero" TEXT,
ADD COLUMN     "ctpsSerie" TEXT,
ADD COLUMN     "ctpsUf" TEXT,
ADD COLUMN     "custoTotalEmpresa" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "dataNascimento" TIMESTAMP(3),
ADD COLUMN     "deficiencia" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "deficienciaTipo" TEXT,
ADD COLUMN     "endereco" TEXT,
ADD COLUMN     "estadoCivil" TEXT,
ADD COLUMN     "feriasPeriodos" JSONB,
ADD COLUMN     "feriasVencidas" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "fgtsEmpresa" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "funcao" TEXT,
ADD COLUMN     "grauInsalubridade" TEXT,
ADD COLUMN     "grauInstrucao" TEXT,
ADD COLUMN     "horarioIntervalo" TEXT,
ADD COLUMN     "horarioTrabalho" TEXT,
ADD COLUMN     "horasExtras100" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "horasExtras50" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "inssEmpresa" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "inssFuncionario" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "irrf" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "localNascimento" TEXT,
ADD COLUMN     "nomeMae" TEXT,
ADD COLUMN     "nomePai" TEXT,
ADD COLUMN     "observacoes" TEXT,
ADD COLUMN     "opcaoFgts" TIMESTAMP(3),
ADD COLUMN     "pais" TEXT NOT NULL DEFAULT 'BRASIL',
ADD COLUMN     "pensaoAlimenticia" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "planoOdontoCobertura" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "planoSaudeCobertura" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "provisao13" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "provisaoFerias" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "provisaoFgts13" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "provisaoFgtsFerias" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "provisaoInss13" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "provisaoInssFerias" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "rat" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "rg" TEXT,
ADD COLUMN     "rgEmissor" TEXT,
ADD COLUMN     "sexo" TEXT,
ADD COLUMN     "telefone" TEXT,
ADD COLUMN     "terceiros" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "tituloEleitor" TEXT,
ADD COLUMN     "uf" TEXT;
