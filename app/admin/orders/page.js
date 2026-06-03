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
        <h1>Incoming orders</h1>
        <p className="page-intro">Every line item preserves the ordered unit, converted base quantity, stored base rate, and INR total.</p>
        <OrdersTable orders={orders} admin />
      </section>
    </main>
  );
}
