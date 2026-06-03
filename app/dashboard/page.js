import Nav from '@/components/Nav';
import OrderBuilder from '@/components/OrderBuilder';
import { requireUser } from '@/lib/auth';
import { listCategories, listProducts } from '@/lib/products';

export default async function DashboardPage({ searchParams }) {
  const params = await searchParams;
  const user = await requireUser();
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
        <h1>Browse products</h1>
        <p className="page-intro">Search products, enter an order quantity in any compatible unit, and review the conversion before placing a quotation.</p>
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
