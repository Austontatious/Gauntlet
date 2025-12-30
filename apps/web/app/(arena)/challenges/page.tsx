import Link from 'next/link';
import { getPublicChallenges } from '@/lib/challenges';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';

export default async function ChallengesPage() {
  const challenges = await getPublicChallenges();

  return (
    <main className="px-6 pb-16 md:px-12">
      <section className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-[color:var(--text)]">Challenges</h1>
            <p className="mt-2 text-[0.95rem] leading-[1.6] text-[color:var(--muted)]">
              Pick a spec, ship a solution, and climb the board.
            </p>
            <Link
              href="/challenges/format"
              className="mt-3 inline-flex text-[0.95rem] font-semibold text-[color:var(--link)] hover:text-[color:var(--link-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--bg)]"
            >
              Challenge format spec -&gt;
            </Link>
          </div>
          <Badge>{challenges.length} live</Badge>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {challenges.map((challenge) => (
            <Link
              key={challenge.id}
              href={`/challenges/${challenge.slug}`}
              className="group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--bg)]"
            >
              <Card className="flex h-full flex-col gap-5 border-[color:var(--border)] transition hover:border-[color:var(--primary)] hover:shadow-[0_0_28px_var(--glow-primary)]">
                <div className="space-y-3">
                  <Badge>{challenge.slug}</Badge>
                  <div>
                    <h2 className="text-xl font-semibold text-[color:var(--text)]">
                      {challenge.title}
                    </h2>
                    <p className="mt-2 text-[0.95rem] leading-[1.6] text-[color:var(--muted)]">
                      {challenge.shortDescription}
                    </p>
                  </div>
                </div>
                <span className="text-[0.95rem] font-semibold text-[color:var(--link)] group-hover:text-[color:var(--link-hover)]">
                  View challenge -&gt;
                </span>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
