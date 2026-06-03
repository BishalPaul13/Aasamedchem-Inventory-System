import { notFound } from 'next/navigation';
import Nav from '@/components/Nav';
import ProductForm from '@/components/ProductForm';
import { requireUser } from '@/lib/auth';
import { getProduct } from '@/lib/products';

export default async function EditProductPage({ params }) {
  const user = await requireUser('admin');
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  return (
    <main className="shell">
      <Nav user={user} active="products" />
      <section className="page">
        <p className="eyebrow-text">Inventory</p>
        <h1>Edit product</h1>
        <ProductForm product={product} />
      </section>
    </main>
  );
}
