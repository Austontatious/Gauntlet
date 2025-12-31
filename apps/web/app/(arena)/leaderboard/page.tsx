import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getGlobalLeaderboard } from '@/lib/leaderboard';

export const dynamic = 'force-dynamic';

export default async function GlobalLeaderboardPage() {
  const leaderboard = await getGlobalLeaderboard(10);

  return (
    <main className="px-6 pb-16 md:px-12">
      <section className="mx-auto max-w-6xl space-y-6">
        <div>
          <Badge>Global</Badge>
          <h1 className="mt-4 text-3xl font-semibold text-[color:var(--text)]">
            Leaderboard
          </h1>
          <p className="mt-2 text-[0.95rem] leading-[1.6] text-[color:var(--muted)]">
            Top submissions across every challenge.
          </p>
        </div>

        <Card className="overflow-hidden">
          {leaderboard.length === 0 ? (
            <p className="text-[0.95rem] text-[color:var(--muted)]">
              No scored submissions yet.
            </p>
          ) : (
            <div className="max-h-[560px] overflow-auto">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 z-10 bg-[color:var(--panel-2)] text-xs uppercase tracking-[0.2em] text-[color:var(--muted)] backdrop-blur">
                  <tr>
                    <th className="py-3">Rank</th>
                    <th className="py-3">User</th>
                    <th className="py-3">Challenge</th>
                    <th className="py-3">Method</th>
                    <th className="py-3">Score</th>
                    <th className="py-3">Runtime</th>
                    <th className="py-3">Self-time</th>
                    <th className="py-3">Submitted</th>
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
                      <td className="py-3">
                        <div className="flex flex-col">
                          <span className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
                            {entry.challenge.slug}
                          </span>
                          <span>{entry.challenge.title}</span>
                        </div>
                      </td>
                      <td className="py-3 text-[color:var(--muted)]">{entry.methodUsed}</td>
                      <td className="py-3">
                        {(entry.passRate * 100).toFixed(2)}%
                        <span className="ml-2 text-xs text-[color:var(--muted)]">
                          ({entry.testsPassed}/{entry.testsTotal})
                        </span>
                      </td>
                      <td className="py-3">{entry.runtimeMs}ms</td>
                      <td className="py-3">
                        {entry.selfReportedMinutes
                          ? `${entry.selfReportedMinutes}m`
                          : '--'}
                      </td>
                      <td className="py-3">
                        {entry.createdAt.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
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
