import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';

export default function Home() {
  return (
    <main className="px-6 pb-16 md:px-12">
      <section className="mx-auto flex max-w-6xl flex-col gap-12">
        <div className="flex flex-col gap-6 reveal">
          <Badge>Challenge GAUNTLET-0001</Badge>
          <h1 className="text-4xl font-semibold tracking-tight text-[color:var(--text)] md:text-6xl">
            Build the arena. Score the builders.
          </h1>
          <p className="max-w-2xl text-[1.15rem] leading-[1.6] text-[color:var(--muted)] md:text-[1.25rem]">
            Gauntlet is a competitive coding platform where vibe coding meets professional
            development. Ship a solution, let the runner score it, and watch the leaderboard
            settle the debate.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg">
              <Link href="/challenges">Pick a challenge</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/leaderboard">View leaderboard</Link>
            </Button>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <GlassCard className="reveal reveal-delay-1">
            <h3 className="text-lg font-semibold text-[color:var(--text)]">Publish & spec</h3>
            <p className="mt-2 text-[0.95rem] leading-[1.6] text-[color:var(--muted)]">
              Challenges live in versioned folders with formal specs, test harnesses, and scoring
              configs.
            </p>
          </GlassCard>
          <GlassCard className="reveal reveal-delay-2">
            <h3 className="text-lg font-semibold text-[color:var(--text)]">Submit & score</h3>
            <p className="mt-2 text-[0.95rem] leading-[1.6] text-[color:var(--muted)]">
              Drop a GitHub repo or ZIP. The runner runs official tests and records runtime,
              pass rate, and logs.
            </p>
          </GlassCard>
          <GlassCard className="reveal reveal-delay-3">
            <h3 className="text-lg font-semibold text-[color:var(--text)]">Rank & replay</h3>
            <p className="mt-2 text-[0.95rem] leading-[1.6] text-[color:var(--muted)]">
              Leaderboards reward correctness first, then speed. Every score is auditable.
            </p>
          </GlassCard>
        </div>
      </section>
    </main>
  );
}
