-- CreateTable
CREATE TABLE "MaturitySession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "sessionType" TEXT NOT NULL DEFAULT 'general',
    "name" TEXT NOT NULL DEFAULT 'Anonym respondent',
    "shareableLink" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "respondentEmail" TEXT NOT NULL DEFAULT '',
    "respondentRole" TEXT NOT NULL DEFAULT '',
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MaturitySession_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MaturityResponse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "dimensionKey" TEXT NOT NULL,
    "score" REAL NOT NULL DEFAULT 0,
    "notes" TEXT NOT NULL DEFAULT '',
    "evidence" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MaturityResponse_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "MaturitySession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "MaturitySession_shareableLink_key" ON "MaturitySession"("shareableLink");

-- CreateIndex
CREATE INDEX "MaturitySession_caseId_idx" ON "MaturitySession"("caseId");

-- CreateIndex
CREATE INDEX "MaturitySession_shareableLink_idx" ON "MaturitySession"("shareableLink");

-- CreateIndex
CREATE INDEX "MaturitySession_status_idx" ON "MaturitySession"("status");

-- CreateIndex
CREATE INDEX "MaturityResponse_sessionId_idx" ON "MaturityResponse"("sessionId");

-- CreateIndex
CREATE INDEX "MaturityResponse_dimensionKey_idx" ON "MaturityResponse"("dimensionKey");

-- CreateIndex
CREATE UNIQUE INDEX "MaturityResponse_sessionId_dimensionKey_key" ON "MaturityResponse"("sessionId", "dimensionKey");
