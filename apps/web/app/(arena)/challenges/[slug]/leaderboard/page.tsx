import { notFound } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getChallengeBySlug } from '@/lib/challenges';
import { getLeaderboardBySlug } from '@/lib/leaderboard';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: { slug: string } | Promise<{ slug: string }>;
};

export default async function LeaderboardPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams?.slug;
  if (!slug) return notFound();

  const data = await getChallengeBySlug(slug);
  if (!data) return notFound();

  const leaderboard = await getLeaderboardBySlug(slug);

  return (
    <main className="px-6 pb-16 md:px-12">
      <section className="mx-auto max-w-6xl space-y-6">
        <div>
          <Badge>{data.challenge.slug}</Badge>
          <h1 className="mt-4 text-3xl font-semibold text-[color:var(--text)]">
            Leaderboard
          </h1>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            {data.challenge.title}
          </p>
        </div>

        <Card className="overflow-hidden">
          {leaderboard.length === 0 ? (
            <p className="text-sm text-[color:var(--muted)]">No scored submissions yet.</p>
          ) : (
            <div className="max-h-[560px] overflow-auto">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 z-10 bg-[color:var(--panel-2)] text-xs uppercase tracking-[0.2em] text-[color:var(--muted)] backdrop-blur">
                  <tr>
                    <th className="py-3">Rank</th>
                    <th className="py-3">Name</th>
                    <th className="py-3">Method</th>
                    <th className="py-3">Tests</th>
                    <th className="py-3">Runtime</th>
                    <th className="py-3">Self-time</th>
                    <th className="py-3">Repo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[color:var(--border)]">
                  {leaderboard.map((entry, index) => (
                    <tr
                      key={entry.submissionId}
                      className="text-[color:var(--text)] odd:bg-[color:var(--panel-2)] hover:bg-[color:var(--bg-2)]"
                    >
                      <td className="py-3 font-semibold text-[color:var(--text)]">
                        #{index + 1}
                      </td>
                      <td className="py-3">{entry.displayName}</td>
                      <td className="py-3 text-[color:var(--muted)]">{entry.methodUsed}</td>
                      <td className="py-3">
                        {(entry.passRate * 100).toFixed(0)}% ({entry.testsPassed}/
                        {entry.testsTotal})
                      </td>
                      <td className="py-3">{entry.runtimeMs}ms</td>
                      <td className="py-3">
                        {entry.selfReportedMinutes ? `${entry.selfReportedMinutes}m` : '--'}
                      </td>
                      <td className="py-3">
                        {entry.repoUrl ? (
                          <a
                            className="text-[color:var(--primary)] hover:text-[color:var(--primary-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--bg)]"
                            href={entry.repoUrl}
                          >
                            repo
                          </a>
                        ) : (
                          '--'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </section>
    </main>
  );
}
