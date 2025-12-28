import type { LeaderboardEntry } from './types';

export function sortLeaderboard(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  return [...entries].sort((a, b) => {
    if (a.passRate !== b.passRate) {
      return b.passRate - a.passRate;
    }
    if (a.runtimeMs !== b.runtimeMs) {
      return a.runtimeMs - b.runtimeMs;
    }
    return a.createdAt.getTime() - b.createdAt.getTime();
  });
}
