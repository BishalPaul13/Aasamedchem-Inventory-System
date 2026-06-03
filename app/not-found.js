import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import Nav from '@/components/Nav';

export default async function NotFound() {
  const user = await getCurrentUser();

  return (
    <main className="shell">
      <Nav user={user} />
      <section className="page">
        <h1>Page not found</h1>
        <p className="page-intro">The page you requested does not exist.</p>
        <Link className="button" href={user ? '/dashboard' : '/'}>Go back home</Link>
      </section>
    </main>
  );
}
