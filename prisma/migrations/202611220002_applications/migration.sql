-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "registration" TEXT NOT NULL,
    "requestKey" TEXT NOT NULL,
    "vacancyId" TEXT NOT NULL,
    "revisionId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "consentVersion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resumeId" TEXT NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResumeObject" (
    "id" TEXT NOT NULL,
    "objectKey" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "scannedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResumeObject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConfirmationEmail" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "nextAttempt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lockedUntil" TIMESTAMP(3),
    "providerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(3),

    CONSTRAINT "ConfirmationEmail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Application_registration_key" ON "Application"("registration");

-- CreateIndex
CREATE UNIQUE INDEX "Application_requestKey_key" ON "Application"("requestKey");

-- CreateIndex
CREATE UNIQUE INDEX "Application_resumeId_key" ON "Application"("resumeId");

-- CreateIndex
CREATE INDEX "Application_vacancyId_createdAt_idx" ON "Application"("vacancyId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Application_vacancyId_email_key" ON "Application"("vacancyId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "ResumeObject_objectKey_key" ON "ResumeObject"("objectKey");

-- CreateIndex
CREATE UNIQUE INDEX "ConfirmationEmail_applicationId_key" ON "ConfirmationEmail"("applicationId");

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_vacancyId_fkey" FOREIGN KEY ("vacancyId") REFERENCES "Vacancy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_revisionId_fkey" FOREIGN KEY ("revisionId") REFERENCES "VacancyRevision"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "ResumeObject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConfirmationEmail" ADD CONSTRAINT "ConfirmationEmail_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

