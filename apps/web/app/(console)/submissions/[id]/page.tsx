import { notFound } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: { id: string } | Promise<{ id: string }>;
};

export default async function SubmissionPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const submissionId = resolvedParams?.id;
  if (!submissionId) return notFound();

  let submission;
  try {
    submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: { challenge: true },
    });
  } catch (error) {
    console.error('Failed to load submission', error);
    return notFound();
  }

  if (!submission || !submission.challenge) return notFound();

  const result = (submission.result ?? {}) as {
    passRate?: number;
    testsPassed?: number;
    testsTotal?: number;
    runtimeMs?: number;
    errorSummary?: string | null;
  };

  return (
    <main className="px-6 pb-16 md:px-12">
      <section className="mx-auto max-w-4xl space-y-6">
        <div>
          <Badge>{submission.challenge.slug}</Badge>
          <h1 className="mt-4 text-3xl font-semibold text-[color:var(--text)]">
            Submission
          </h1>
          <p className="mt-2 text-[0.95rem] text-[color:var(--muted)]">
            {submission.displayName}
          </p>
        </div>

        <Card className="space-y-4">
          <div className="flex flex-wrap gap-6 text-sm text-[color:var(--muted)]">
            <div>
              <p className="text-xs uppercase text-[color:var(--muted)]">Status</p>
              <p className="font-semibold text-[color:var(--text)]">{submission.status}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-[color:var(--muted)]">Method</p>
              <p className="font-semibold text-[color:var(--text)]">{submission.methodUsed}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-[color:var(--muted)]">Self-time</p>
              <p className="font-semibold text-[color:var(--text)]">
                {submission.selfReportedMinutes ? `${submission.selfReportedMinutes}m` : '--'}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase text-[color:var(--muted)]">Runtime</p>
              <p className="font-semibold text-[color:var(--text)]">
                {result.runtimeMs ? `${result.runtimeMs}ms` : '--'}
              </p>
            </div>
          </div>

          <div className="grid gap-4 rounded-2xl border border-[color:var(--border)] bg-[color:var(--panel-2)] px-4 py-3 text-sm">
            <div className="flex flex-wrap gap-6">
              <div>
                <p className="text-xs uppercase text-[color:var(--muted)]">Pass rate</p>
                <p className="font-semibold text-[color:var(--text)]">
                  {result.passRate !== undefined
                    ? `${Math.round(result.passRate * 100)}%`
                    : '--'}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-[color:var(--muted)]">Tests</p>
                <p className="font-semibold text-[color:var(--text)]">
                  {result.testsPassed ?? 0}/{result.testsTotal ?? 0}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-[color:var(--muted)]">Error</p>
                <p className="font-semibold text-[color:var(--text)]">
                  {result.errorSummary || '--'}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-[color:var(--text)]">Log excerpt</h2>
          <pre className="mt-4 max-h-64 overflow-auto rounded-2xl border border-[color:var(--border)] bg-[color:var(--panel-2)] p-4 text-xs text-[color:var(--text)] font-mono">
            {submission.logExcerpt || 'No logs captured.'}
          </pre>
        </Card>
      </section>
    </main>
  );
}
