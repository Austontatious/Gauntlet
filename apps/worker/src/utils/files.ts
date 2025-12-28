import fs from 'node:fs/promises';
import path from 'node:path';

export async function ensureDir(target: string) {
  await fs.mkdir(target, { recursive: true });
}

export async function copyDir(source: string, target: string) {
  await ensureDir(target);
  const entries = await fs.readdir(source, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);

    if (entry.isDirectory()) {
      await copyDir(sourcePath, targetPath);
    } else if (entry.isFile()) {
      await fs.copyFile(sourcePath, targetPath);
    }
  }
}

export function tailLines(value: string, maxLines: number) {
  const lines = value.split(/\r?\n/);
  return lines.slice(Math.max(lines.length - maxLines, 0)).join('\n');
}
