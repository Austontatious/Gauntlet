import { headers } from 'next/headers';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function AdminSubmissionsPage({
  searchParams,
}: {
  searchParams: { token?: string; status?: string };
}) {
  const headerList = await headers();
  const token = searchParams.token || headerList.get('x-admin-token');

  if (!token || token !== process.env.ADMIN_TOKEN) {
    return (
      <main className="px-6 pb-16 md:px-12">
        <section className="mx-auto max-w-3xl">
          <Card>
            <h1 className="text-xl font-semibold text-[color:var(--text)]">
              Unauthorized
            </h1>
            <p className="mt-2 text-sm text-[color:var(--muted)]">
              Provide a valid ADMIN_TOKEN via ?token= or x-admin-token header.
            </p>
          </Card>
        </section>
      </main>
    );
  }

  const statusFilter = searchParams.status?.toUpperCase();
  const where = statusFilter
    ? { status: statusFilter as 'QUEUED' | 'RUNNING' | 'COMPLETE' | 'FAILED' }
    : undefined;

  const submissions = await prisma.submission.findMany({
    where,
    include: { challenge: true },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  return (
    <main className="px-6 pb-16 md:px-12">
      <section className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Badge>Admin</Badge>
            <h1 className="mt-4 text-3xl font-semibold text-[color:var(--text)]">
              Submissions
            </h1>
          </div>
          <p className="text-sm text-[color:var(--muted)]">
            {submissions.length} entries
          </p>
        </div>

        <Card className="overflow-hidden">
          <div className="max-h-[600px] overflow-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 z-10 bg-[color:var(--panel-2)] text-xs uppercase tracking-[0.2em] text-[color:var(--muted)] backdrop-blur">
                <tr>
                  <th className="py-3">Created</th>
                  <th className="py-3">Challenge</th>
                  <th className="py-3">Name</th>
                  <th className="py-3">Status</th>
                  <th className="py-3">Type</th>
                  <th className="py-3">Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--border)]">
                {submissions.map((submission) => (
                  <tr
                    key={submission.id}
                    className="text-[color:var(--text)] odd:bg-[color:var(--panel-2)] hover:bg-[color:var(--bg-2)]"
                  >
                    <td className="py-3">
                      {submission.createdAt.toISOString().slice(0, 19).replace('T', ' ')}
                    </td>
                    <td className="py-3 text-[color:var(--muted)]">
                      {submission.challenge.slug}
                    </td>
                    <td className="py-3">{submission.displayName}</td>
                    <td className="py-3 text-[color:var(--muted)]">
                      {submission.status}
                    </td>
                    <td className="py-3 text-[color:var(--muted)]">
                      {submission.submitType}
                    </td>
                    <td className="py-3">
                      <a
                        className="text-[color:var(--primary)] hover:text-[color:var(--primary-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--bg)]"
                        href={`/submissions/${submission.id}`}
                      >
                        view
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </main>
  );
}
