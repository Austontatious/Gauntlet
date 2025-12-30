import { AppShell } from '@/components/AppShell';

export default function ArenaLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <AppShell theme="arena">{children}</AppShell>;
}
