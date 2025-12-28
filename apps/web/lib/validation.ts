import { z } from 'zod';

export const methodUsedEnum = z.enum(['VIBE', 'PRO', 'MIXED', 'OTHER']);
export const submitTypeEnum = z.enum(['GITHUB_REPO', 'ZIP_UPLOAD']);

export const createSubmissionSchema = z.object({
  challengeSlug: z.string().trim().min(1),
  displayName: z.string().trim().min(1).max(64),
  methodUsed: methodUsedEnum,
  selfReportedMinutes: z.number().int().nonnegative().nullable(),
  submitType: submitTypeEnum,
  repoUrl: z.string().trim().url().optional().nullable(),
});

export function normalizeRepoUrl(value: string | null) {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function isGithubRepo(url: string) {
  return /^https?:\/\/github\.com\/[\w.-]+\/[\w.-]+(\.git)?$/i.test(url);
}
