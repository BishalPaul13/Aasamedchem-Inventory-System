import Nav from '@/components/Nav';
import OrdersTable from '@/components/OrdersTable';
import { requireUser } from '@/lib/auth';
import { listOrders } from '@/lib/orders';

export default async function AdminOrdersPage() {
  const user = await requireUser('admin');
  const orders = await listOrders();

  return (
    <main className="shell">
      <Nav user={user} active="admin-orders" />
      <section className="page">
        <div className="page-heading">
          <div>
            <p className="eyebrow-text">Admin dashboard</p>
            <h1>Order queue</h1>
          </div>
          <p className="page-note">Review totals, units, and status.</p>
        </div>
        <OrdersTable orders={orders} admin />
      </section>
    </main>
  );
}
