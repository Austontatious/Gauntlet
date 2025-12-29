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

function resolveBaseUrl() {
  const explicit = process.env.NEXT_PUBLIC_BASE_URL;
  if (explicit) return explicit.replace(/\/$/, '');

  const headerList = headers();
  const host = headerList.get('x-forwarded-host') ?? headerList.get('host');
  if (!host) return '';

  const proto = headerList.get('x-forwarded-proto') ?? 'http';
  return `${proto}://${host}`;
}

async function fetchChallenge(slug: string) {
  const baseUrl = resolveBaseUrl();
  if (!baseUrl) return null;

  const response = await fetch(`${baseUrl}/api/challenges/${slug}`, {
    cache: 'no-store',
  });

  if (!response.ok) return null;

  return (await response.json()) as ChallengeResponse;
}

export default async function ChallengeDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const slug = params?.slug;
  if (!slug) return notFound();

  const data = await fetchChallenge(slug);
  if (!data) return notFound();

  let leaderboard = [];
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
              <SubmissionForm challengeSlug={params.slug} />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Leaderboard preview</h2>
              <a
                className="text-sm font-semibold text-amber-600"
                href={`/challenges/${params.slug}/leaderboard`}
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
