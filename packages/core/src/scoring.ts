import { z } from 'zod';
import type { SubmissionResult, TestOutput } from './types.js';

const testOutputSchema = z.object({
  testsTotal: z.number().int().nonnegative(),
  testsPassed: z.number().int().nonnegative(),
  testsFailed: z.number().int().nonnegative(),
  failures: z
    .array(
      z.object({
        name: z.string().optional(),
        message: z.string().optional(),
      }),
    )
    .optional(),
});

export function parseTestOutput(raw: string): TestOutput {
  const parsed = JSON.parse(raw);
  return testOutputSchema.parse(parsed);
}

export function buildSubmissionResult(
  output: TestOutput,
  runtimeMs: number,
  errorSummary?: string | null,
): SubmissionResult {
  const testsTotal = output.testsTotal || 0;
  const testsPassed = output.testsPassed || 0;
  const passRate = testsTotal === 0 ? 0 : testsPassed / testsTotal;

  return {
    passRate,
    testsPassed,
    testsTotal,
    runtimeMs,
    errorSummary: errorSummary ?? null,
  };
}
