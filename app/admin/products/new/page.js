import Nav from '@/components/Nav';
import ProductForm from '@/components/ProductForm';
import { requireUser } from '@/lib/auth';

export default async function NewProductPage() {
  const user = await requireUser('admin');
  return (
    <main className="shell">
      <Nav user={user} active="products" />
      <section className="page">
        <p className="eyebrow-text">Inventory</p>
        <h1>New product</h1>
        <ProductForm />
      </section>
    </main>
  );
}
