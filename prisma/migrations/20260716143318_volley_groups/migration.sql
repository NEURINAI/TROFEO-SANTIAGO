-- CreateTable
CREATE TABLE "VolleyGroupTeam" (
    "id" SERIAL NOT NULL,
    "groupName" TEXT NOT NULL,
    "teamName" TEXT NOT NULL,
    "played" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VolleyGroupTeam_pkey" PRIMARY KEY ("id")
);
