-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'trial',
    "maxUsers" INTEGER NOT NULL DEFAULT 5,
    "settings" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "OrgMembership" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orgId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "OrgMembership_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrgMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OrgFeature" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orgId" TEXT NOT NULL,
    "featureKey" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "OrgFeature_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Invitation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orgId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "token" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "usedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Invitation_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orgId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL DEFAULT '',
    "changes" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AssessmentProject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assessmentTypeId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "orgId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "organizationName" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AssessmentProject_assessmentTypeId_fkey" FOREIGN KEY ("assessmentTypeId") REFERENCES "AssessmentType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AssessmentProject_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_AssessmentProject" ("assessmentTypeId", "createdAt", "description", "id", "name", "organizationName", "ownerId", "updatedAt") SELECT "assessmentTypeId", "createdAt", "description", "id", "name", "organizationName", "ownerId", "updatedAt" FROM "AssessmentProject";
DROP TABLE "AssessmentProject";
ALTER TABLE "new_AssessmentProject" RENAME TO "AssessmentProject";
CREATE INDEX "AssessmentProject_ownerId_idx" ON "AssessmentProject"("ownerId");
CREATE INDEX "AssessmentProject_orgId_idx" ON "AssessmentProject"("orgId");
CREATE INDEX "AssessmentProject_assessmentTypeId_idx" ON "AssessmentProject"("assessmentTypeId");
CREATE TABLE "new_Case" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orgId" TEXT,
    "name" TEXT NOT NULL,
    "domainProfile" TEXT NOT NULL DEFAULT 'generisk_lou',
    "orgName" TEXT NOT NULL DEFAULT '',
    "procurementType" TEXT NOT NULL DEFAULT 'nyanskaffning',
    "estimatedValueSek" REAL NOT NULL DEFAULT 0,
    "timeline" TEXT NOT NULL DEFAULT '{}',
    "goals" TEXT NOT NULL DEFAULT '[]',
    "scopeIn" TEXT NOT NULL DEFAULT '[]',
    "scopeOut" TEXT NOT NULL DEFAULT '[]',
    "dependencies" TEXT NOT NULL DEFAULT '[]',
    "governance" TEXT NOT NULL DEFAULT '{}',
    "evaluationStatus" TEXT NOT NULL DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "currentPhase" TEXT NOT NULL DEFAULT 'A_start_styrning',
    "owner" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Case_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Case" ("createdAt", "currentPhase", "dependencies", "domainProfile", "estimatedValueSek", "evaluationStatus", "goals", "governance", "id", "name", "orgName", "owner", "procurementType", "scopeIn", "scopeOut", "status", "timeline", "updatedAt") SELECT "createdAt", "currentPhase", "dependencies", "domainProfile", "estimatedValueSek", "evaluationStatus", "goals", "governance", "id", "name", "orgName", "owner", "procurementType", "scopeIn", "scopeOut", "status", "timeline", "updatedAt" FROM "Case";
DROP TABLE "Case";
ALTER TABLE "new_Case" RENAME TO "Case";
CREATE INDEX "Case_orgId_idx" ON "Case"("orgId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- CreateIndex
CREATE INDEX "OrgMembership_orgId_idx" ON "OrgMembership"("orgId");

-- CreateIndex
CREATE INDEX "OrgMembership_userId_idx" ON "OrgMembership"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "OrgMembership_orgId_userId_key" ON "OrgMembership"("orgId", "userId");

-- CreateIndex
CREATE INDEX "OrgFeature_orgId_idx" ON "OrgFeature"("orgId");

-- CreateIndex
CREATE UNIQUE INDEX "OrgFeature_orgId_featureKey_key" ON "OrgFeature"("orgId", "featureKey");

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_token_key" ON "Invitation"("token");

-- CreateIndex
CREATE INDEX "Invitation_token_idx" ON "Invitation"("token");

-- CreateIndex
CREATE INDEX "Invitation_email_idx" ON "Invitation"("email");

-- CreateIndex
CREATE INDEX "Invitation_orgId_idx" ON "Invitation"("orgId");

-- CreateIndex
CREATE INDEX "AuditLog_orgId_createdAt_idx" ON "AuditLog"("orgId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");
