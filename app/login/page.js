import { redirect } from 'next/navigation';
import LoginForm from '@/components/LoginForm';
import { getCurrentUser } from '@/lib/auth';

export const revalidate = 0;

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user?.role === 'admin') redirect('/admin');
  if (user?.role === 'seller') redirect('/seller/quotes');
  if (user?.role === 'buyer') redirect('/buyer/quotes');

  return (
    <main className="login-page-wrap">
      {/* Decorative blobs for mesh gradient background */}
      <div className="login-bg-blob login-bg-blob-1" />
      <div className="login-bg-blob login-bg-blob-2" />
      
      <div className="login-card">
        <div className="login-brand">
          <div className="login-logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="18" r="3" />
              <circle cx="12" cy="6" r="3" />
              <circle cx="18" cy="6" r="3" />
              <line x1="9" y1="18" x2="15" y2="18" />
              <line x1="12" y1="9" x2="12" y2="15" />
              <line x1="13.5" y1="8.5" x2="16.5" y2="15.5" />
              <line x1="12" y1="6" x2="15" y2="6" />
            </svg>
          </div>
          <h1 className="login-title">aasamedchem</h1>
          <p className="login-subtitle">Inventory & Quotation Portal</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
