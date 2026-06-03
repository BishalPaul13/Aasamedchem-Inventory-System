import Link from 'next/link';
import Nav from '@/components/Nav';
import { requireUser } from '@/lib/auth';
import { getSql } from '@/lib/db';
import { formatInr } from '@/lib/units';

export default async function AdminPage() {
  const user = await requireUser('admin');
  const sql = getSql();
  const [stats] = await sql`
    SELECT
      (SELECT count(*) FROM products) AS products,
      (SELECT count(*) FROM orders) AS orders,
      (SELECT coalesce(sum(total_inr), 0) FROM orders) AS total
  `;

  return (
    <main className="shell">
      <Nav user={user} active="admin" />
      <section className="page">
        <h1>Admin</h1>
        <p className="page-intro">Manage catalog data, base-unit inventory, INR rates, and incoming quotations.</p>
        <div className="grid three">
          <div className="panel"><p className="muted small">Products</p><div className="total">{stats.products}</div></div>
          <div className="panel"><p className="muted small">Orders</p><div className="total">{stats.orders}</div></div>
          <div className="panel"><p className="muted small">Quoted value</p><div className="total">{formatInr(stats.total)}</div></div>
        </div>
        <div className="actions" style={{ marginTop: 18 }}>
          <Link className="button" href="/admin/products">Manage products</Link>
          <Link className="button secondary" href="/admin/orders">View orders</Link>
        </div>
      </section>
    </main>
  );
}
