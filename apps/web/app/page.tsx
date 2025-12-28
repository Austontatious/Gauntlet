import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function Home() {
  return (
    <main className="px-6 pb-16 md:px-12">
      <section className="mx-auto flex max-w-6xl flex-col gap-10">
        <div className="flex flex-col gap-6">
          <Badge>Challenge GAUNTLET-0001</Badge>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950 md:text-6xl">
            Build the arena. Score the builders.
          </h1>
          <p className="max-w-2xl text-lg text-slate-700 md:text-xl">
            Gauntlet is a competitive coding platform where vibe coding meets professional
            development. Ship a solution, let the runner score it, and watch the leaderboard
            settle the debate.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg">
              <a href="/challenges">Pick a challenge</a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="/challenges/challenge-001/leaderboard">View leaderboard</a>
            </Button>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <h3 className="text-lg font-semibold text-slate-900">Publish & spec</h3>
            <p className="mt-2 text-sm text-slate-600">
              Challenges live in versioned folders with formal specs, test harnesses, and scoring
              configs.
            </p>
          </Card>
          <Card>
            <h3 className="text-lg font-semibold text-slate-900">Submit & score</h3>
            <p className="mt-2 text-sm text-slate-600">
              Drop a GitHub repo or ZIP. The worker runs official tests and records runtime,
              pass rate, and logs.
            </p>
          </Card>
          <Card>
            <h3 className="text-lg font-semibold text-slate-900">Rank & replay</h3>
            <p className="mt-2 text-sm text-slate-600">
              Leaderboards reward correctness first, then speed. Every score is auditable.
            </p>
          </Card>
        </div>
      </section>
    </main>
  );
}
