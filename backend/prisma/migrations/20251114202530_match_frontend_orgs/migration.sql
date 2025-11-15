/*
  Warnings:

  - The values [BANK,MOBILE_MONEY,MICROFINANCE,FOREX_BUREAU,INSURANCE,SACCO,SECURITIES,DNFBP,OTHER,PROFESSIONAL_BODY] on the enum `OrgType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "OrgType_new" AS ENUM ('REGULATOR', 'MINISTRY', 'PROFESSIONAL', 'FIA', 'LAW_ENFORCEMENT', 'PROSECUTION', 'INTERNATIONAL');
ALTER TABLE "organizations" ALTER COLUMN "type" TYPE "OrgType_new" USING ("type"::text::"OrgType_new");
ALTER TYPE "OrgType" RENAME TO "OrgType_old";
ALTER TYPE "OrgType_new" RENAME TO "OrgType";
DROP TYPE "public"."OrgType_old";
COMMIT;
