CREATE TYPE "VacancyStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED');
CREATE TABLE "Vacancy" (
 "id" TEXT NOT NULL,
 "slug" TEXT NOT NULL,
 "status" "VacancyStatus" NOT NULL DEFAULT 'DRAFT',
 "draft" JSONB NOT NULL,
 "published" JSONB,
 "version" INTEGER NOT NULL DEFAULT 1,
 "publishedRevision" INTEGER NOT NULL DEFAULT 0,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "Vacancy_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Vacancy_slug_key" ON "Vacancy"("slug");
CREATE TABLE "VacancyRevision" (
 "id" TEXT NOT NULL,
 "vacancyId" TEXT NOT NULL,
 "revision" INTEGER NOT NULL,
 "content" JSONB NOT NULL,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "VacancyRevision_pkey" PRIMARY KEY ("id"),
 CONSTRAINT "VacancyRevision_vacancyId_fkey" FOREIGN KEY ("vacancyId") REFERENCES "Vacancy"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "VacancyRevision_vacancyId_revision_key" ON "VacancyRevision"("vacancyId", "revision");
