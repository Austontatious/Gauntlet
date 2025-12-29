-- CreateEnum
CREATE TYPE "ChallengeVisibility" AS ENUM ('PUBLIC', 'UNLISTED', 'DRAFT');

-- CreateEnum
CREATE TYPE "MethodUsed" AS ENUM ('VIBE', 'PRO', 'MIXED', 'OTHER');

-- CreateEnum
CREATE TYPE "SubmitType" AS ENUM ('GITHUB_REPO', 'ZIP_UPLOAD');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('QUEUED', 'RUNNING', 'COMPLETE', 'FAILED');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('QUEUED', 'RUNNING', 'COMPLETE', 'FAILED');

-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('SCORE_SUBMISSION');

-- CreateTable
CREATE TABLE "Challenge" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "specMarkdownPath" TEXT NOT NULL,
    "scoringConfig" JSONB NOT NULL,
    "visibility" "ChallengeVisibility" NOT NULL DEFAULT 'PUBLIC',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Challenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "methodUsed" "MethodUsed" NOT NULL,
    "selfReportedMinutes" INTEGER,
    "submitType" "SubmitType" NOT NULL,
    "repoUrl" TEXT,
    "zipPath" TEXT,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'QUEUED',
    "result" JSONB,
    "logExcerpt" TEXT,
    "commitHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "type" "JobType" NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'QUEUED',
    "lockedAt" TIMESTAMP(3),
    "lockedBy" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Challenge_slug_key" ON "Challenge"("slug");

-- CreateIndex
CREATE INDEX "Submission_challengeId_status_idx" ON "Submission"("challengeId", "status");

-- CreateIndex
CREATE INDEX "Submission_challengeId_createdAt_idx" ON "Submission"("challengeId", "createdAt");

-- CreateIndex
CREATE INDEX "Job_status_createdAt_idx" ON "Job"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
