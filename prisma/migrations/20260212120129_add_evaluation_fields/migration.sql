-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Bid" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "version" INTEGER NOT NULL DEFAULT 1,
    "owner" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "supplierName" TEXT NOT NULL DEFAULT '',
    "receivedAt" TEXT NOT NULL DEFAULT '',
    "qualified" BOOLEAN NOT NULL DEFAULT false,
    "qualificationNotes" TEXT NOT NULL DEFAULT '',
    "externalRef" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "Bid_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Bid" ("caseId", "createdAt", "id", "owner", "qualificationNotes", "qualified", "receivedAt", "status", "supplierName", "tags", "title", "updatedAt", "version") SELECT "caseId", "createdAt", "id", "owner", "qualificationNotes", "qualified", "receivedAt", "status", "supplierName", "tags", "title", "updatedAt", "version" FROM "Bid";
DROP TABLE "Bid";
ALTER TABLE "new_Bid" RENAME TO "Bid";
CREATE INDEX "Bid_caseId_idx" ON "Bid"("caseId");
CREATE TABLE "new_Case" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Case" ("createdAt", "currentPhase", "dependencies", "domainProfile", "estimatedValueSek", "goals", "governance", "id", "name", "orgName", "owner", "procurementType", "scopeIn", "scopeOut", "status", "timeline", "updatedAt") SELECT "createdAt", "currentPhase", "dependencies", "domainProfile", "estimatedValueSek", "goals", "governance", "id", "name", "orgName", "owner", "procurementType", "scopeIn", "scopeOut", "status", "timeline", "updatedAt" FROM "Case";
DROP TABLE "Case";
ALTER TABLE "new_Case" RENAME TO "Case";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
