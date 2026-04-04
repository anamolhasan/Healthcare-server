/*
  Warnings:

  - The `maritalStatus` column on the `patient_health_data` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "patient_health_data" DROP COLUMN "maritalStatus",
ADD COLUMN     "maritalStatus" TEXT;
