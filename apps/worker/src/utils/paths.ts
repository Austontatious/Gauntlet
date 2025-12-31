import path from 'node:path';
import { existsSync } from 'node:fs';

export function resolveRepoRoot() {
  const cwd = process.cwd();
  const candidates = [cwd, path.resolve(cwd, '..'), path.resolve(cwd, '../..')];

  for (const candidate of candidates) {
    const directChallenges = path.join(candidate, 'challenges');
    if (existsSync(directChallenges)) {
      return candidate;
    }

    const distChallenges = path.join(candidate, 'dist', 'challenges');
    if (existsSync(distChallenges)) {
      return path.join(candidate, 'dist');
    }
  }

  for (const candidate of candidates) {
    if (existsSync(path.join(candidate, 'pnpm-workspace.yaml'))) {
      return candidate;
    }
  }

  return process.cwd();
}

function normalizeChallengeSlug(slug: string) {
  return slug.startsWith('challenge-') ? slug : `challenge-${slug}`;
}

export function getChallengeDir(repoRoot: string, slug: string) {
  return path.join(repoRoot, 'challenges', normalizeChallengeSlug(slug));
}

export function getTestsDir(repoRoot: string, slug: string) {
  return path.join(getChallengeDir(repoRoot, slug), 'tests');
}
