import { AppShell } from '@/components/AppShell';

export default function ConsoleLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <AppShell theme="console">{children}</AppShell>;
}
