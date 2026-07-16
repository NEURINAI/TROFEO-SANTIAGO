-- CreateTable
CREATE TABLE "PsGroupTeam" (
    "id" SERIAL NOT NULL,
    "groupName" TEXT NOT NULL,
    "teamName" TEXT NOT NULL,
    "played" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 0,
    "classified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PsGroupTeam_pkey" PRIMARY KEY ("id")
);
