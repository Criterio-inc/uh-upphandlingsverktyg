import { prisma } from "@/lib/db";

/**
 * Runtime auto-migration for all custom tables.
 *
 * prisma migrate deploy cannot authenticate with Turso in the Vercel
 * build environment (prisma.config.ts only sends the URL, not the
 * auth token). This utility creates the tables via the runtime Prisma
 * client which has full Turso access.
 *
 * Uses CREATE TABLE IF NOT EXISTS — safe to call repeatedly and
 * concurrently across serverless cold starts.
 */

let _ensured = false;

export async function ensureTables(): Promise<void> {
  if (_ensured) return;

  try {
    // ---- Organization / multi-tenancy tables ----

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Organization" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "slug" TEXT NOT NULL,
        "plan" TEXT NOT NULL DEFAULT 'trial',
        "maxUsers" INTEGER NOT NULL DEFAULT 5,
        "settings" TEXT NOT NULL DEFAULT '{}',
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "Organization_slug_key" ON "Organization"("slug")
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "OrgMembership" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "orgId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "role" TEXT NOT NULL DEFAULT 'member',
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "OrgMembership_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "OrgMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "OrgMembership_orgId_userId_key" ON "OrgMembership"("orgId", "userId")
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "OrgMembership_orgId_idx" ON "OrgMembership"("orgId")
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "OrgMembership_userId_idx" ON "OrgMembership"("userId")
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "OrgFeature" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "orgId" TEXT NOT NULL,
        "featureKey" TEXT NOT NULL,
        "enabled" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "OrgFeature_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "OrgFeature_orgId_featureKey_key" ON "OrgFeature"("orgId", "featureKey")
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "OrgFeature_orgId_idx" ON "OrgFeature"("orgId")
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Invitation" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "orgId" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "role" TEXT NOT NULL DEFAULT 'member',
        "token" TEXT NOT NULL,
        "expiresAt" DATETIME NOT NULL,
        "usedAt" DATETIME,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Invitation_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "Invitation_token_key" ON "Invitation"("token")
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "Invitation_email_idx" ON "Invitation"("email")
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "Invitation_orgId_idx" ON "Invitation"("orgId")
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "AuditLog" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "orgId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "action" TEXT NOT NULL,
        "entityType" TEXT NOT NULL,
        "entityId" TEXT NOT NULL DEFAULT '',
        "changes" TEXT NOT NULL DEFAULT '{}',
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "AuditLog_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "AuditLog_orgId_createdAt_idx" ON "AuditLog"("orgId", "createdAt")
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "AuditLog_userId_idx" ON "AuditLog"("userId")
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId")
    `);

    // ---- User / UserFeature tables ----

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "email" TEXT NOT NULL,
        "firstName" TEXT NOT NULL DEFAULT '',
        "lastName" TEXT NOT NULL DEFAULT '',
        "imageUrl" TEXT NOT NULL DEFAULT '',
        "isAdmin" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "UserFeature" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "featureKey" TEXT NOT NULL,
        "enabled" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "UserFeature_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "UserFeature_userId_idx" ON "UserFeature"("userId")
    `);

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UserFeature_userId_featureKey_key" ON "UserFeature"("userId", "featureKey")
    `);

    // ---- Assessment tables ----

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "AssessmentType" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "slug" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "description" TEXT NOT NULL DEFAULT '',
        "config" TEXT NOT NULL DEFAULT '{}',
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "AssessmentType_slug_key" ON "AssessmentType"("slug")
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "AssessmentProject" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "assessmentTypeId" TEXT NOT NULL,
        "ownerId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "description" TEXT NOT NULL DEFAULT '',
        "organizationName" TEXT NOT NULL DEFAULT '',
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "AssessmentProject_assessmentTypeId_fkey" FOREIGN KEY ("assessmentTypeId") REFERENCES "AssessmentType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "AssessmentProject_ownerId_idx" ON "AssessmentProject"("ownerId")
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "AssessmentProject_assessmentTypeId_idx" ON "AssessmentProject"("assessmentTypeId")
    `);

    // Add orgId column to AssessmentProject if missing (safe idempotent migration)
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE "AssessmentProject" ADD COLUMN "orgId" TEXT`);
    } catch {
      // Column already exists — ignore
    }

    try {
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "AssessmentProject_orgId_idx" ON "AssessmentProject"("orgId")`);
    } catch {
      // ignore
    }

    // Add orgId column to Case if missing (safe idempotent migration)
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE "Case" ADD COLUMN "orgId" TEXT`);
    } catch {
      // Column already exists — ignore
    }

    try {
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Case_orgId_idx" ON "Case"("orgId")`);
    } catch {
      // ignore
    }

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "AssessmentSession" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "projectId" TEXT NOT NULL,
        "shareToken" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'pending',
        "respondentName" TEXT NOT NULL DEFAULT '',
        "respondentEmail" TEXT NOT NULL DEFAULT '',
        "respondentRole" TEXT NOT NULL DEFAULT '',
        "completedAt" DATETIME,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "AssessmentSession_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "AssessmentProject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "AssessmentSession_shareToken_key" ON "AssessmentSession"("shareToken")
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "AssessmentSession_projectId_idx" ON "AssessmentSession"("projectId")
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "AssessmentResponse" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "sessionId" TEXT NOT NULL,
        "questionId" TEXT NOT NULL,
        "value" INTEGER NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "AssessmentResponse_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AssessmentSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "AssessmentResponse_sessionId_questionId_key" ON "AssessmentResponse"("sessionId", "questionId")
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "AssessmentResponse_sessionId_idx" ON "AssessmentResponse"("sessionId")
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "AssessmentResult" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "sessionId" TEXT NOT NULL,
        "scores" TEXT NOT NULL DEFAULT '{}',
        "overall" REAL NOT NULL DEFAULT 0,
        "level" INTEGER NOT NULL DEFAULT 1,
        "aiInsights" TEXT NOT NULL DEFAULT '',
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "AssessmentResult_sessionId_key" ON "AssessmentResult"("sessionId")
    `);

    _ensured = true;
  } catch (err) {
    console.error("ensureTables failed:", err);
  }
}

// Backward compatibility alias
export const ensureUserTables = ensureTables;
