import fs from 'node:fs/promises';
import path from 'node:path';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Markdown } from '@/components/Markdown';
import { resolveRepoRoot } from '@/lib/paths';

export const dynamic = 'force-dynamic';

async function loadSpec() {
  const repoRoot = resolveRepoRoot();
  const specPath = path.join(repoRoot, 'docs', 'CHALLENGE_FORMAT_SPEC.md');
  return fs.readFile(specPath, 'utf8');
}

export default async function ChallengeFormatSpecPage() {
  const content = await loadSpec();

  return (
    <main className="px-6 pb-16 md:px-12">
      <section className="mx-auto max-w-4xl space-y-6">
        <div>
          <Badge>v0.1</Badge>
          <h1 className="mt-4 text-3xl font-semibold text-slate-950">
            Challenge Format Specification
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            The canonical structure and constraints for Gauntlet challenges.
          </p>
        </div>

        <Card className="text-sm text-slate-700">
          <div className="markdown">
            <Markdown content={content} />
          </div>
        </Card>
      </section>
    </main>
  );
}
