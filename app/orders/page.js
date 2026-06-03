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
        <h1>My orders</h1>
        <p className="page-intro">Review placed quotations and their current status.</p>
        <OrdersTable orders={orders} admin={false} />
      </section>
    </main>
  );
}
