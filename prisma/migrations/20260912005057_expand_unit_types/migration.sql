-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "UnitType" ADD VALUE 'HOUSE';
ALTER TYPE "UnitType" ADD VALUE 'LAND';
ALTER TYPE "UnitType" ADD VALUE 'GARAGE';
ALTER TYPE "UnitType" ADD VALUE 'STORAGE';
ALTER TYPE "UnitType" ADD VALUE 'OTHER';
