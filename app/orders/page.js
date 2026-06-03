import Nav from '@/components/Nav';
import OrdersTable from '@/components/OrdersTable';
import { requireUser } from '@/lib/auth';
import { listOrders } from '@/lib/orders';

export default async function OrdersPage() {
  const user = await requireUser();
  const orders = await listOrders({ userId: user.role === 'admin' ? undefined : user.id });

  return (
    <main className="shell">
      <Nav user={user} active="orders" />
      <section className="page">
        <div className="page-heading">
          <div>
            <p className="eyebrow-text">{user.role} dashboard</p>
            <h1>Orders</h1>
          </div>
          <p className="page-note">Your quote history and status.</p>
        </div>
        <OrdersTable orders={orders} admin={false} />
      </section>
    </main>
  );
}
