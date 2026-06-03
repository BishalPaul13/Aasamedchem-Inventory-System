'use client';

import { useActionState } from 'react';
import { createQuoteAction } from '@/app/actions';
import SubmitButton from '@/components/SubmitButton';

export default function CreateQuoteForm({ products, buyers }) {
  const [state, action] = useActionState(createQuoteAction, {});

  return (
    <form action={action} className="stack">
      <h2>Create Quote</h2>

      {state?.error && (
        <div className="error">{state.error}</div>
      )}

      <label>
        Buyer
        <select name="buyer_id" required>
          <option value="">Select a buyer...</option>
          {buyers.map(buyer => (
            <option key={buyer.id} value={buyer.id}>{buyer.name} ({buyer.email})</option>
          ))}
        </select>
      </label>

      <label>
        Delivery Date
        <input type="date" name="delivery_date" required />
      </label>

      <label>
        Delivery Terms
        <textarea name="delivery_terms" placeholder="e.g., Free shipping, COD available" required />
      </label>

      <label>
        Quote Validity (days)
        <input type="number" name="validity_days" defaultValue="7" min="1" />
      </label>

      <h3>Products</h3>
      <div className="stack">
        {products.map(product => (
          <div key={product.id} className="panel">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '12px', alignItems: 'center' }}>
              <div>
                <strong>{product.name}</strong>
                <div className="small muted">SKU: {product.sku}</div>
              </div>
              <input 
                type="number" 
                name={`quantity_${product.id}`}
                placeholder="Qty"
                step="0.01"
                min="0"
              />
              <select name={`unit_${product.id}`}>
                <option value="">Unit</option>
                <option value={product.base_unit}>{product.base_unit}</option>
              </select>
              <input 
                type="number" 
                name={`price_${product.id}`}
                placeholder="Price/unit"
                step="0.01"
                min="0"
              />
            </div>
          </div>
        ))}
      </div>

      <SubmitButton className="button">Create Quote</SubmitButton>
    </form>
  );
}
