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
            <h1 className="text-3xl font-semibold text-slate-950">Challenges</h1>
            <p className="mt-2 text-sm text-slate-600">
              Pick a spec, ship a solution, and climb the board.
            </p>
            <Link
              href="/challenges/format"
              className="mt-3 inline-flex text-sm font-semibold text-amber-600 hover:text-amber-500"
            >
              Challenge format spec -&gt;
            </Link>
          </div>
          <Badge>{challenges.length} live</Badge>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {challenges.map((challenge) => (
            <Card key={challenge.id} className="flex flex-col gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  {challenge.slug}
                </p>
                <h2 className="mt-1 text-xl font-semibold text-slate-900">
                  {challenge.title}
                </h2>
                <p className="mt-2 text-sm text-slate-600">{challenge.shortDescription}</p>
              </div>
              <a
                href={`/challenges/${challenge.slug}`}
                className="text-sm font-semibold text-amber-600 hover:text-amber-500"
              >
                View challenge -&gt;
              </a>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
