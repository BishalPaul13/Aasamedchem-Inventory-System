import SubmitButton from './SubmitButton';
import { saveProductAction } from '@/app/actions';

export default function ProductForm({ product }) {
  const isEdit = Boolean(product);
  return (
    <form action={saveProductAction} className="panel stack">
      {isEdit ? <input name="id" type="hidden" value={product.id} /> : null}
      <div className="grid two">
        <label>
          SKU
          <input name="sku" defaultValue={product?.sku || ''} required />
        </label>
        <label>
          Name
          <input name="name" defaultValue={product?.name || ''} required />
        </label>
      </div>
      <div className="grid two">
        <label>
          Category
          <input name="category" defaultValue={product?.category || ''} required />
        </label>
        <label>
          Dimension
          <select name="dimension" defaultValue={product?.dimension || 'weight'}>
            <option value="weight">Weight: base g, order g/kg</option>
            <option value="volume">Volume: base mL, order mL/L</option>
            <option value="count">Count: base unit, order unit</option>
          </select>
        </label>
      </div>
      <label>
        Description
        <textarea name="description" defaultValue={product?.description || ''} rows={3} />
      </label>
      <div className="grid two">
        <label>
          Inventory in base units
          <input name="inventory_base_quantity" defaultValue={product?.inventory_base_quantity || ''} min="0" step="any" type="number" required />
        </label>
        <label>
          INR price per base unit
          <input name="price_per_base_unit_inr" defaultValue={product?.price_per_base_unit_inr || ''} min="0" step="any" type="number" required />
        </label>
      </div>
      <label>
        <span><input defaultChecked={product?.is_active ?? true} name="is_active" style={{ width: 'auto', minHeight: 0 }} type="checkbox" /> Active</span>
      </label>
      <SubmitButton>{isEdit ? 'Update product' : 'Create product'}</SubmitButton>
    </form>
  );
}
