-- CreateTable
CREATE TABLE "Admin" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" SERIAL NOT NULL,
    "time" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "manualAdjust" INTEGER NOT NULL DEFAULT 0,
    "observations" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrossResult" (
    "id" SERIAL NOT NULL,
    "teamId" INTEGER NOT NULL,
    "individualName" TEXT,
    "time" TEXT,
    "points" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrossResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VolleyMatch" (
    "id" SERIAL NOT NULL,
    "round" INTEGER NOT NULL DEFAULT 1,
    "slot" INTEGER NOT NULL DEFAULT 0,
    "teamAId" INTEGER,
    "teamBId" INTEGER,
    "result" TEXT,
    "teamAPoints" INTEGER NOT NULL DEFAULT 0,
    "teamBPoints" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'Pendiente',
    "scheduledDate" TEXT,
    "scheduledTime" TEXT,
    "field" TEXT,
    "winnerId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VolleyMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrossfitResult" (
    "id" SERIAL NOT NULL,
    "teamId" INTEGER NOT NULL,
    "time" TEXT,
    "points" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrossfitResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaellaResult" (
    "id" SERIAL NOT NULL,
    "teamId" INTEGER NOT NULL,
    "sabor" INTEGER NOT NULL DEFAULT 0,
    "puntoArroz" INTEGER NOT NULL DEFAULT 0,
    "presentacion" INTEGER NOT NULL DEFAULT 0,
    "color" INTEGER NOT NULL DEFAULT 0,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaellaResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PsPlayer" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "teamId" INTEGER,
    "militaryUnit" TEXT,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PsPlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PsMatch" (
    "id" SERIAL NOT NULL,
    "round" INTEGER NOT NULL DEFAULT 1,
    "slot" INTEGER NOT NULL DEFAULT 0,
    "playerAId" INTEGER,
    "playerBId" INTEGER,
    "scoreA" INTEGER,
    "scoreB" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'Pendiente',
    "scheduledTime" TEXT,
    "winnerId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PsMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaAsset" (
    "key" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'image',
    "label" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "Config" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Config_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Team_name_key" ON "Team"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CrossfitResult_teamId_key" ON "CrossfitResult"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "PaellaResult_teamId_key" ON "PaellaResult"("teamId");

-- AddForeignKey
ALTER TABLE "CrossResult" ADD CONSTRAINT "CrossResult_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolleyMatch" ADD CONSTRAINT "VolleyMatch_teamAId_fkey" FOREIGN KEY ("teamAId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolleyMatch" ADD CONSTRAINT "VolleyMatch_teamBId_fkey" FOREIGN KEY ("teamBId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrossfitResult" ADD CONSTRAINT "CrossfitResult_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaellaResult" ADD CONSTRAINT "PaellaResult_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PsPlayer" ADD CONSTRAINT "PsPlayer_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PsMatch" ADD CONSTRAINT "PsMatch_playerAId_fkey" FOREIGN KEY ("playerAId") REFERENCES "PsPlayer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PsMatch" ADD CONSTRAINT "PsMatch_playerBId_fkey" FOREIGN KEY ("playerBId") REFERENCES "PsPlayer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
