import { redirect } from 'next/navigation';
import { getSessionUser } from '@/src/lib/auth';
import DashboardClient from './dashboard-client';

export default async function Home() {
  const session = await getSessionUser();

  if (!session) {
    redirect('/login');
  }

  return (
    <main className="w-full min-h-screen flex justify-center items-start overflow-x-hidden px-0 sm:px-4 py-2 sm:py-6">
      <DashboardClient />
    </main>
  );
}
