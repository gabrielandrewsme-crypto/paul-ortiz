import { redirect } from 'next/navigation';
import { getSessionUser } from '@/src/lib/auth';
import DashboardClient from './dashboard-client';

export default async function Home() {
  const session = await getSessionUser();

  if (!session) {
    redirect('/login');
  }

  return (
    <main style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <DashboardClient />
    </main>
  );
}
