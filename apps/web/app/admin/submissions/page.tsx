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
            <h1 className="text-xl font-semibold text-slate-900">Unauthorized</h1>
            <p className="mt-2 text-sm text-slate-600">
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
            <h1 className="mt-4 text-3xl font-semibold text-slate-950">Submissions</h1>
          </div>
          <p className="text-sm text-slate-600">{submissions.length} entries</p>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="py-3">Created</th>
                  <th className="py-3">Challenge</th>
                  <th className="py-3">Name</th>
                  <th className="py-3">Status</th>
                  <th className="py-3">Type</th>
                  <th className="py-3">Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {submissions.map((submission) => (
                  <tr key={submission.id} className="text-slate-700">
                    <td className="py-3">
                      {submission.createdAt.toISOString().slice(0, 19).replace('T', ' ')}
                    </td>
                    <td className="py-3">{submission.challenge.slug}</td>
                    <td className="py-3">{submission.displayName}</td>
                    <td className="py-3">{submission.status}</td>
                    <td className="py-3">{submission.submitType}</td>
                    <td className="py-3">
                      <a
                        className="text-amber-600 hover:text-amber-500"
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
