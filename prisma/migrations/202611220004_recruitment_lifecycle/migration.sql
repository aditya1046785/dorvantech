-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "finalizedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ResumeObject" ADD COLUMN     "deleteAfter" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ConfirmationEmail" ADD COLUMN     "deliveryStatus" TEXT NOT NULL DEFAULT 'UNKNOWN',
ADD COLUMN     "deliveryUpdatedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "RecruitmentSettings" (
    "id" TEXT NOT NULL DEFAULT 'recruitment',
    "retentionDays" INTEGER NOT NULL DEFAULT 180,
    "autoDelete" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecruitmentSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecruitmentWebhookEvent" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "appliedAt" TIMESTAMP(3),
    "nextCheck" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecruitmentWebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RecruitmentWebhookEvent_providerId_idx" ON "RecruitmentWebhookEvent"("providerId");

-- CreateIndex
CREATE INDEX "RecruitmentWebhookEvent_appliedAt_receivedAt_idx" ON "RecruitmentWebhookEvent"("appliedAt", "receivedAt");

-- Start a fresh retention period for any existing finalised applications.
UPDATE "Application" SET "finalizedAt" = CURRENT_TIMESTAMP WHERE "status" IN ('SELECTED', 'REJECTED', 'WITHDRAWN');
