import Link from 'next/link';
import { logoutAction } from '@/app/actions';

export default function Nav({ user, active }) {
  return (
    <header className="topbar">
      <Link className="brand" href={user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/'}>aasamedchem</Link>
      <nav className="nav">
        {user ? (
          <>
            {user.role === 'seller' && (
              <>
                <Link className={active === 'quotes' ? 'active' : ''} href="/seller/quotes">Quotes</Link>
                <Link className={active === 'create-quote' ? 'active' : ''} href="/seller/create-quote">+ Quote</Link>
              </>
            )}
            {user.role === 'buyer' && (
              <>
                <Link className={active === 'buyer-quotes' ? 'active' : ''} href="/buyer/quotes">Quotes</Link>
                <Link className={active === 'dashboard' ? 'active' : ''} href="/dashboard">Orders</Link>
              </>
            )}
            {user.role === 'admin' ? (
              <>
                <Link className={active === 'admin' ? 'active' : ''} href="/admin">Dashboard</Link>
                <Link className={active === 'products' ? 'active' : ''} href="/admin/products">Products</Link>
                <Link className={active === 'admin-orders' ? 'active' : ''} href="/admin/orders">Orders</Link>
                <Link className={active === 'sellers' ? 'active' : ''} href="/admin/sellers">Sellers</Link>
                <Link className={active === 'quotes' ? 'active' : ''} href="/admin/quotes">Quotes</Link>
                <Link className={active === 'disputes' ? 'active' : ''} href="/admin/disputes">Disputes</Link>
              </>
            ) : null}
            <span className="pill">{user.role}</span>
            <form action={logoutAction}><button className="secondary" type="submit">Log out</button></form>
          </>
        ) : (
          <Link className="button" href="/login">Log in</Link>
        )}
      </nav>
    </header>
  );
}
