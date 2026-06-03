import { redirect } from 'next/navigation';
import LoginForm from '@/components/LoginForm';
import Nav from '@/components/Nav';
import { getCurrentUser } from '@/lib/auth';

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(user.role === 'admin' ? '/admin' : '/dashboard');

  return (
    <main className="shell">
      <Nav user={null} />
      <section className="page grid two">
        <div>
          <h1>Log in</h1>
          <p className="page-intro">Use a seller account to place quotations or an admin account to manage products and review incoming orders.</p>
        </div>
        <LoginForm />
      </section>
    </main>
  );
}
