import { test, expect } from '@playwright/test';

test('homepage loads', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Build the arena/i })).toBeVisible();
});

test('challenge submission can be created', async ({ page }) => {
  await page.goto('/challenges/challenge-001');
  await expect(page.getByRole('heading', { name: /Challenge 001/i })).toBeVisible();

  await page.getByLabel('Display name').fill('Test Runner');
  await page.getByLabel('Self-reported minutes').fill('12');
  await page.getByLabel('GitHub repo URL').fill('https://github.com/octocat/Hello-World');

  await page.getByRole('button', { name: /Submit for scoring/i }).click();
  await expect(page.getByText(/Queued for scoring/i)).toBeVisible();
});
