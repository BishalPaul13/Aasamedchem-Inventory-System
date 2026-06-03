import Nav from '@/components/Nav';
import OrderBuilder from '@/components/OrderBuilder';
import { requireUser } from '@/lib/auth';
import { listCategories, listProducts } from '@/lib/products';
import { redirect } from 'next/navigation';

export default async function DashboardPage({ searchParams }) {
  const params = await searchParams;
  const user = await requireUser();
  if (user.role === 'admin') redirect('/admin');
  if (user.role === 'seller') redirect('/seller/quotes');
  const q = params?.q || '';
  const category = params?.category || '';
  const [products, categories] = await Promise.all([
    listProducts({ q, category }),
    listCategories()
  ]);

  return (
    <main className="shell">
      <Nav user={user} active="dashboard" />
      <section className="page">
        <div className="page-heading">
          <div>
            <p className="eyebrow-text">Buyer workspace</p>
            <h1>Request items</h1>
          </div>
          <p className="page-note">Select products and quantities before comparing seller quotes.</p>
        </div>
        <form className="toolbar">
          <label>
            Search
            <input defaultValue={q} name="q" placeholder="Name, SKU, category" />
          </label>
          <label>
            Category
            <select defaultValue={category} name="category">
              <option value="">All categories</option>
              {categories.map((row) => <option key={row.category}>{row.category}</option>)}
            </select>
          </label>
          <button className="secondary" type="submit">Filter</button>
        </form>
        <OrderBuilder error={params?.error} products={products} user={user} />
      </section>
    </main>
  );
}
