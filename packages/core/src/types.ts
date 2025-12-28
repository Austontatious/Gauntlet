export type MethodUsed = 'VIBE' | 'PRO' | 'MIXED' | 'OTHER';

export type SubmissionStatus = 'QUEUED' | 'RUNNING' | 'COMPLETE' | 'FAILED';

export interface TestOutput {
  testsTotal: number;
  testsPassed: number;
  testsFailed: number;
  failures?: Array<{ name?: string; message?: string }>;
}

export interface SubmissionResult {
  passRate: number;
  testsPassed: number;
  testsTotal: number;
  runtimeMs: number;
  errorSummary?: string | null;
}

export interface LeaderboardEntry {
  submissionId: string;
  displayName: string;
  methodUsed: MethodUsed;
  selfReportedMinutes: number | null;
  passRate: number;
  testsPassed: number;
  testsTotal: number;
  runtimeMs: number;
  createdAt: Date;
  repoUrl?: string | null;
}
