import fs from 'node:fs/promises';
import path from 'node:path';
import { resolveRepoRoot } from './paths';

export const MAX_ZIP_BYTES = 20 * 1024 * 1024;

export async function saveZipFile(file: File, submissionId: string) {
  const repoRoot = resolveRepoRoot();
  const uploadsDir = process.env.UPLOADS_DIR
    ? path.resolve(repoRoot, process.env.UPLOADS_DIR)
    : path.resolve(repoRoot, 'data/uploads');

  await fs.mkdir(uploadsDir, { recursive: true });

  const filePath = path.join(uploadsDir, `${submissionId}.zip`);
  const arrayBuffer = await file.arrayBuffer();
  await fs.writeFile(filePath, Buffer.from(arrayBuffer));

  return filePath;
}
