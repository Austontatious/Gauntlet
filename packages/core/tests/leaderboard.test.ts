import { describe, expect, it } from 'vitest';
import { sortLeaderboard } from '../src/leaderboard';
import { buildSubmissionResult, parseTestOutput } from '../src/scoring';

const baseEntry = {
  displayName: 'Ada',
  methodUsed: 'VIBE' as const,
  selfReportedMinutes: 42,
  testsPassed: 3,
  testsTotal: 3,
  runtimeMs: 1200,
  passRate: 1,
  repoUrl: 'https://github.com/example/repo',
};

describe('sortLeaderboard', () => {
  it('sorts by pass rate desc, runtime asc, createdAt asc', () => {
    const entries = [
      {
        ...baseEntry,
        submissionId: 'a',
        createdAt: new Date('2024-01-02T00:00:00Z'),
        passRate: 1,
        runtimeMs: 800,
      },
      {
        ...baseEntry,
        submissionId: 'b',
        createdAt: new Date('2024-01-01T00:00:00Z'),
        passRate: 0.66,
        runtimeMs: 500,
      },
      {
        ...baseEntry,
        submissionId: 'c',
        createdAt: new Date('2024-01-01T00:00:00Z'),
        passRate: 1,
        runtimeMs: 800,
      },
    ];

    const sorted = sortLeaderboard(entries);
    expect(sorted.map((entry) => entry.submissionId)).toEqual(['c', 'a', 'b']);
  });
});

describe('parseTestOutput + buildSubmissionResult', () => {
  it('parses output and builds result', () => {
    const output = parseTestOutput(
      JSON.stringify({ testsTotal: 4, testsPassed: 3, testsFailed: 1 }),
    );
    const result = buildSubmissionResult(output, 1500, null);

    expect(result.passRate).toBeCloseTo(0.75);
    expect(result.testsPassed).toBe(3);
    expect(result.testsTotal).toBe(4);
    expect(result.runtimeMs).toBe(1500);
  });
});
