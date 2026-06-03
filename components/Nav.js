import Link from 'next/link';
import { logoutAction } from '@/app/actions';

export default function Nav({ user, active }) {
  return (
    <header className="topbar">
      <Link className="brand" href={user ? '/dashboard' : '/'}>Aasa MedChem</Link>
      <nav className="nav">
        {user ? (
          <>
            <Link className={active === 'dashboard' ? 'active' : ''} href="/dashboard">Browse</Link>
            <Link className={active === 'orders' ? 'active' : ''} href="/orders">My orders</Link>
            {user.role === 'admin' ? (
              <>
                <Link className={active === 'admin' ? 'active' : ''} href="/admin">Admin</Link>
                <Link className={active === 'products' ? 'active' : ''} href="/admin/products">Products</Link>
                <Link className={active === 'admin-orders' ? 'active' : ''} href="/admin/orders">Orders</Link>
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
