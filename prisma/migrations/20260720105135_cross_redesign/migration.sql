-- AlterTable
ALTER TABLE "CrossResult" ADD COLUMN     "dorsal" TEXT,
ADD COLUMN     "empleo" TEXT,
ADD COLUMN     "puesto" INTEGER,
ADD COLUMN     "unitName" TEXT,
ALTER COLUMN "teamId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "CrossTeamResult" (
    "id" SERIAL NOT NULL,
    "unitName" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CrossTeamResult_pkey" PRIMARY KEY ("id")
);
