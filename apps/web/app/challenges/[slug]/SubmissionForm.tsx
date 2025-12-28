'use client';

import type { FormEvent } from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const methodOptions = [
  { value: 'VIBE', label: 'Vibe coding' },
  { value: 'PRO', label: 'Professional dev' },
  { value: 'MIXED', label: 'Mixed' },
  { value: 'OTHER', label: 'Other' },
];

const submitTypeOptions = [
  { value: 'GITHUB_REPO', label: 'GitHub repo URL' },
  { value: 'ZIP_UPLOAD', label: 'ZIP upload' },
];

export function SubmissionForm({ challengeSlug }: { challengeSlug: string }) {
  const [submitType, setSubmitType] = useState('GITHUB_REPO');
  const [status, setStatus] = useState<string | null>(null);
  const [submissionId, setSubmissionId] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('Submitting...');
    setSubmissionId(null);

    const formData = new FormData(event.currentTarget);
    formData.set('challengeSlug', challengeSlug);

    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        body: formData,
      });

      const payload = await response.json();

      if (!response.ok) {
        setStatus(payload?.error || 'Submission failed');
        return;
      }

      setStatus('Queued for scoring.');
      setSubmissionId(payload.id);
      event.currentTarget.reset();
      setSubmitType('GITHUB_REPO');
    } catch (error) {
      setStatus('Submission failed.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="displayName">Display name</Label>
          <Input id="displayName" name="displayName" placeholder="Ada Lovelace" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="selfReportedMinutes">Self-reported minutes</Label>
          <Input
            id="selfReportedMinutes"
            name="selfReportedMinutes"
            type="number"
            min="0"
            placeholder="90"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="methodUsed">Method used</Label>
        <select
          id="methodUsed"
          name="methodUsed"
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900"
          defaultValue="VIBE"
        >
          {methodOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="submitType">Submission type</Label>
        <select
          id="submitType"
          name="submitType"
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900"
          value={submitType}
          onChange={(event) => setSubmitType(event.target.value)}
        >
          {submitTypeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {submitType === 'GITHUB_REPO' ? (
        <div className="space-y-2">
          <Label htmlFor="repoUrl">GitHub repo URL</Label>
          <Input
            id="repoUrl"
            name="repoUrl"
            type="url"
            placeholder="https://github.com/you/solution"
            required
          />
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="zipFile">Upload ZIP</Label>
          <Input id="zipFile" name="zipFile" type="file" accept=".zip" required />
        </div>
      )}

      <Button type="submit">Submit for scoring</Button>

      {status && (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
          <p>{status}</p>
          {submissionId ? (
            <a
              href={`/submissions/${submissionId}`}
              className="mt-2 inline-flex text-sm font-semibold text-amber-600"
            >
              View submission ->
            </a>
          ) : null}
        </div>
      )}
    </form>
  );
}
