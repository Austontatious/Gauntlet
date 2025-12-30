import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Markdown } from '@/components/Markdown';
import { getLeaderboardBySlug } from '@/lib/leaderboard';
import { SubmissionForm } from './SubmissionForm';

export const dynamic = 'force-dynamic';

type ChallengeResponse = {
  slug: string;
  title: string;
  shortDescription: string | null;
  specMarkdown: string | null;
};

type HealthResponse = {
  executionEnabled: boolean;
};

async function resolveBaseUrl() {
  const explicit = process.env.NEXT_PUBLIC_BASE_URL;
  if (explicit) return explicit.replace(/\/$/, '');

  const headerList = await headers();
  const host = headerList.get('x-forwarded-host') ?? headerList.get('host');
  if (!host) return '';

  const proto = headerList.get('x-forwarded-proto') ?? 'http';
  return `${proto}://${host}`;
}

async function fetchChallenge(slug: string) {
  const baseUrl = await resolveBaseUrl();
  if (!baseUrl) return null;

  const response = await fetch(`${baseUrl}/api/challenges/${slug}`, {
    cache: 'no-store',
  });

  if (!response.ok) return null;

  return (await response.json()) as ChallengeResponse;
}

async function fetchHealth(): Promise<HealthResponse | null> {
  const baseUrl = await resolveBaseUrl();
  if (!baseUrl) return null;

  const response = await fetch(`${baseUrl}/api/health`, {
    cache: 'no-store',
  });

  if (!response.ok) return null;
  return (await response.json()) as HealthResponse;
}

type PageProps = {
  params: { slug: string } | Promise<{ slug: string }>;
};

export default async function ChallengeDetailPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams?.slug;
  if (!slug) return notFound();

  const data = await fetchChallenge(slug);
  if (!data) return notFound();

  const health = await fetchHealth();
  const executionEnabled = health?.executionEnabled ?? false;

  let leaderboard: Awaited<ReturnType<typeof getLeaderboardBySlug>> = [];
  try {
    leaderboard = await getLeaderboardBySlug(slug);
  } catch {
    leaderboard = [];
  }

  return (
    <main className="px-6 pb-16 md:px-12">
      <section className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-8">
          <div>
            <Badge>{data.slug}</Badge>
            <h1 className="mt-4 text-3xl font-semibold text-[color:var(--text)] md:text-4xl">
              {data.title}
            </h1>
            {data.shortDescription ? (
              <p className="mt-2 text-[0.95rem] leading-[1.6] text-[color:var(--muted)]">
                {data.shortDescription}
              </p>
            ) : null}
          </div>

          <Card className="text-[color:var(--muted)]">
            <div className="markdown">
              <Markdown content={data.specMarkdown ?? ''} />
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-[color:var(--text)]">
              Submit your run
            </h2>
            <p className="mt-2 text-[0.95rem] leading-[1.6] text-[color:var(--muted)]">
              Submit a public GitHub repo or a ZIP. The runner will score it in the background.
            </p>
            <div className="mt-6">
              <SubmissionForm challengeSlug={slug} />
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-[color:var(--text)]">
              How scoring works (v0.1)
            </h2>
            <p className="mt-2 text-[0.95rem] leading-[1.6] text-[color:var(--muted)]">
              If your solution passes these tests locally under the same runtime, it will
              pass on Gauntlet.
            </p>
            <dl className="mt-4 space-y-2 text-sm text-[color:var(--muted)]">
              <div className="flex items-center justify-between">
                <dt className="font-semibold text-[color:var(--muted)]">Build-time</dt>
                <dd>Honor system (for now)</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="font-semibold text-[color:var(--muted)]">Correctness</dt>
                <dd>Official tests</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="font-semibold text-[color:var(--muted)]">Execution</dt>
                <dd
                  className={`font-semibold ${
                    executionEnabled
                      ? 'text-[color:var(--success)]'
                      : 'text-[color:var(--accent)]'
                  }`}
                >
                  {executionEnabled ? 'Active' : 'Paused'}
                </dd>
              </div>
            </dl>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[color:var(--text)]">
                Leaderboard preview
              </h2>
              <a
                className="text-sm font-semibold text-[color:var(--link)] hover:text-[color:var(--link-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--bg)]"
                href={`/challenges/${slug}/leaderboard`}
              >
                Full board -&gt;
              </a>
            </div>
            <div className="mt-4 space-y-3">
              {leaderboard.length === 0 ? (
                <p className="text-[0.95rem] text-[color:var(--muted)]">
                  No submissions scored yet.
                </p>
              ) : (
                leaderboard.slice(0, 5).map((entry, index) => (
                  <div
                    key={entry.submissionId}
                    className="flex items-center justify-between rounded-2xl border border-[color:var(--border)] bg-[color:var(--panel-2)] px-4 py-3 text-sm"
                  >
                    <div>
                      <p className="font-semibold text-[color:var(--text)]">
                        #{index + 1} {entry.displayName}
                      </p>
                      <p className="text-xs text-[color:var(--muted)]">
                        {entry.testsPassed}/{entry.testsTotal} tests - {entry.runtimeMs}ms
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-[color:var(--muted)]">
                      {(entry.passRate * 100).toFixed(0)}%
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}
