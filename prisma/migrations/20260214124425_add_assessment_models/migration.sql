-- CreateTable
CREATE TABLE "AssessmentType" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "config" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AssessmentProject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assessmentTypeId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "organizationName" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AssessmentProject_assessmentTypeId_fkey" FOREIGN KEY ("assessmentTypeId") REFERENCES "AssessmentType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AssessmentSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "shareToken" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "respondentName" TEXT NOT NULL DEFAULT '',
    "respondentEmail" TEXT NOT NULL DEFAULT '',
    "respondentRole" TEXT NOT NULL DEFAULT '',
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AssessmentSession_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "AssessmentProject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AssessmentResponse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AssessmentResponse_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AssessmentSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AssessmentResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "scores" TEXT NOT NULL DEFAULT '{}',
    "overall" REAL NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "aiInsights" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AssessmentResult_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AssessmentSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentType_slug_key" ON "AssessmentType"("slug");

-- CreateIndex
CREATE INDEX "AssessmentProject_ownerId_idx" ON "AssessmentProject"("ownerId");

-- CreateIndex
CREATE INDEX "AssessmentProject_assessmentTypeId_idx" ON "AssessmentProject"("assessmentTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentSession_shareToken_key" ON "AssessmentSession"("shareToken");

-- CreateIndex
CREATE INDEX "AssessmentSession_projectId_idx" ON "AssessmentSession"("projectId");

-- CreateIndex
CREATE INDEX "AssessmentResponse_sessionId_idx" ON "AssessmentResponse"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentResponse_sessionId_questionId_key" ON "AssessmentResponse"("sessionId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentResult_sessionId_key" ON "AssessmentResult"("sessionId");
