import Link from 'next/link';
import Nav from '@/components/Nav';
import { deleteProductAction } from '@/app/actions';
import { requireUser } from '@/lib/auth';
import { listProducts } from '@/lib/products';
import { formatInr, formatQuantity } from '@/lib/units';

export default async function AdminProductsPage() {
  const user = await requireUser('admin');
  const products = await listProducts({ activeOnly: false });

  return (
    <main className="shell">
      <Nav user={user} active="products" />
      <section className="page">
        <div className="summary">
          <div>
            <h1>Products</h1>
            <p className="page-intro">Catalog entries use base units for inventory and pricing.</p>
          </div>
          <Link className="button" href="/admin/products/new">New product</Link>
        </div>
        <div className="panel" style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Dimension</th>
                <th>Inventory</th>
                <th>Base price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td><strong>{product.name}</strong><br /><span className="muted small">{product.sku} · {product.category}</span></td>
                  <td>{product.dimension}</td>
                  <td>{formatQuantity(product.inventory_base_quantity, product.base_unit)}</td>
                  <td>{formatInr(product.price_per_base_unit_inr)} / {product.base_unit}</td>
                  <td>{product.is_active ? 'Active' : 'Inactive'}</td>
                  <td>
                    <div className="actions">
                      <Link className="button secondary" href={`/admin/products/${product.id}`}>Edit</Link>
                      <form action={deleteProductAction}>
                        <input name="id" type="hidden" value={product.id} />
                        <button className="danger" type="submit">Deactivate</button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
