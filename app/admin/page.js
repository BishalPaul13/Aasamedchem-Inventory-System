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
        <div className="page-heading">
          <div>
            <p className="eyebrow-text">Admin dashboard</p>
            <h1>Operations</h1>
          </div>
          <p className="page-note">Inventory, pricing, and order status.</p>
        </div>
        <div className="grid three">
          <div className="panel stat-panel"><p className="muted small">Catalog</p><div className="total">{stats.products}</div></div>
          <div className="panel stat-panel"><p className="muted small">Orders</p><div className="total">{stats.orders}</div></div>
          <div className="panel stat-panel"><p className="muted small">Quoted value</p><div className="total">{formatInr(stats.total)}</div></div>
        </div>
        <div className="actions" style={{ marginTop: 18 }}>
          <Link className="button" href="/admin/products">Inventory</Link>
          <Link className="button secondary" href="/admin/orders">Order queue</Link>
        </div>
      </section>
    </main>
  );
}
