'use client';

import { useActionState } from 'react';
import { createQuoteAction } from '@/app/actions';
import SubmitButton from '@/components/SubmitButton';

export default function CreateQuoteForm({ products, buyers, prefilledBuyer, prefilledProducts }) {
  const [state, action] = useActionState(createQuoteAction, {});

  // Create a map of prefilledProducts for quick lookup
  const prefilledMap = new Map(prefilledProducts?.map(p => [p.id, p]) || []);

  return (
    <form action={action} className="stack">
      <h2>Quote details</h2>

      {state?.error && (
        <div className="error">{state.error}</div>
      )}

      <label>
        Buyer
        <select name="buyer_id" required defaultValue={prefilledBuyer?.id || ''}>
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
        <textarea name="delivery_terms" placeholder="Freight, payment terms, handling notes" required />
      </label>

      <label>
        Quote Validity (days)
        <input type="number" name="validity_days" defaultValue="7" min="1" />
      </label>

      <h3>Line items</h3>
      {prefilledProducts && prefilledProducts.length > 0 && (
        <div className="panel" style={{ backgroundColor: '#f0fdf4', borderLeft: '4px solid #22c55e' }}>
          <p className="muted" style={{ margin: 0 }}>
            ℹ️ This quote is based on a buyer request. Suggested quantities are shown below. Adjust prices as needed.
          </p>
        </div>
      )}
      <div className="stack">
        {products.map(product => {
          const prefilled = prefilledMap.get(product.id);
          const isFromRequest = !!prefilled;
          
          return (
            <div key={product.id} className={`panel ${isFromRequest ? 'highlight' : ''}`} style={isFromRequest ? { backgroundColor: '#fef9e7', borderLeft: '4px solid #eab308' } : {}}>
              <input type="hidden" name="product_id" value={product.id} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '12px', alignItems: 'center' }}>
                <div>
                  <strong>{product.name}</strong>
                  <div className="small muted">SKU: {product.sku}</div>
                  {isFromRequest && <div className="small muted">📋 Requested</div>}
                </div>
                <input 
                  type="number" 
                  name={`quantity_${product.id}`}
                  placeholder="Qty"
                  step="0.01"
                  min="0"
                  defaultValue={prefilled?.suggested_quantity || ''}
                />
                <select name={`unit_${product.id}`} defaultValue={prefilled?.suggested_unit || ''}>
                  <option value="">Unit</option>
                  <option value={product.base_unit}>{product.base_unit}</option>
                </select>
                <input 
                  type="number" 
                  name={`price_${product.id}`}
                  placeholder="INR/unit"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
          );
        })}
      </div>

      <SubmitButton className="button">Save quote</SubmitButton>
    </form>
  );
}
