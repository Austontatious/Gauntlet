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
          <h1 className="mt-4 text-3xl font-semibold text-slate-950">Leaderboard</h1>
          <p className="mt-2 text-sm text-slate-600">{data.challenge.title}</p>
        </div>

        <Card>
          {leaderboard.length === 0 ? (
            <p className="text-sm text-slate-600">No scored submissions yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-slate-500">
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
                <tbody className="divide-y divide-slate-100">
                  {leaderboard.map((entry, index) => (
                    <tr key={entry.submissionId} className="text-slate-700">
                      <td className="py-3 font-semibold text-slate-900">#{index + 1}</td>
                      <td className="py-3">{entry.displayName}</td>
                      <td className="py-3">{entry.methodUsed}</td>
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
                            className="text-amber-600 hover:text-amber-500"
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
