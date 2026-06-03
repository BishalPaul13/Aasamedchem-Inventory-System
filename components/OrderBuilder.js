'use client';

import { useMemo, useState } from 'react';
import { placeOrderAction } from '@/app/actions';
import { calculateLineTotal, formatInr, formatQuantity, getAllowedUnits, toBaseQuantity, unitToBaseFactor } from '@/lib/units';
import SubmitButton from './SubmitButton';

export default function OrderBuilder({ products, user, error }) {
  const [lines, setLines] = useState({});

  function update(productId, patch) {
    setLines((current) => ({
      ...current,
      [productId]: { ...(current[productId] || {}), ...patch }
    }));
  }

  const totals = useMemo(() => {
    let total = 0;
    const byProduct = {};
    for (const product of products) {
      const line = lines[product.id] || {};
      if (!line.quantity) continue;
      try {
        const unit = line.unit || getAllowedUnits(product.dimension)[0];
        const baseQuantity = toBaseQuantity(line.quantity, unit);
        const lineTotal = calculateLineTotal(product.price_per_base_unit_inr, line.quantity, unit);
        byProduct[product.id] = { baseQuantity, lineTotal, unit };
        total += lineTotal;
      } catch {
        byProduct[product.id] = { error: true };
      }
    }
    return { total, byProduct };
  }, [lines, products]);

  return (
    <form action={placeOrderAction}>
      <input name="customer_name" type="hidden" value={user.name} />
      {error ? <p className="error">{error}</p> : null}
      <div className="product-list">
        {products.map((product) => {
          const units = getAllowedUnits(product.dimension);
          const currentUnit = lines[product.id]?.unit || units[0];
          const calculated = totals.byProduct[product.id];
          const displayPrice = Number(product.price_per_base_unit_inr) * Number(unitToBaseFactor[currentUnit]);

          return (
            <div className="card product-card" key={product.id}>
              <input name="product_id" type="hidden" value={product.id} />
              <div>
                <strong>{product.name}</strong>
                <p className="muted small">{product.sku} · {product.category}</p>
                <p className="small">{product.description}</p>
                <span className="pill">{product.dimension}</span>
              </div>
              <div>
                <p className="muted small">Available</p>
                <strong>{formatQuantity(product.inventory_base_quantity, product.base_unit)}</strong>
              </div>
              <label>
                Quantity
                <input
                  min="0"
                  name={`quantity_${product.id}`}
                  onChange={(event) => update(product.id, { quantity: event.target.value })}
                  placeholder="0"
                  step="any"
                  type="number"
                />
              </label>
              <label>
                Unit
                <select
                  name={`unit_${product.id}`}
                  onChange={(event) => update(product.id, { unit: event.target.value })}
                  value={currentUnit}
                >
                  {units.map((unit) => <option key={unit}>{unit}</option>)}
                </select>
              </label>
              <div>
                <p className="muted small">Rate in selected unit</p>
                <strong>{formatInr(displayPrice)} / {currentUnit}</strong>
              </div>
              <div>
                <p className="muted small">Base conversion</p>
                <strong>{calculated?.baseQuantity ? formatQuantity(calculated.baseQuantity, product.base_unit) : '-'}</strong>
              </div>
              <div>
                <p className="muted small">Line total</p>
                <strong>{calculated?.lineTotal ? formatInr(calculated.lineTotal) : '-'}</strong>
              </div>
            </div>
          );
        })}
      </div>
      <div className="summary panel">
        <div>
          <p className="muted small">Quotation total</p>
          <div className="total">{formatInr(totals.total)}</div>
        </div>
        <SubmitButton>Place quotation</SubmitButton>
      </div>
    </form>
  );
}
