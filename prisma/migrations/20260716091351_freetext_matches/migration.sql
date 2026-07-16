-- AlterTable
ALTER TABLE "PsMatch" ADD COLUMN     "playerAName" TEXT,
ADD COLUMN     "playerBName" TEXT,
ADD COLUMN     "winnerName" TEXT;

-- AlterTable
ALTER TABLE "VolleyMatch" ADD COLUMN     "teamAName" TEXT,
ADD COLUMN     "teamBName" TEXT,
ADD COLUMN     "winnerName" TEXT;
