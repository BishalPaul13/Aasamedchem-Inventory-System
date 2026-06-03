import Link from 'next/link';
import { logoutAction } from '@/app/actions';

export default function Nav({ user, active }) {
  return (
    <header className="topbar">
      <Link className="brand" href={user ? (user.role === 'admin' ? '/admin' : user.role === 'seller' ? '/seller/quotes' : '/buyer/quotes') : '/'}>aasamedchem</Link>
      <nav className="nav">
        {user ? (
          <>
            {user.role === 'seller' && (
              <>
                <Link className={active === 'seller-quotes' ? 'active' : ''} href="/seller/quotes">Sent quotes</Link>
                <Link className={active === 'seller-create' ? 'active' : ''} href="/seller/create-quote">New quote</Link>
                <Link className={active === 'seller-profile' ? 'active' : ''} href="/seller/profile">Profile</Link>
              </>
            )}
            {user.role === 'buyer' && (
              <>
                <Link className={active === 'buyer-quotes' ? 'active' : ''} href="/buyer/quotes">Seller quotes</Link>
                <Link className={active === 'dashboard' ? 'active' : ''} href="/dashboard">Request items</Link>
                <Link className={active === 'orders' ? 'active' : ''} href="/orders">Orders</Link>
              </>
            )}
            {user.role === 'admin' ? (
              <>
                <Link className={active === 'admin' ? 'active' : ''} href="/admin">Overview</Link>
                <Link className={active === 'products' ? 'active' : ''} href="/admin/products">Inventory</Link>
                <Link className={active === 'admin-orders' ? 'active' : ''} href="/admin/orders">Orders</Link>
                <Link className={active === 'admin-sellers' ? 'active' : ''} href="/admin/sellers">Seller approval</Link>
                <Link className={active === 'admin-quotes' ? 'active' : ''} href="/admin/quotes">Quote review</Link>
                <Link className={active === 'admin-disputes' ? 'active' : ''} href="/admin/disputes">Disputes</Link>
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
