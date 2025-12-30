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
            <h1 className="mt-4 text-3xl font-semibold text-slate-950 md:text-4xl">
              {data.title}
            </h1>
            {data.shortDescription ? (
              <p className="mt-2 text-sm text-slate-600">{data.shortDescription}</p>
            ) : null}
          </div>

          <Card className="text-sm text-slate-700">
            <div className="markdown">
              <Markdown content={data.specMarkdown ?? ''} />
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-slate-900">Submit your run</h2>
            <p className="mt-2 text-sm text-slate-600">
              Submit a public GitHub repo or a ZIP. The worker will score it in the background.
            </p>
            <div className="mt-6">
              <SubmissionForm challengeSlug={slug} />
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-slate-900">
              How scoring works (v0.1)
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              If your solution passes these tests locally under the same runtime, it will
              pass on Gauntlet.
            </p>
            <dl className="mt-4 space-y-2 text-sm text-slate-700">
              <div className="flex items-center justify-between">
                <dt className="font-semibold text-slate-600">Build-time</dt>
                <dd>Honor system (for now)</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="font-semibold text-slate-600">Correctness</dt>
                <dd>Official tests</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="font-semibold text-slate-600">Execution</dt>
                <dd
                  className={`font-semibold ${
                    executionEnabled ? 'text-emerald-600' : 'text-amber-600'
                  }`}
                >
                  {executionEnabled ? 'Active' : 'Paused'}
                </dd>
              </div>
            </dl>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Leaderboard preview</h2>
              <a
                className="text-sm font-semibold text-amber-600"
                href={`/challenges/${slug}/leaderboard`}
              >
                Full board -&gt;
              </a>
            </div>
            <div className="mt-4 space-y-3">
              {leaderboard.length === 0 ? (
                <p className="text-sm text-slate-600">No submissions scored yet.</p>
              ) : (
                leaderboard.slice(0, 5).map((entry, index) => (
                  <div
                    key={entry.submissionId}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">
                        #{index + 1} {entry.displayName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {entry.testsPassed}/{entry.testsTotal} tests - {entry.runtimeMs}ms
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-slate-600">
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
