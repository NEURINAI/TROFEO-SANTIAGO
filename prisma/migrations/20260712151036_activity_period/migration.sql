-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "endDate" TEXT,
ALTER COLUMN "time" DROP NOT NULL,
ALTER COLUMN "location" DROP NOT NULL;
