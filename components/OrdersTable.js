import Link from 'next/link';
import { updateOrderStatusAction } from '@/app/actions';
import { formatInr } from '@/lib/units';

export default function OrdersTable({ orders, admin = false }) {
  return (
    <div className="panel" style={{ overflowX: 'auto' }}>
      <table>
        <thead>
          <tr>
            <th>Order</th>
            <th>Customer</th>
            <th>Status</th>
            <th>Total</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td><Link href={`/orders/${order.id}`}><strong>{order.id.slice(0, 8)}</strong></Link></td>
              <td>{order.customer_name}<br /><span className="muted small">{order.user_email}</span></td>
              <td>{admin ? (
                <form action={updateOrderStatusAction} className="actions">
                  <input name="id" type="hidden" value={order.id} />
                  <select name="status" defaultValue={order.status} style={{ width: 140 }}>
                    <option value="quoted">Quoted</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                    <option value="fulfilled">Fulfilled</option>
                  </select>
                  <button className="secondary" type="submit">Update</button>
                </form>
              ) : order.status}</td>
              <td>{formatInr(order.total_inr)}</td>
              <td>{new Date(order.created_at).toLocaleString('en-IN')}</td>
              <td><Link className="button secondary" href={`/orders/${order.id}`}>View</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
      {orders.length === 0 ? <p className="muted">No orders yet.</p> : null}
    </div>
  );
}
