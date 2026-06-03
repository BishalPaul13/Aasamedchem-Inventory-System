import { notFound, redirect } from 'next/navigation';
import Nav from '@/components/Nav';
import { requireUser } from '@/lib/auth';
import { getOrder } from '@/lib/orders';
import { formatInr, formatQuantity } from '@/lib/units';

export default async function OrderDetailPage({ params }) {
  const user = await requireUser();
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) notFound();
  if (user.role !== 'admin' && order.user_id !== user.id) redirect('/orders');

  return (
    <main className="shell">
      <Nav user={user} active="orders" />
      <section className="page">
        <h1>Order {order.id.slice(0, 8)}</h1>
        <p className="page-intro">Placed by {order.customer_name} on {new Date(order.created_at).toLocaleString('en-IN')} · Status: {order.status}</p>
        <div className="panel" style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Ordered</th>
                <th>Converted base quantity</th>
                <th>Base rate</th>
                <th>Line total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.product_snapshot.name}</strong><br />
                    <span className="muted small">{item.product_snapshot.sku} · {item.product_snapshot.category}</span>
                  </td>
                  <td>{formatQuantity(item.ordered_quantity, item.ordered_unit)}</td>
                  <td>{formatQuantity(item.base_quantity, item.product_snapshot.baseUnit)}</td>
                  <td>{formatInr(item.price_per_base_unit_inr)} / {item.product_snapshot.baseUnit}</td>
                  <td>{formatInr(item.line_total_inr)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="summary panel">
          <span className="muted">Quotation total</span>
          <span className="total">{formatInr(order.total_inr)}</span>
        </div>
      </section>
    </main>
  );
}
